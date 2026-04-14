import { Request, Response } from "express";
import { geo } from "../data/loadGeoData";
import type { District } from "../types";
import { jsonError } from "../utils/apiResponse";
import { sendPaginated } from "../utils/listResponse";
import { parsePathIntParam } from "../utils/routeParams";
import { normalizeTurkish } from "../utils/turkishSearch";

const districtRows = geo.districts;

const searchDistrict = (d: District, qn: string): boolean =>
  normalizeTurkish(d.name).includes(qn) ||
  normalizeTurkish(d.provinceName).includes(qn) ||
  (d.fullOfficialName !== null &&
    normalizeTurkish(d.fullOfficialName).includes(qn));

const getAllDistricts = (req: Request, res: Response): void => {
  try {
    sendPaginated(res, req, districtRows, searchDistrict);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve districts");
  }
};

const getDistrictById = (req: Request, res: Response): void => {
  try {
    const idParam = parsePathIntParam(req.params.id);
    if (idParam === "missing") {
      jsonError(res, req, 400, "District ID is required");
      return;
    }
    if (idParam === "invalid") {
      jsonError(res, req, 400, "Invalid district ID");
      return;
    }
    const id = idParam;

    const district = districtRows.find((d) => d.id === id);

    if (!district) {
      jsonError(res, req, 404, "District not found");
      return;
    }

    res.json(district);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve district");
  }
};

const getDistrictsByProvinceId = (req: Request, res: Response): void => {
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

    const rows = districtRows.filter((d) => d.provinceId === provinceId);
    sendPaginated(res, req, rows, searchDistrict);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve districts for province");
  }
};

export { getAllDistricts, getDistrictById, getDistrictsByProvinceId };
