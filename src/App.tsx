import React, { useEffect, useState } from "react";
import {
  Container,
  Header,
  Table,
  Form,
  Dimmer,
  Loader,
  Segment,
} from "semantic-ui-react";
import "./App.css";
import "semantic-ui-css/semantic.min.css";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";
import { fetchNeos, NearEarthObject } from "./NeoApi";
import { formatISO, parseISO, add } from "date-fns";
import { SemanticDatepickerProps } from "react-semantic-ui-datepickers/dist/types";

function App() {
  const [isLoading, setLoading] = useState(false);
  const [neos, setNeos] = useState<NearEarthObject[]>([]);
  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [endDate, setEndDate] = useState<Date>(() =>
    add(new Date(), { days: 7 })
  );

  useEffect(() => {
    refreshNeos();
  }, []);

  const refreshNeos = () => {
    setLoading(true);
    fetchNeos(startDate, endDate).then((neos) => {
      setNeos(neos);
      setLoading(false);
    });
  };

  const onSetStartDate = (
    event: React.SyntheticEvent | undefined,
    data: SemanticDatepickerProps
  ) => {
    const date = data.value;
    if (date instanceof Date) {
      setStartDate(date);
      setEndDate(add(date, { days: 7 }));
    }
  };

  const onSetEndDate = (
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

  return (
    <Container>
      <Header as="h1">Hello Semantic UI</Header>
      <Form>
        <Form.Group>
          <SemanticDatepicker
            label="Start date"
            onChange={onSetStartDate}
            value={startDate}
          />
          <SemanticDatepicker
            label="End date"
            onChange={onSetEndDate}
            value={endDate}
            filterDate={endDateSelectable}
          />
        </Form.Group>
      </Form>

      <Dimmer.Dimmable>
        <Dimmer active={isLoading} verticalAlign="top">
          <Loader />
        </Dimmer>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Time (UTC)</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Diameter</Table.HeaderCell>
              <Table.HeaderCell>Miss Distance</Table.HeaderCell>
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
                  )}{" "}
                  -{" "}
                  {neo.estimated_diameter.meters.estimated_diameter_max.toFixed(
                    1
                  )}
                </Table.Cell>
                <Table.Cell>
                  {Number(
                    neo.close_approach_data[0].miss_distance.kilometers
                  ).toFixed(0)}
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
