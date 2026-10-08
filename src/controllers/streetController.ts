import type { Request, Response } from "express";
import { getGeo } from "../data/loadGeoData";
import type { Street } from "../types";
import { requirePathInt, rowsForParent, sendById } from "../utils/handlers";
import { sendPaginated } from "../utils/listResponse";
import { normalizeTurkish } from "../utils/turkishSearch";

const searchStreet = (s: Street, qn: string): boolean =>
  (s.name !== null && normalizeTurkish(s.name).includes(qn)) ||
  (s.fullOfficialName !== null &&
    normalizeTurkish(s.fullOfficialName).includes(qn)) ||
  normalizeTurkish(s.provinceName).includes(qn) ||
  normalizeTurkish(s.districtName).includes(qn) ||
  normalizeTurkish(s.neighborhoodName).includes(qn);

export function getAllStreets(req: Request, res: Response): void {
  sendPaginated(res, req, getGeo().streets, searchStreet);
}

export function getStreetById(req: Request, res: Response): void {
  const id = requirePathInt(req.params.id, "Street ID");
  sendById(res, getGeo().streetById, id, "Street not found");
}

export function getStreetsByProvinceId(req: Request, res: Response): void {
  const provinceId = requirePathInt(req.params.provinceId, "Province ID");
  sendPaginated(
    res,
    req,
    rowsForParent(getGeo().streetsByProvinceId, provinceId),
    searchStreet
  );
}

export function getStreetsByDistrictId(req: Request, res: Response): void {
  const districtId = requirePathInt(req.params.districtId, "District ID");
  sendPaginated(
    res,
    req,
    rowsForParent(getGeo().streetsByDistrictId, districtId),
    searchStreet
  );
}

export function getStreetsByNeighborhoodId(req: Request, res: Response): void {
  const neighborhoodId = requirePathInt(
    req.params.neighborhoodId,
    "Neighborhood ID"
  );
  sendPaginated(
    res,
    req,
    rowsForParent(getGeo().streetsByNeighborhoodId, neighborhoodId),
    searchStreet
  );
}
