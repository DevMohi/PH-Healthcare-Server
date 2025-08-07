import express from "express";
import { PatientController } from "./patient.controller";

const router = express.Router();

router.patch("/:id", PatientController.updateIntoDB);
router.delete("/:id", PatientController.deleteFromDB);

export const PaitentRoutes = router;
