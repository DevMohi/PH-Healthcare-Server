import prisma from "../../../shared/prisma";

const updateIntoDB = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;

  //Doctor Specialties create korbar jnno doctorId lage and specialty Id lage , doctorData which is a payload oikan theke amra specialty id pacci ar doctorInfo theke amra doctorId pabo
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
    });

    //Array of objects return kortese payload
    if (specialties && specialties.length > 0) {
      //Delete Specialties
      const deleteSpecialtiesIds = specialties.filter(
        (specialty) => specialty.isDeleted
      );
      for (const specialty of deleteSpecialtiesIds) {
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: doctorInfo.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }

      //Create Specialties
      const createSpecialtiesIds = specialties.filter(
        (specialty) => !specialty.isDeleted
      );

      for (const specialty of createSpecialtiesIds) {
        await transactionClient.doctorSpecialties.create({
          data: {
            doctorId: doctorInfo.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }
    }
  });
  const result = await prisma.doctor.findUnique({
    where: {
      id: doctorInfo.id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });
  return result;
};

export const DoctorService = {
  updateIntoDB,
};
