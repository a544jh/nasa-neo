import React, { useEffect, useState } from "react";
import { Container, Header, Table, Form } from "semantic-ui-react";
import "./App.css";
import "semantic-ui-css/semantic.min.css";
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import { fetchNeos, NearEarthObject } from "./NeoApi";
import { formatISO, parseISO, add } from 'date-fns' // TODO: add to package.json

function App() {

  const [neos, setNeos] = useState<NearEarthObject[]>([]);
  const [startDate, setStartDate] = useState<string>('2015-09-07')
  const [endDate, setEndDate] = useState<string>('2015-09-08')
  // TODO date picker for end date_
  // refactor date parsing?

  useEffect(() => {
    let endDate = formatISO(add(parseISO(startDate), {days: 7}), {representation: 'date'})
    fetchNeos(startDate, endDate).then((neos) => {
      setNeos(neos);
      console.log(neos);
    });
  }, [startDate]);

  return (
    <Container>
      <Header as="h1">Hello Semantic UI</Header>
      <Form>
        <SemanticDatepicker label='Start date' onChange={(e, data) => {
          let date = data.value
          if (date instanceof Date) {
            setStartDate(formatISO(date, {representation: 'date'}))
          }
        }}
        value={parseISO(startDate)} />
      </Form>
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
            <Table.Row key={neo.id} negative={neo.is_potentially_hazardous_asteroid}>
              <Table.Cell>
                {neo.close_approach_data[0].close_approach_date}
              </Table.Cell>
              <Table.Cell>
                {neo.close_approach_data[0].close_approach_date_full}
              </Table.Cell>
              <Table.Cell>{neo.name}</Table.Cell>
              <Table.Cell>
                {neo.estimated_diameter.meters.estimated_diameter_min.toFixed(1)} -{" "}
                {neo.estimated_diameter.meters.estimated_diameter_max.toFixed(1)}
              </Table.Cell>
              <Table.Cell>
                {Number(neo.close_approach_data[0].miss_distance.kilometers).toFixed(0)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  );
}

export default App;
