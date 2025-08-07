import { Patient } from "../../../generated/prisma";
import prisma from "../../../shared/prisma";
import { IPatientUpdate } from "./patient.interface";

//Ekbare shob information na nie jokon update korte chaibe you can update patient health queries
const updateIntoDB = async (
  id: string,
  payload: Partial<IPatientUpdate>
): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  //Check if patient exist in db
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    //update patient data
    const updatedPatient = await transactionClient.patient.update({
      where: {
        id,
      },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });

    //update or create patientHealth data
    if (patientHealthData) {
      const healthData = await transactionClient.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id,
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: patientInfo.id },
      });
    }
    //Medical report shuddu ekbar create korbo because ekta patient er multiple reports thakbe whereas healthdata shudu ekta
    if (medicalReport) {
      const report = await transactionClient.medicalReport.create({
        data: { ...medicalReport, patientId: patientInfo.id },
      });
    }
  });

  const responseData = await prisma.patient.findUnique({
    where: {
      id: patientInfo.id,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });
  return responseData;
};

const deleteFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.$transaction(async (tx) => {
    //Delete medical report and healthd data first as it is realted and user too then patient itself
    //Many because many reports
    await tx.medicalReport.deleteMany({
      where: {
        patientId: id,
      },
    });

    //health data delete
    await tx.patientHealthData.delete({
      where: {
        patientId: id,
      },
    });

    //delete from patient
    const deletedPatient = await tx.patient.delete({
      where: {
        id,
      },
    });

    //email pabo from deleted patient to delete user
    await tx.user.delete({
      where: {
        email: deletedPatient?.email,
      },
    });

    return deletedPatient;
  });

  return result;
};

export const PatientService = {
  updateIntoDB,
  deleteFromDB,
};
