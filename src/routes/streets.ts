import express from "express";
import {
  getAllStreets,
  getStreetById,
  getStreetsByDistrictId,
  getStreetsByNeighborhoodId,
  getStreetsByProvinceId,
} from "../controllers/streetController";

const router = express.Router();

router.get("/province/:provinceId", getStreetsByProvinceId);
router.get("/district/:districtId", getStreetsByDistrictId);
router.get("/neighborhood/:neighborhoodId", getStreetsByNeighborhoodId);
router.get("/", getAllStreets);
router.get("/:id", getStreetById);

export default router;
