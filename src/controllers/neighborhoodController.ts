import type { Request, Response } from "express";
import { getGeo } from "../data/loadGeoData";
import type { Neighborhood } from "../types";
import { requirePathInt, rowsForParent, sendById } from "../utils/handlers";
import { sendPaginated } from "../utils/listResponse";
import { normalizeTurkish } from "../utils/turkishSearch";

const searchNeighborhood = (n: Neighborhood, qn: string): boolean =>
  (n.name !== null && normalizeTurkish(n.name).includes(qn)) ||
  (n.fullOfficialName !== null &&
    normalizeTurkish(n.fullOfficialName).includes(qn)) ||
  normalizeTurkish(n.districtName).includes(qn) ||
  normalizeTurkish(n.provinceName).includes(qn);

export function getAllNeighborhoods(req: Request, res: Response): void {
  sendPaginated(res, req, getGeo().neighborhoods, searchNeighborhood);
}

export function getNeighborhoodById(req: Request, res: Response): void {
  const id = requirePathInt(req.params.id, "Neighborhood ID");
  sendById(res, getGeo().neighborhoodById, id, "Neighborhood not found");
}

export function getNeighborhoodsByDistrictId(
  req: Request,
  res: Response
): void {
  const districtId = requirePathInt(req.params.districtId, "District ID");
  sendPaginated(
    res,
    req,
    rowsForParent(getGeo().neighborhoodsByDistrictId, districtId),
    searchNeighborhood
  );
}

export function getNeighborhoodsByProvinceId(
  req: Request,
  res: Response
): void {
  const provinceId = requirePathInt(req.params.provinceId, "Province ID");
  sendPaginated(
    res,
    req,
    rowsForParent(getGeo().neighborhoodsByProvinceId, provinceId),
    searchNeighborhood
  );
}
