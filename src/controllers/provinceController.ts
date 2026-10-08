import type { Request, Response } from "express";
import { getGeo } from "../data/loadGeoData";
import type { Province } from "../types";
import { requirePathInt, sendById } from "../utils/handlers";
import { sendPaginated } from "../utils/listResponse";
import { normalizeTurkish } from "../utils/turkishSearch";

const searchProvince = (p: Province, qn: string): boolean =>
  normalizeTurkish(p.name).includes(qn) ||
  (p.fullOfficialName !== null &&
    normalizeTurkish(p.fullOfficialName).includes(qn));

export function getAllProvinces(req: Request, res: Response): void {
  sendPaginated(res, req, getGeo().provinces, searchProvince);
}

export function getProvinceById(req: Request, res: Response): void {
  const id = requirePathInt(req.params.id, "Province ID");
  sendById(res, getGeo().provinceById, id, "Province not found");
}
