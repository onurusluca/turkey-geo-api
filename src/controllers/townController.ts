import { Request, Response } from "express";
import { geo } from "../data/loadGeoData";
import type { Town } from "../types";
import { jsonError } from "../utils/apiResponse";
import { sendPaginated } from "../utils/listResponse";
import { parsePathIntParam } from "../utils/routeParams";
import { normalizeTurkish } from "../utils/turkishSearch";

const townRows = geo.towns;

const searchTown = (t: Town, qn: string): boolean =>
  (t.name !== null && normalizeTurkish(t.name).includes(qn)) ||
  (t.provinceName !== null &&
    normalizeTurkish(t.provinceName).includes(qn)) ||
  (t.districtName !== null && normalizeTurkish(t.districtName).includes(qn));

const getAllTowns = (req: Request, res: Response): void => {
  try {
    sendPaginated(res, req, townRows, searchTown);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve towns");
  }
};

const getTownById = (req: Request, res: Response): void => {
  try {
    const idParam = parsePathIntParam(req.params.id);
    if (idParam === "missing") {
      jsonError(res, req, 400, "Town ID is required");
      return;
    }
    if (idParam === "invalid") {
      jsonError(res, req, 400, "Invalid town ID");
      return;
    }
    const town = geo.townById.get(idParam);
    if (!town) {
      jsonError(res, req, 404, "Town not found");
      return;
    }
    res.json(town);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve town");
  }
};

const getTownsByProvinceId = (req: Request, res: Response): void => {
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
    const rows = townRows.filter((t) => t.provinceId === provinceIdParam);
    sendPaginated(res, req, rows, searchTown);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve towns for province");
  }
};

export { getAllTowns, getTownById, getTownsByProvinceId };
