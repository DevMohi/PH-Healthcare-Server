import { NextFunction, Request, RequestHandler, Response } from "express";
import { AdminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";

//This is done to prevent unwanted search Terms such as emaillsss , it will only pick the valid searchTerm or properties and that has values.
const getAllAdmins: RequestHandler = catchAsync(async (req, res) => {
  const filters = pick(req.query, adminFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  console.log("options : ", options);
  const result = await AdminService.getAllAdminFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Admin Data Retrieved Successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.params.id);
  const { id } = req.params;

  const result = await AdminService.getAdminByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Retrieved Successfully Through Id",
    data: result,
  });
});

const updateAdminById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const result = await AdminService.updateAdminByIdIntoDB(id, data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Data Updated",
    data: result,
  });
});
const deleteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.deleteFromDB(id);
  // res.status(200).json({
  //   success: true,
  //   message: "Admin Data Deleted",
  //   data: result,
  // });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Data Updated",
    data: result,
  });
});

const softDeleteById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await AdminService.softDeleteFromDB(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin Data Updated",
      data: result,
    });
  }
);

export const AdminController = {
  getAllAdmins,
  getAdminById,
  updateAdminById,
  deleteById,
  softDeleteById,
};
