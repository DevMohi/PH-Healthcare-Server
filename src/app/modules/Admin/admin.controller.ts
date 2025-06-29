import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getAllAdminFromDB(req.query);
    res.status(200).json({
      success: true,
      message: "All Admin Data Retrieved Successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong",
      error: err,
    });
  }
};

export const AdminController = {
  getAllAdmins,
};
