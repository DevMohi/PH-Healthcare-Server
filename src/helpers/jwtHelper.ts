import jwt, { SignOptions, Secret, JwtPayload } from "jsonwebtoken";

const generateToken = (
  payload: string | object | Buffer,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"]
): string => {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn,
  };

  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
