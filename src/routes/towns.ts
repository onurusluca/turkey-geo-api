import express from "express";
import {
  getAllTowns,
  getTownById,
  getTownsByProvinceId,
} from "../controllers/townController";

const router = express.Router();

router.get("/province/:provinceId", getTownsByProvinceId);
router.get("/", getAllTowns);
router.get("/:id", getTownById);

export default router;
