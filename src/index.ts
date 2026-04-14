import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import "./data/loadGeoData";
import { errorHandler } from "./middleware/errorHandler";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import provinceRoutes from "./routes/provinces";
import districtRoutes from "./routes/districts";
import neighborhoodRoutes from "./routes/neighborhoods";
import streetRoutes from "./routes/streets";
import townRoutes from "./routes/towns";
import villageRoutes from "./routes/villages";
import { getAppVersion } from "./version";

const app = express();

const corsOptions: cors.CorsOptions = config.corsOrigin
  ? {
      origin: config.corsOrigin
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    }
  : { origin: true };

app.use(requestIdMiddleware);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

app.use("/api/provinces", provinceRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/neighborhoods", neighborhoodRoutes);
app.use("/api/streets", streetRoutes);
app.use("/api/towns", townRoutes);
app.use("/api/villages", villageRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Turkey Geographic Data API",
    version: getAppVersion(),
    endpoints: {
      health: "/health",
      provinces: "/api/provinces",
      districts: "/api/districts",
      neighborhoods: "/api/neighborhoods",
      streets: "/api/streets",
      towns: "/api/towns",
      villages: "/api/villages",
    },
    query: {
      list:
        "Collections support pagination (`limit`, `offset`, default limit 100) and search (`q`, Turkish-aware).",
    },
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    version: getAppVersion(),
    requestId: req.requestId,
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    requestId: req.requestId,
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
