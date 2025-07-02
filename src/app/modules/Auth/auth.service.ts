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
    "abcdefghi",
    "5m"
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    "abcdefghijkl",
    "30d"
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
    decodedData = jwtHelpers.verifyToken(token, "abcdefghijkl");
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
    "abcdefghi",
    "5m"
  );

  return {
    accessToken,
    needPasswordChange: userData?.needPasswordChange,
  };
};

export const AuthServices = {
  loginUser,
  refreshToken,
};
