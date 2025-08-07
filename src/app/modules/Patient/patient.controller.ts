import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PatientService } from "./patient.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.updateIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient updated Successfully",
    data: result,
  });
});
const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.deleteFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted Successfully",
    data: result,
  });
});

export const PatientController = {
  updateIntoDB,
  deleteFromDB,
};
