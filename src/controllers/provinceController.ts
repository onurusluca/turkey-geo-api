import { Request, Response } from "express";
import provinces from "../../data/provinces.json";
import { Province } from "../types";

const getAllProvinces = (req: Request, res: Response): void => {
  try {
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve provinces" });
  }
};

const getProvinceById = (req: Request, res: Response): void => {
  try {
    // Check if ID parameter exists
    if (!req.params.id) {
      res.status(400).json({ error: "Province ID is required" });
      return;
    }

    const id = parseInt(req.params.id);

    // Check if ID is a valid number
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid province ID" });
      return;
    }

    const province = (provinces as Province[]).find((p) => p.id === id);

    if (!province) {
      res.status(404).json({ error: "Province not found" });
      return;
    }

    res.json(province);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve province" });
  }
};

export { getAllProvinces, getProvinceById };
