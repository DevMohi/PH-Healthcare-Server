import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../../shared/prisma";
import { Prisma, Schedule } from "../../../generated/prisma";
import { ISchedule } from "./schedule.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IAuthUser } from "../../interfaces/common";

const insertIntoDB = async (payload: ISchedule): Promise<Schedule[]> => {
  // console.log(payload);
  const { startDate, endDate, startTime, endTime } = payload;

  const intervalTime = 30;
  const schedules = [];

  //Date format
  const currentDate = new Date(startDate); //start date
  const lastDate = new Date(endDate); //end date

  //Check if end date > currentDate
  while (currentDate <= lastDate) {
    //add time to currentStartDate split because time is like this 09:30
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );
    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );
    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime: startDateTime,
        //30 min add hobe
        endDateTime: addMinutes(startDateTime, intervalTime),
      };

      //not allowing duplicate data
      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions,
  user: IAuthUser
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { startDate, endDate, ...filterData } = filters;

  const andConditions = [];
  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: startDate,
          },
        },
        {
          endDateTime: {
            lte: endDate,
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user?.email,
      },
    },
  });

  // console.log(doctorSchedules);

  //Doctor schedules id alada korbo as aita array hishebe ase

  const doctorSchedulesIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId
  );

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorSchedulesIds,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
  });
  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorSchedulesIds,
      },
    },
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const ScheduleService = {
  insertIntoDB,
  getAllFromDB,
};

/*
  1. Ektar jnno loop korba , using minutes creating time slot 65-2 
  Date er upor loop cholaisi then oitar shate time ta add kore dise using date-fns 
  and then time er upor loop cholai slot banai fellam 
*/
