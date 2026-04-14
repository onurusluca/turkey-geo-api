import { Request, Response } from "express";
import { geo } from "../data/loadGeoData";
import type { Street } from "../types";
import { jsonError } from "../utils/apiResponse";
import { sendPaginated } from "../utils/listResponse";
import { parsePathIntParam } from "../utils/routeParams";
import { normalizeTurkish } from "../utils/turkishSearch";

const streetRows = geo.streets;

const searchStreet = (s: Street, qn: string): boolean =>
  (s.name !== null && normalizeTurkish(s.name).includes(qn)) ||
  (s.fullOfficialName !== null &&
    normalizeTurkish(s.fullOfficialName).includes(qn)) ||
  normalizeTurkish(s.provinceName).includes(qn) ||
  normalizeTurkish(s.districtName).includes(qn) ||
  normalizeTurkish(s.neighborhoodName).includes(qn);

const getAllStreets = (req: Request, res: Response): void => {
  try {
    sendPaginated(res, req, streetRows, searchStreet);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve streets");
  }
};

const getStreetById = (req: Request, res: Response): void => {
  try {
    const idParam = parsePathIntParam(req.params.id);
    if (idParam === "missing") {
      jsonError(res, req, 400, "Street ID is required");
      return;
    }
    if (idParam === "invalid") {
      jsonError(res, req, 400, "Invalid street ID");
      return;
    }
    const id = idParam;

    const street = geo.streetById.get(id);
    if (!street) {
      jsonError(res, req, 404, "Street not found");
      return;
    }
    res.json(street);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve street");
  }
};

const getStreetsByProvinceId = (req: Request, res: Response): void => {
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
    const rows = streetRows.filter((s) => s.provinceId === provinceId);
    sendPaginated(res, req, rows, searchStreet);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve streets for province");
  }
};

const getStreetsByDistrictId = (req: Request, res: Response): void => {
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
    const rows = streetRows.filter((s) => s.districtId === districtId);
    sendPaginated(res, req, rows, searchStreet);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve streets for district");
  }
};

const getStreetsByNeighborhoodId = (req: Request, res: Response): void => {
  try {
    const neighborhoodIdParam = parsePathIntParam(req.params.neighborhoodId);
    if (neighborhoodIdParam === "missing") {
      jsonError(res, req, 400, "Neighborhood ID is required");
      return;
    }
    if (neighborhoodIdParam === "invalid") {
      jsonError(res, req, 400, "Invalid neighborhood ID");
      return;
    }
    const neighborhoodId = neighborhoodIdParam;
    const rows = streetRows.filter(
      (s) => s.neighborhoodId === neighborhoodId
    );
    sendPaginated(res, req, rows, searchStreet);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve streets for neighborhood");
  }
};

export {
  getAllStreets,
  getStreetById,
  getStreetsByProvinceId,
  getStreetsByDistrictId,
  getStreetsByNeighborhoodId,
};
