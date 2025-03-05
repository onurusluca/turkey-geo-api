import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import provinceRoutes from "./routes/provinces";
import districtRoutes from "./routes/districts";
import neighborhoodRoutes from "./routes/neighborhoods";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/provinces", provinceRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/neighborhoods", neighborhoodRoutes);

// Home route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Turkey Geographic Data API",
    endpoints: {
      provinces: "/api/provinces",
      districts: "/api/districts",
      neighborhoods: "/api/neighborhoods",
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
