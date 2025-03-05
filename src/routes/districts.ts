import express from "express";
import {
  getAllDistricts,
  getDistrictById,
  getDistrictsByProvinceId,
} from "../controllers/districtController";

const router = express.Router();

router.get("/", getAllDistricts);
router.get("/:id", getDistrictById);
router.get("/province/:provinceId", getDistrictsByProvinceId);

export default router;
