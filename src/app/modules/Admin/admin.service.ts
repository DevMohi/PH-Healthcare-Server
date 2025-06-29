import { Prisma } from "../../../generated/prisma";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { adminSearchableFields } from "./admin.constant";

const getAllAdminFromDB = async (params: any, options: any) => {
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
  if (Object.keys(filterData.length > 0)) {
    // And hoite hobe shob operation maintain korte hobe
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

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
  return result;
};

export const AdminService = {
  getAllAdminFromDB,
};
