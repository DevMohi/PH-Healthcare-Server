//for middlewares
import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";

const app: Application = express();
app.use(cors());
app.use(cookieParser());

//parser must add
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Ph health care server...",
  });
});

app.use("/api/v1", router);

//ai next function ta aikane use kora lagbe
app.use(globalErrorHandler);

//Not found middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // console.log(req);
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Api Not Found!",
    error: {
      path: req.originalUrl,
      message: "You Requested path is not found!!",
    },
    // error :
  });
});

export default app;
