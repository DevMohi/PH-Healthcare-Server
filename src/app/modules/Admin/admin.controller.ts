import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";

//This is done to prevent unwanted search Terms such as emaillsss , it will only pick the valid searchTerm or properties and that has values.

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    console.log("options : ", options);
    const result = await AdminService.getAllAdminFromDB(filters, options);
    res.status(200).json({
      success: true,
      message: "All Admin Data Retrieved Successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: (err as Error)?.name || "Something went wrong",
      error: err,
    });
  }
};

export const AdminController = {
  getAllAdmins,
};
