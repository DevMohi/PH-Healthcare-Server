import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { IAuthUser } from "../../interfaces/common";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.insertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule created Successfully",
    data: result,
  });
});

const getAllFromDB = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const filters = pick(req.query, ["startDate", "endDate"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const user = req.user;
    const result = await ScheduleService.getAllFromDB(
      filters,
      options,
      user as IAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Schedule fetched Successfully",
      data: result,
    });
  }
);

export const ScheduleController = {
  insertIntoDB,
  getAllFromDB,
};
