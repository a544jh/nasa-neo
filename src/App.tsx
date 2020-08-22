import React, { useEffect, useState } from "react";
import {
  Container,
  Header,
  Table,
  Form,
  Dimmer,
  Loader,
  Icon,
  Progress,
  Message,
} from "semantic-ui-react";
import "./App.css";
import "semantic-ui-css/semantic.min.css";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";
import {
  fetchNeos,
  NearEarthObject,
  neoSortKeyGetters,
  NeoSortKey,
} from "./NeoApi";
import { add, startOfToday } from "date-fns";
import { SemanticDatepickerProps } from "react-semantic-ui-datepickers/dist/types";
import _ from "lodash";

function App() {
  const [isLoading, setLoading] = useState(false);
  const [neos, setNeos] = useState<NearEarthObject[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => startOfToday());
  const [endDate, setEndDate] = useState<Date>(() =>
    add(startOfToday(), { days: 7 })
  );
  const [sortKey, setSortKey] = useState<NeoSortKey>("date");
  type SortDirection = "ascending" | "descending";
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    "ascending"
  );
  const [hasError, setError] = useState(false);

  useEffect(() => {
    refreshNeos();
  }, []);

  const refreshNeos = () => {
    setLoading(true);
    fetchNeos(startDate, endDate)
      .then((neos) => {
        setNeos(
          _.orderBy(
            neos,
            neoSortKeyGetters[sortKey],
            sortDirection === "ascending" ? "asc" : "desc"
          )
        );
        setLoading(false);
      })
      .catch((error) => {
        setNeos([]);
        setError(true);
        setLoading(false);
      });
  };

  const onChangeStartDate = (
    event: React.SyntheticEvent | undefined,
    data: SemanticDatepickerProps
  ) => {
    const date = data.value;
    if (date instanceof Date) {
      setStartDate(date);
      setEndDate(add(date, { days: 7 }));
    }
  };

  const onChangeEndDate = (
    event: React.SyntheticEvent | undefined,
    data: SemanticDatepickerProps
  ) => {
    const date = data.value;
    if (date instanceof Date) {
      setEndDate(date);
    }
  };

  const endDateSelectable = (date: Date): boolean => {
    const maxEndDate = add(startDate, { days: 7 });
    return date >= startDate && date <= maxEndDate;
  };


  // TODO: fixed column width
  const onSort = (newSortKey: NeoSortKey) => {
    let newSortDirection: SortDirection;
    if (newSortKey === sortKey) {
      newSortDirection =
        sortDirection === "ascending" ? "descending" : "ascending";
    } else {
      newSortDirection = "ascending";
    }
    setSortKey(newSortKey);
    setSortDirection(newSortDirection);
    setNeos(
      _.orderBy(
        neos,
        neoSortKeyGetters[newSortKey],
        newSortDirection === "ascending" ? "asc" : "desc"
      )
    );
  };

  const maxDiameterNeo = _.maxBy(
    neos,
    (neo) => neo.estimated_diameter.meters.estimated_diameter_max
  );
  const maxDiameter =
    maxDiameterNeo?.estimated_diameter.meters.estimated_diameter_max;

  const maxDistanceNeo = _.maxBy(
    neos,
    (neo) => neo.close_approach_data[0].miss_distance.kilometers
  );
  const maxDistance =
    maxDistanceNeo?.close_approach_data[0].miss_distance.kilometers;

  const SortHeaderCell: React.FC<{ column: NeoSortKey }> = (props) => (
    <Table.HeaderCell
      sorted={props.column === sortKey ? sortDirection : undefined}
      onClick={() => onSort(props.column)}
    >
      {props.children}
    </Table.HeaderCell>
  );

  return (
    <Container style={{ paddingTop: "1rem" }}>
      <Header as="h1">Near Earth Objects</Header>
      <Form>
        <Form.Group inline>
          <SemanticDatepicker
            label="Start date"
            onChange={onChangeStartDate}
            value={startDate}
          />
          <SemanticDatepicker
            label="End date"
            onChange={onChangeEndDate}
            value={endDate}
            filterDate={endDateSelectable}
          />
          <Form.Button onClick={refreshNeos}>
            <Icon name="search" /> Search
          </Form.Button>
        </Form.Group>
      </Form>

      {hasError ? (
        <Message error>
          <Message.Header>Oops, something went wrong!</Message.Header>
          <p>Maybe you want to try again later</p>
        </Message>
      ) : null}

      <Dimmer.Dimmable>
        <Dimmer active={isLoading} verticalAlign="top">
          <Loader />
        </Dimmer>
        <Table celled sortable>
          <Table.Header>
            <Table.Row>
              <SortHeaderCell column="date">Date</SortHeaderCell>
              <SortHeaderCell column="date">Time (UTC)</SortHeaderCell>
              <SortHeaderCell column="name">Name</SortHeaderCell>
              <SortHeaderCell column="diameter">Diameter</SortHeaderCell>
              <SortHeaderCell column="distance">Miss Distance</SortHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {neos.map((neo) => (
              <Table.Row
                key={neo.id}
                negative={neo.is_potentially_hazardous_asteroid}
              >
                <Table.Cell>
                  {neo.close_approach_data[0].close_approach_date}
                </Table.Cell>
                <Table.Cell>
                  {neo.close_approach_data[0].close_approach_date_full}
                </Table.Cell>
                <Table.Cell>{neo.name}</Table.Cell>
                <Table.Cell>
                  {neo.estimated_diameter.meters.estimated_diameter_min.toFixed(
                    1
                  )}
                  {"m - "}
                  {neo.estimated_diameter.meters.estimated_diameter_max.toFixed(
                    1
                  )}
                  m
                  <Progress
                    value={neo.estimated_diameter.meters.estimated_diameter_max}
                    total={maxDiameter}
                    size="tiny"
                    style={{ margin: 0 }}
                  />
                </Table.Cell>
                <Table.Cell>
                  {Number(
                    neo.close_approach_data[0].miss_distance.kilometers
                  ).toFixed(0)}
                  km
                  <Progress
                    value={neo.close_approach_data[0].miss_distance.kilometers}
                    total={maxDistance}
                    size="tiny"
                    style={{ margin: 0 }}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Dimmer.Dimmable>
    </Container>
  );
}

export default App;
