import React, { useEffect, useState } from "react";
import { Header, Table } from "semantic-ui-react";
import "./App.css";
import "semantic-ui-css/semantic.min.css";
import { fetchNeos, NearEarthObject } from "./NeoApi";

function App() {
  const [neos, setNeos] = useState<NearEarthObject[]>([]);

  useEffect(() => {
    fetchNeos("", "").then((neos) => {
      setNeos(neos);
      console.log(neos);
    });
  }, []);

  return (
    <div className="App">
      <Header as="h1">Hello Semantic UI</Header>
      <input type="date"></input>
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
                {neo.estimated_diameter.kilometers.estimated_diameter_min} -{" "}
                {neo.estimated_diameter.kilometers.estimated_diameter_max}
              </Table.Cell>
              <Table.Cell>
                {neo.close_approach_data[0].miss_distance.kilometers}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export default App;
