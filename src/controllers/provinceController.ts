import { Request, Response } from "express";
import { geo } from "../data/loadGeoData";
import type { Province } from "../types";
import { jsonError } from "../utils/apiResponse";
import { sendPaginated } from "../utils/listResponse";
import { parsePathIntParam } from "../utils/routeParams";
import { normalizeTurkish } from "../utils/turkishSearch";

const provinceRows = geo.provinces;

const searchProvince = (p: Province, qn: string): boolean =>
  normalizeTurkish(p.name).includes(qn) ||
  (p.fullOfficialName !== null &&
    normalizeTurkish(p.fullOfficialName).includes(qn));

const getAllProvinces = (req: Request, res: Response): void => {
  try {
    sendPaginated(res, req, provinceRows, searchProvince);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve provinces");
  }
};

const getProvinceById = (req: Request, res: Response): void => {
  try {
    const idParam = parsePathIntParam(req.params.id);
    if (idParam === "missing") {
      jsonError(res, req, 400, "Province ID is required");
      return;
    }
    if (idParam === "invalid") {
      jsonError(res, req, 400, "Invalid province ID");
      return;
    }
    const id = idParam;

    const province = provinceRows.find((p) => p.id === id);

    if (!province) {
      jsonError(res, req, 404, "Province not found");
      return;
    }

    res.json(province);
  } catch {
    jsonError(res, req, 500, "Failed to retrieve province");
  }
};

export { getAllProvinces, getProvinceById };
