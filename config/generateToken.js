import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";
import { refreshToken } from "../controllers/user.js";

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

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SEC);

    const storedTokenInRedis = await redisClient.get(
      `refresh_token${decoded.id}`,
    );

    if (storedTokenInRedis === refreshToken) {
      return decoded;
    }
    return null;
  } catch {
    console.log("in verifying the refresh token, it is error");
    return null;
  }
};

export const generateAccessToken = async (id, res) => {
  console.log(id);
  const accessToken = jwt.sign({ id }, process.env.ACCESSTOKEN_SEC, {
    expiresIn: "1m",
  });

  const ver = jwt.verify(accessToken, process.env.ACCESSTOKEN_SEC);
  console.log(ver);

  res.cookie("accessToken", accessToken, {
    httpOnly: false,
    secure: false,
    sameSite: "none",
    maxAge: 1 * 60 * 1000,
  });
};

export const revokeRefreshToken = async (userId) => {
  await redisClient.del(`refresh_token${userId}`);
};
