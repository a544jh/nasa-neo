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
  startDate: string,
  endDate: string
): Promise<NearEarthObject[]> {
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=DEMO_KEY`;
  let response = await (await fetch(url)).json();
  return flattenResponse(response);
}

function flattenResponse(resp: NeoApiResponse): NearEarthObject[] {
  let flattened = [];
  for (let date in resp.near_earth_objects) {
    let neos = resp.near_earth_objects[date];
    flattened.push(...neos);
  }
  return flattened;
}
