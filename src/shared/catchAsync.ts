import { NextFunction, Request, RequestHandler, Response } from "express";

//an example of higher order function , takes function as a parameter and returns a function
const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

export default catchAsync;
