import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { UserStatus } from "../../../generated/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";

const loginUser = async (payload: { email: string; password: string }) => {
  console.log("User logged in", payload);
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  //   console.log(userData.password);

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  //Password right hoile then this next steps

  if (!isCorrectPassword) {
    throw new Error("Password Incorrect");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  console.log("Access", accessToken);

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  /*
    1. Verify Token if its valid by using jwt.verify(token, secret);
    2. If valid token na hoile throw you are not authorized
    3. Databse e data ase naki check koro 
    4. Jodi thake generate new access token 

 */

  //   console.log("refresh token", token);

  //check if token is valid
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
    console.log(decodedData);
  } catch (err) {
    throw new Error("You are not authorized");
  }

  //check if data ase kina
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });

  //Thakle generate new token
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData?.email,
      role: userData?.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: userData?.needPasswordChange,
  };
};

const changePasswordInDB = async (user: any, payload: any) => {
  //First step email find kora and compare
  //payload password ta k compare koraba with current password
  // hash korba new password ta k

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  //Check given old password is similar to current password
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password Incorrect");
  }

  //Jodi correct thake tahole payload password take hash kore fele hocce next steps
  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  //Update kore dibo ek
  await prisma.user.update({
    where: {
      email: userData.email,
      status: UserStatus.ACTIVE,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password Changed Successfully",
  };
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePasswordInDB,
};
