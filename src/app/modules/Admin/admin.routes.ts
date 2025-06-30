import express from "express";
import { AdminController } from "./admin.controller";
import { adminValidationSchemas } from "./admin.validations";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.get("/", AdminController.getAllAdmins);
router.get("/:id", AdminController.getAdminById);
router.patch(
  "/:id",
  validateRequest(adminValidationSchemas.update),
  AdminController.updateAdminById
);
router.delete("/:id", AdminController.deleteById);
router.delete("/soft/:id", AdminController.softDeleteById);

export const AdminRoutes = router;
