import { Admin, Prisma, UserStatus } from "../../../generated/prisma";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { adminSearchableFields } from "./admin.constant";
import { IAdminFilterRequest } from "./admin.interface";

const getAllAdminFromDB = async (
  params: IAdminFilterRequest,
  options: IPaginationOptions
) => {
  console.log(params);
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.AdminWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
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

  //true mane deleted tai show korbona
  andConditions.push({
    isDeleted: false,
  });

  // console.dir(andConditions, { depth: "infinity" });
  const whereConditions: Prisma.AdminWhereInput = {
    AND: andConditions,
  };
  const result = await prisma.admin.findMany({
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
  });

  const total = await prisma.admin.count({
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

const getAdminByIdFromDB = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
    },
  });
  return result;
};

//see reference
const updateAdminByIdIntoDB = async (
  id: string,
  data: Partial<Admin>
): Promise<Admin> => {
  //Jodi id exist na kore it will throw in built error by prisma
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.admin.update({
    where: {
      id,
    },
    data,
  });

  return result;
};

const deleteFromDB = async (id: string): Promise<Admin | null> => {
  //Bhul id dile aita use korba
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });

  //User thekeo delete kora lagbe and from admin table also , 2 ta query perform hobe so use trasaction
  const result = await prisma.$transaction(async (transactionClient) => {
    //query 1
    const adminDeletedData = await transactionClient.admin.delete({
      where: {
        id,
      },
    });

    //query 2 - admin er email die user table refer so oita die delete korbo
    const userDeletedData = await transactionClient.user.delete({
      where: {
        email: adminDeletedData.email,
      },
    });

    return adminDeletedData;
  });
  return result;
};

const softDeleteFromDB = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  //User thekeo delete kora lagbe and from admin table also , 2 ta query perform hobe so use trasaction
  const result = await prisma.$transaction(async (transactionClient) => {
    //query 1
    const adminDeletedData = await transactionClient.admin.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    //query 2 - admin er email die user table refer so oita die delete korbo
    await transactionClient.user.update({
      where: {
        email: adminDeletedData.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return adminDeletedData;
  });
  return result;
};

export const AdminService = {
  getAllAdminFromDB,
  getAdminByIdFromDB,
  updateAdminByIdIntoDB,
  deleteFromDB,
  softDeleteFromDB,
};
