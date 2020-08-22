import { formatISO, parseISO } from "date-fns";

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
  close_approach_date_full: string | null;
  epoch_date_close_approach: string | null;
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

export type NeoSortKey = keyof typeof neoSortKeyGetters;

export const neoSortKeyGetters = {
  distance: (neo: NearEarthObject) =>
    Number(neo.close_approach_data[0].miss_distance.kilometers),
  diameter: (neo: NearEarthObject) =>
    neo.estimated_diameter.meters.estimated_diameter_max,
  name: (neo: NearEarthObject) => neo.name,
  date: (neo: NearEarthObject): number => {
    if (neo.close_approach_data[0].epoch_date_close_approach !== null) {
      return Number(neo.close_approach_data[0].epoch_date_close_approach);
    }
    return parseISO(
      neo.close_approach_data[0].close_approach_date + "T00:00Z"
    ).getTime();
  },
};

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
