import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

// Given any Zod schema, use .parse to validate an input. If it's valid, Zod returns a strongly-typed deep clone of the input. Also another example of higher order function.

const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, rees: Response, next: NextFunction) => {
    console.log("Checker middleware...");

    try {
      await schema.parseAsync({
        body: req.body,
      });
      return next();
    } catch (err) {
      next(err);
    }
  };

export default validateRequest;
