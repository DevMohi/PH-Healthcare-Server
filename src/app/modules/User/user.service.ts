import {
  Admin,
  Doctor,
  Patient,
  Prisma,
  UserRole,
  UserStatus,
} from "../../../generated/prisma";
import * as bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../../helpers/fileUploader";
import { IFile } from "../../interfaces/file";
import { Request } from "express";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { IAuthUser } from "../../interfaces/common";

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file as IFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);

  //2 ta table e kaaj hobe so transaction use kortese ar dunota dependency tai use kortese
  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {
  const file = req.file as IFile;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });

  return result;
};

const createPatient = async (req: Request): Promise<Patient> => {
  const file = req.file as IFile;

  if (file) {
    const uploadedProfileImage = await fileUploader.uploadToCloudinary(file);
    req.body.patient.profilePhoto = uploadedProfileImage?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);

  const userData = {
    email: req.body.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdPatientData = await transactionClient.patient.create({
      data: req.body.patient,
    });

    return createdPatientData;
  });

  return result;
};

const getAllFromDB = async (params: any, options: IPaginationOptions) => {
  console.log(params);
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  //Object theke array banano jai , specific field er upor filtering korte chaile aitai way
  if (Object.keys(filterData).length > 0) {
    // And hoite hobe shob operation maintain korte hobe
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  // console.dir(andConditions, { depth: "infinity" });
  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};
  const result = await prisma.user.findMany({
    //where recieves object of array
    where: whereConditions,
    skip,
    take: Number(limit),
    //jodi sortBy and sortOrder er value thake sort korbe ar naile default hobe sort hobe
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            //since aita object so third bracket e leka rakhe
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      doctor: true,
      patient: true,
    },
  });

  //   include: {
  //   admin: true,
  //   doctor: true,
  //   patient: true,
  // },

  const total = await prisma.user.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const changeProfileStatus = async (id: string, status: UserStatus) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: status,
  });

  return updateUserStatus;
};

const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;
  if (userInfo?.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: { email: userInfo.email },
    });
  } else if (userInfo?.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: { email: userInfo.email },
    });
  } else if (userInfo?.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: { email: userInfo.email },
    });
  } else if (userInfo?.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: { email: userInfo.email },
    });
  }

  return {
    ...userInfo,
    ...profileInfo,
  };
};

const updateMyProfile = async (user: IAuthUser, req: Request) => {
  //req nicci because it contains both the body and formdata
  //check exist kore naki ar active naki
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });
  const file = req.file as IFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.profilePhoto = uploadToCloudinary?.secure_url;
  }

  let profileInfo;
  if (userInfo?.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  } else if (userInfo?.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  } else if (userInfo?.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  } else if (userInfo?.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: { email: userInfo.email },
      data: req.body,
    });
  }

  return {
    ...profileInfo,
  };
};

export const userService = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllFromDB,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
};
