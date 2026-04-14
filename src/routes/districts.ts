import express from "express";
import {
  getAllDistricts,
  getDistrictById,
  getDistrictsByProvinceId,
} from "../controllers/districtController";

const router = express.Router();

router.get("/", getAllDistricts);
router.get("/province/:provinceId", getDistrictsByProvinceId);
router.get("/:id", getDistrictById);

export default router;
