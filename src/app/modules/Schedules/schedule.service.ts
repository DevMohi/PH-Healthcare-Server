import { addHours, format } from "date-fns";

const insertIntoDB = async (payload: any) => {
  console.log(payload);
  const { startDate, endDate, startTime, endTime } = payload;

  //Date format
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

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
        `${format(lastDate, "yyyy-MM-dd")}`,
        Number(startTime.split(":")[0])
      )
    );
  }
};

export const ScheduleService = {
  insertIntoDB,
};
