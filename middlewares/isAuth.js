import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";
import { User } from "../models/user.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    console.log(token);

    if (!token) {
      return res
        .status(403)
        .json({ message: "the access token is  not there " });
    }

    const decoded = jwt.verify(token, process.env.ACCESSTOKEN_SEC);

    if (!decoded) {
      return res.status(400).json({ message: "the access token is expired" });
    }

    const cachUser = await redisClient.get(`user${decoded.id}`);

    if (cachUser) {
      req.user = JSON.parse(cachUser);
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    console.log(user);

    if (!user) {
      return res.status(400).json({ message: "user not found " });
    }

    await redisClient.setEx(`user${user._id}`, 3600, JSON.stringify(user));
    console.log(user);

    req.user = user;
    console.log(user);
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
