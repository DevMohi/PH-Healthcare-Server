import express from "express";
import { ScheduleController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma";

const router = express.Router();

router.get("/", auth(UserRole.DOCTOR), ScheduleController.getAllFromDB);
router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ScheduleController.insertIntoDB
);

export const ScheduleRoutes = router;
