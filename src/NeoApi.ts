import { formatISO } from "date-fns";

interface NeoApiResponse {
  near_earth_objects: NeoDates;
}

interface NeoDates {
  [date: string]: NearEarthObject[];
}

export interface NearEarthObject {
  id: string;
  name: string;
  nasa_jpl_url: string;
  close_approach_data: CloseApproachData[];
  estimated_diameter: {
    kilometers: EstimatedDiameter;
    meters: EstimatedDiameter;
    miles: EstimatedDiameter;
    feet: EstimatedDiameter;
  };
  is_potentially_hazardous_asteroid: boolean;
  is_sentry_object: boolean;
}

interface CloseApproachData {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: string;
  relative_velocity: {
    kilometers_per_second: string;
    kilometers_per_hour: string;
    miles_per_hour: string;
  };
  miss_distance: {
    astronomical: string;
    lunar: string;
    kilometers: string;
    miles: string;
  };
  orbiting_body: string;
}

interface EstimatedDiameter {
  estimated_diameter_min: number;
  estimated_diameter_max: number;
}

export async function fetchNeos(
  startDate: Date,
  endDate: Date
): Promise<NearEarthObject[]> {
  const startDateStr = formatISO(startDate, { representation: "date" });
  const endDateStr = formatISO(endDate, { representation: "date" });
  const storedApiKey = window.localStorage.getItem("nasaApiKey");
  const apiKey = storedApiKey === null ? "DEMO_KEY" : storedApiKey;

  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDateStr}&end_date=${endDateStr}&api_key=${apiKey}`;
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error("Failed to fetch NEOs");
  }
  const data = await response.json();
  return flattenResponse(data);
}

function flattenResponse(resp: NeoApiResponse): NearEarthObject[] {
  let flattened = [];
  for (let date in resp.near_earth_objects) {
    let neos = resp.near_earth_objects[date];
    flattened.push(...neos);
  }
  return flattened;
}
