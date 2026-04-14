import { Request, Response } from "express";
import { geo } from "../data/loadGeoData";
import type { Village } from "../types";
import { jsonError } from "../utils/apiResponse";
import { sendPaginated } from "../utils/listResponse";
import { parsePathIntParam } from "../utils/routeParams";
import { normalizeTurkish } from "../utils/turkishSearch";

const villageRows = geo.villages;

const searchVillage = (v: Village, qn: string): boolean =>
  (v.name !== null && normalizeTurkish(v.name).includes(qn)) ||
  (v.provinceName !== null &&
    normalizeTurkish(v.provinceName).includes(qn)) ||
  (v.districtName !== null &&
    normalizeTurkish(v.districtName).includes(qn));

const getAllVillages = (req: Request, res: Response): void => {
  try {
    sendPaginated(res, req, villageRows, searchVillage);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve villages");
  }
};

const getVillageById = (req: Request, res: Response): void => {
  try {
    const idParam = parsePathIntParam(req.params.id);
    if (idParam === "missing") {
      jsonError(res, req, 400, "Village ID is required");
      return;
    }
    if (idParam === "invalid") {
      jsonError(res, req, 400, "Invalid village ID");
      return;
    }
    const village = geo.villageById.get(idParam);
    if (!village) {
      jsonError(res, req, 404, "Village not found");
      return;
    }
    res.json(village);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve village");
  }
};

const getVillagesByProvinceId = (req: Request, res: Response): void => {
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
    const rows = villageRows.filter((v) => v.provinceId === provinceIdParam);
    sendPaginated(res, req, rows, searchVillage);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve villages for province");
  }
};

export { getAllVillages, getVillageById, getVillagesByProvinceId };
