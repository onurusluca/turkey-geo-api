import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import provinceRoutes from "./routes/provinces";
import districtRoutes from "./routes/districts";
import neighborhoodRoutes from "./routes/neighborhoods";
import streetRoutes from "./routes/streets";
import townRoutes from "./routes/towns";
import villageRoutes from "./routes/villages";
import { jsonError } from "./utils/apiResponse";
import { getAppVersion } from "./version";

export function createApp(): express.Express {
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
  if (config.nodeEnv !== "production") {
    app.use(requestLogger);
  }

  app.use("/api/provinces", provinceRoutes);
  app.use("/api/districts", districtRoutes);
  app.use("/api/neighborhoods", neighborhoodRoutes);
  app.use("/api/streets", streetRoutes);
  app.use("/api/towns", townRoutes);
  app.use("/api/villages", villageRoutes);

  app.get("/", (_req: Request, res: Response) => {
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
        list: "Collections support pagination (`limit`, `offset`, default limit 100) and search (`q`, Turkish-aware).",
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
    jsonError(res, req, 404, "Route not found");
  });

  app.use(errorHandler);

  return app;
}
