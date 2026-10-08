import { createApp } from "./app";
import { config } from "./config";
import { loadGeoData } from "./data/loadGeoData";
import { logger } from "./utils/logger";

const started = Date.now();
const geo = loadGeoData(config.geoDataDir);
logger.info({
  msg: "geo data loaded",
  dir: geo.root,
  ms: Date.now() - started,
  heapUsed: process.memoryUsage().heapUsed,
  provinces: geo.provinces.length,
  districts: geo.districts.length,
  neighborhoods: geo.neighborhoods.length,
  streets: geo.streets.length,
  towns: geo.towns.length,
  villages: geo.villages.length,
});

const app = createApp();
app.listen(config.port, () => {
  logger.info({ msg: "server listening", port: config.port });
});
