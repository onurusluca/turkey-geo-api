import { Request, Response } from "express";
import neighborhoods from "../../data/neighborhoods.json";
import { Neighborhood } from "../types";

const getAllNeighborhoods = (req: Request, res: Response): void => {
  try {
    res.json(neighborhoods);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve neighborhoods" });
  }
};

const getNeighborhoodById = (req: Request, res: Response): void => {
  try {
    // Check if ID parameter exists
    if (!req.params.id) {
      res.status(400).json({ error: "Neighborhood ID is required" });
      return;
    }

    const id = parseInt(req.params.id);

    // Check if ID is a valid number
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid neighborhood ID" });
      return;
    }

    const neighborhood = (neighborhoods as Neighborhood[]).find(
      (n) => n.id === id
    );

    if (!neighborhood) {
      res.status(404).json({ error: "Neighborhood not found" });
      return;
    }

    res.json(neighborhood);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve neighborhood" });
  }
};

const getNeighborhoodsByDistrictId = (req: Request, res: Response): void => {
  try {
    // Check if districtId parameter exists
    if (!req.params.districtId) {
      res.status(400).json({ error: "District ID is required" });
      return;
    }

    const districtId = parseInt(req.params.districtId);

    // Check if districtId is a valid number
    if (isNaN(districtId)) {
      res.status(400).json({ error: "Invalid district ID" });
      return;
    }

    const filteredNeighborhoods = (neighborhoods as Neighborhood[]).filter(
      (n) => n.districtId === districtId
    );

    if (filteredNeighborhoods.length === 0) {
      res
        .status(404)
        .json({ error: "No neighborhoods found for this district" });
      return;
    }

    res.json(filteredNeighborhoods);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve neighborhoods for district" });
  }
};

const getNeighborhoodsByProvinceId = (req: Request, res: Response): void => {
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

    const filteredNeighborhoods = (neighborhoods as Neighborhood[]).filter(
      (n) => n.provinceId === provinceId
    );

    if (filteredNeighborhoods.length === 0) {
      res
        .status(404)
        .json({ error: "No neighborhoods found for this province" });
      return;
    }

    res.json(filteredNeighborhoods);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve neighborhoods for province" });
  }
};

export {
  getAllNeighborhoods,
  getNeighborhoodById,
  getNeighborhoodsByDistrictId,
  getNeighborhoodsByProvinceId,
};
