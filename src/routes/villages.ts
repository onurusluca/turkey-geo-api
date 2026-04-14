import express from "express";
import {
  getAllVillages,
  getVillageById,
  getVillagesByProvinceId,
} from "../controllers/villageController";

const router = express.Router();

router.get("/province/:provinceId", getVillagesByProvinceId);
router.get("/", getAllVillages);
router.get("/:id", getVillageById);

export default router;
