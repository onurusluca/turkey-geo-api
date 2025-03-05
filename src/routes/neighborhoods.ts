import express from "express";
import {
  getAllNeighborhoods,
  getNeighborhoodById,
  getNeighborhoodsByDistrictId,
  getNeighborhoodsByProvinceId,
} from "../controllers/neighborhoodController";

const router = express.Router();

router.get("/", getAllNeighborhoods);
router.get("/:id", getNeighborhoodById);
router.get("/district/:districtId", getNeighborhoodsByDistrictId);
router.get("/province/:provinceId", getNeighborhoodsByProvinceId);

export default router;
