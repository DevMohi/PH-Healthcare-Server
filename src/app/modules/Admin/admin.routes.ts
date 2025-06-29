import express from "express";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

const router = express.Router();

router.get("/", AdminController.getAllAdmins);
router.get("/:id", AdminController.getAdminById);
router.patch("/:id", AdminController.updateAdminById);
router.delete("/:id", AdminController.deleteById);
router.delete("/soft/:id", AdminController.softDeleteById);

export const AdminRoutes = router;
