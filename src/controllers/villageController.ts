import type { Request, Response } from "express";
import { getGeo } from "../data/loadGeoData";
import type { Village } from "../types";
import { requirePathInt, rowsForParent, sendById } from "../utils/handlers";
import { sendPaginated } from "../utils/listResponse";
import { normalizeTurkish } from "../utils/turkishSearch";

const searchVillage = (v: Village, qn: string): boolean =>
  (v.name !== null && normalizeTurkish(v.name).includes(qn)) ||
  (v.provinceName !== null && normalizeTurkish(v.provinceName).includes(qn)) ||
  (v.districtName !== null && normalizeTurkish(v.districtName).includes(qn));

export function getAllVillages(req: Request, res: Response): void {
  sendPaginated(res, req, getGeo().villages, searchVillage);
}

export function getVillageById(req: Request, res: Response): void {
  const id = requirePathInt(req.params.id, "Village ID");
  sendById(res, getGeo().villageById, id, "Village not found");
}

export function getVillagesByProvinceId(req: Request, res: Response): void {
  const provinceId = requirePathInt(req.params.provinceId, "Province ID");
  sendPaginated(
    res,
    req,
    rowsForParent(getGeo().villagesByProvinceId, provinceId),
    searchVillage
  );
}
