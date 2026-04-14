import { Request, Response } from "express";
import { geo } from "../data/loadGeoData";
import type { Neighborhood } from "../types";
import { jsonError } from "../utils/apiResponse";
import { sendPaginated } from "../utils/listResponse";
import { parsePathIntParam } from "../utils/routeParams";
import { normalizeTurkish } from "../utils/turkishSearch";

const neighborhoodRows = geo.neighborhoods;

const searchNeighborhood = (n: Neighborhood, qn: string): boolean =>
  (n.name !== null && normalizeTurkish(n.name).includes(qn)) ||
  (n.fullOfficialName !== null &&
    normalizeTurkish(n.fullOfficialName).includes(qn)) ||
  normalizeTurkish(n.districtName).includes(qn) ||
  normalizeTurkish(n.provinceName).includes(qn);

const getAllNeighborhoods = (req: Request, res: Response): void => {
  try {
    sendPaginated(res, req, neighborhoodRows, searchNeighborhood);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve neighborhoods");
  }
};

const getNeighborhoodById = (req: Request, res: Response): void => {
  try {
    const idParam = parsePathIntParam(req.params.id);
    if (idParam === "missing") {
      jsonError(res, req, 400, "Neighborhood ID is required");
      return;
    }
    if (idParam === "invalid") {
      jsonError(res, req, 400, "Invalid neighborhood ID");
      return;
    }
    const id = idParam;

    const neighborhood = neighborhoodRows.find((n) => n.id === id);

    if (!neighborhood) {
      jsonError(res, req, 404, "Neighborhood not found");
      return;
    }

    res.json(neighborhood);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve neighborhood");
  }
};

const getNeighborhoodsByDistrictId = (req: Request, res: Response): void => {
  try {
    const districtIdParam = parsePathIntParam(req.params.districtId);
    if (districtIdParam === "missing") {
      jsonError(res, req, 400, "District ID is required");
      return;
    }
    if (districtIdParam === "invalid") {
      jsonError(res, req, 400, "Invalid district ID");
      return;
    }
    const districtId = districtIdParam;

    const rows = neighborhoodRows.filter((n) => n.districtId === districtId);
    sendPaginated(res, req, rows, searchNeighborhood);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve neighborhoods for district");
  }
};

const getNeighborhoodsByProvinceId = (req: Request, res: Response): void => {
  try {
    const provinceIdParam = parsePathIntParam(req.params.provinceId);
    if (provinceIdParam === "missing") {
      jsonError(res, req, 400, "Province ID is required");
      return;
    }
    if (provinceIdParam === "invalid") {
      jsonError(res, req, 400, "Invalid province ID");
      return;
    }
    const provinceId = provinceIdParam;

    const rows = neighborhoodRows.filter((n) => n.provinceId === provinceId);
    sendPaginated(res, req, rows, searchNeighborhood);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve neighborhoods for province");
  }
};

export {
  getAllNeighborhoods,
  getNeighborhoodById,
  getNeighborhoodsByDistrictId,
  getNeighborhoodsByProvinceId,
};
