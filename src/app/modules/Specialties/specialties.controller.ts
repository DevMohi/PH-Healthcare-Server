import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { SpecialtiesService } from "./specialties.service";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtiesService.insertIntoDB(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties Created Successfully",
    data: result,
  });
});

export const specialtiesController = {
  insertIntoDB,
};
