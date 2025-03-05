import express from "express";
import {
  getAllProvinces,
  getProvinceById,
} from "../controllers/provinceController";

const router = express.Router();

router.get("/", getAllProvinces);
router.get("/:id", getProvinceById);

export default router;
