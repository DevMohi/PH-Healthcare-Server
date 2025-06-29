import { Prisma, PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();
const getAllAdminFromDB = async (params: any) => {
  const andConditions: Prisma.AdminWhereInput[] = [];
  const adminSearchableFields = ["name", "email"];
  //Can also be written like this for line 22
  // [
  //       {
  //         name: {
  //           contains: params.searchTerm,
  //           mode: "insensitive", //ignores alpahabet case problem
  //         },
  //       },
  //       {
  //         email: {
  //           contains: params.searchTerm,
  //           mode: "insensitive",
  //         },
  //       },
  // ],

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

  console.dir(andConditions, { depth: "infinity" });
  const whereConditions: Prisma.AdminWhereInput = {
    AND: andConditions,
  };
  const result = await prisma.admin.findMany({
    //where recieves object of array
    where: whereConditions,
  });
  return result;
};

export const AdminService = {
  getAllAdminFromDB,
};
