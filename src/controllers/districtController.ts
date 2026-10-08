import type { Request, Response } from "express";
import { getGeo } from "../data/loadGeoData";
import type { District } from "../types";
import { requirePathInt, rowsForParent, sendById } from "../utils/handlers";
import { sendPaginated } from "../utils/listResponse";
import { normalizeTurkish } from "../utils/turkishSearch";

const searchDistrict = (d: District, qn: string): boolean =>
  normalizeTurkish(d.name).includes(qn) ||
  normalizeTurkish(d.provinceName).includes(qn) ||
  (d.fullOfficialName !== null &&
    normalizeTurkish(d.fullOfficialName).includes(qn));

export function getAllDistricts(req: Request, res: Response): void {
  sendPaginated(res, req, getGeo().districts, searchDistrict);
}

export function getDistrictById(req: Request, res: Response): void {
  const id = requirePathInt(req.params.id, "District ID");
  sendById(res, getGeo().districtById, id, "District not found");
}

export function getDistrictsByProvinceId(req: Request, res: Response): void {
  const provinceId = requirePathInt(req.params.provinceId, "Province ID");
  sendPaginated(
    res,
    req,
    rowsForParent(getGeo().districtsByProvinceId, provinceId),
    searchDistrict
  );
}
