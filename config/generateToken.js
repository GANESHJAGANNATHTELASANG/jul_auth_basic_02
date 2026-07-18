import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";

export const genereateToken = async (id, res) => {
  const accessToken = jwt.sign({ id }, process.env.ACCESSTOKEN_SEC, {
    expiresIn: "1m",
  });

  const refreshToken = jwt.sign({ id }, process.env.REFRESHTOKEN_SEC, {
    expiresIn: "7d",
  });

  const refreshTokenKey = `refresh_token${id}`;

  await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: false,
    secure: false,
    sameSite: "none",
    maxAge: 1 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};
