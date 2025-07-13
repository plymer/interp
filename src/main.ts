import * as fs from "fs/promises";
import type { FeatureCollection, Point } from "geojson";

type AQDataProps = { name: string; type: string; pm25: number; validTime: Date | string };
type AQData = FeatureCollection<Point, AQDataProps>;
type APIResponse = {
  status: "success";
  data: AQData;
};

type DataPoint = {
  lat: number;
  lon: number;
  data: number;
};

type Grid = number[][];

type LonLat = { lon: number; lat: number };

/**
 * Calculate the Haversine distance between two points on the Earth given their longitude and latitude.
 * @param start LonLat object with lon and lat properties
 * @param end LonLat object with lon and lat properties
 * @returns the Haversine distance in kilometres between the two points
 */
const hDist = (start: LonLat, end: LonLat): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((end.lat - start.lat) * Math.PI) / 180;
  const dLon = ((end.lon - start.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((start.lat * Math.PI) / 180) * Math.cos((end.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

async function main() {
  const testData = (JSON.parse(await fs.readFile("./testData/aq-data.geojson", "utf-8")) as APIResponse).data;

  console.log(testData.features.length, "features loaded.");

  // get all of our unique valid times
  const validTimes = [...new Set(testData.features.map((feature) => feature.properties.validTime))];

  // lets start arbitrarily at the 0th valid time
  const currentValidTime = validTimes[0];

  // filter the features to only those that match the current valid time and then create a DataPoint array
  const currentFeatures = testData.features
    .filter((feature) => feature.properties.validTime === currentValidTime)
    .reduce<DataPoint[]>((acc, feature) => {
      const [lon, lat] = feature.geometry.coordinates;
      const data = feature.properties.pm25;
      acc.push({ lat, lon, data });
      return acc;
    }, []);

  console.log(
    Math.round(hDist({ lat: 53.3, lon: -113.6 }, { lat: 51.1, lon: -114 })),
    "km between Edmonton and Calgary"
  );
}

await main();
