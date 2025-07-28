import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelper";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import ApiError from "../errors/ApiErrors";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log(roles);
    try {
      //steps token pele decode korte hobe
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );

      // console.log(verifiedUser);
      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized");
      }
      next();

      console.log(verifiedUser);

      console.log(token);
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
