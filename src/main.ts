import * as fs from "fs/promises";
import { FeatureCollection, Point } from "geojson";

type AQDataProps = { name: string; type: string; pm25: number; validTime: Date };
type AQData = FeatureCollection<Point, AQDataProps>;
type APIResponse = {
  status: "success";
  data: AQData;
};

async function main() {
  const testData = (JSON.parse(await fs.readFile("./testData/aq-data.geojson", "utf-8")) as APIResponse).data;

  console.log(testData.features.length, "features loaded.");
}

await main();
