import express, { NextFunction, Request, Response } from "express";
import { specialtiesController } from "./specialties.controller";
import { fileUploader } from "../../../helpers/fileUploader";
import { SpecialtiesValidation } from "./specialties.validation";

const router = express.Router();

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidation.create.parse(JSON.parse(req.body.data));
    return specialtiesController.insertIntoDB(req, res, next);
  }
);

export const SpecialtiesRoutes = router;
