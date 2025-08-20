import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../../shared/prisma";

const insertIntoDB = async (payload: any) => {
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
      addHours(
        `${format(currentDate, "yyyy-MM-dd")}`,
        Number(startTime.split(":")[0])
      )
    );
    const endDateTime = new Date(
      addHours(
        `${format(currentDate, "yyyy-MM-dd")}`,
        Number(endTime.split(":")[0])
      )
    );
    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime: startDateTime,
        //30 min add hobe
        endDateTime: addMinutes(startDateTime, intervalTime),
      };

      const result = await prisma.schedule.create({
        data: scheduleData,
      });

      schedules.push(result);
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

export const ScheduleService = {
  insertIntoDB,
};

/*
  1. Ektar jnno loop korba , using minutes creating time slot 65-2 
  Date er upor loop cholaisi then oitar shate time ta add kore dise using date-fns 
  and then time er upor loop cholai slot banai fellam 
*/
