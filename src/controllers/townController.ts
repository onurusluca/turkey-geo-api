import type { Request, Response } from "express";
import { getGeo } from "../data/loadGeoData";
import type { Town } from "../types";
import { requirePathInt, rowsForParent, sendById } from "../utils/handlers";
import { sendPaginated } from "../utils/listResponse";
import { normalizeTurkish } from "../utils/turkishSearch";

const searchTown = (t: Town, qn: string): boolean =>
  (t.name !== null && normalizeTurkish(t.name).includes(qn)) ||
  (t.provinceName !== null && normalizeTurkish(t.provinceName).includes(qn)) ||
  (t.districtName !== null && normalizeTurkish(t.districtName).includes(qn));

export function getAllTowns(req: Request, res: Response): void {
  sendPaginated(res, req, getGeo().towns, searchTown);
}

export function getTownById(req: Request, res: Response): void {
  const id = requirePathInt(req.params.id, "Town ID");
  sendById(res, getGeo().townById, id, "Town not found");
}

export function getTownsByProvinceId(req: Request, res: Response): void {
  const provinceId = requirePathInt(req.params.provinceId, "Province ID");
  sendPaginated(
    res,
    req,
    rowsForParent(getGeo().townsByProvinceId, provinceId),
    searchTown
  );
}
