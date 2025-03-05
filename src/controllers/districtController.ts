import { Request, Response } from "express";
import districts from "../../data/districts.json";
import { District } from "../types";

const getAllDistricts = (req: Request, res: Response): void => {
  try {
    res.json(districts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve districts" });
  }
};

const getDistrictById = (req: Request, res: Response): void => {
  try {
    // Check if ID parameter exists
    if (!req.params.id) {
      res.status(400).json({ error: "District ID is required" });
      return;
    }

    const id = parseInt(req.params.id);

    // Check if ID is a valid number
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid district ID" });
      return;
    }

    const district = (districts as District[]).find((d) => d.id === id);

    if (!district) {
      res.status(404).json({ error: "District not found" });
      return;
    }

    res.json(district);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve district" });
  }
};

const getDistrictsByProvinceId = (req: Request, res: Response): void => {
  try {
    // Check if provinceId parameter exists
    if (!req.params.provinceId) {
      res.status(400).json({ error: "Province ID is required" });
      return;
    }

    const provinceId = parseInt(req.params.provinceId);

    // Check if provinceId is a valid number
    if (isNaN(provinceId)) {
      res.status(400).json({ error: "Invalid province ID" });
      return;
    }

    const filteredDistricts = (districts as District[]).filter(
      (d) => d.provinceId === provinceId
    );

    if (filteredDistricts.length === 0) {
      res.status(404).json({ error: "No districts found for this province" });
      return;
    }

    res.json(filteredDistricts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve districts for province" });
  }
};

export { getAllDistricts, getDistrictById, getDistrictsByProvinceId };
