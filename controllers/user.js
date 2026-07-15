import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import { registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
import { getVerifyEmailHtml } from "../config/html.js";

export const register = TryCatch(async (req, res) => {
  const saniti = sanitize(req.body);
  const validation = registerSchema.safeParse(saniti);

  if (!validation.success) {
    const zodError = validation.error;
    const firstErrorMesssage = "validation error";
    let allError = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allError = zodError.issues.map((issue) => ({
        feild: issue.path ? issue.path.join(".") : "unkonow",
        message: issue.message || "validation error",
        code: issue.code,
      }));
    }
    return res.status(400).json({
      message: firstErrorMesssage,
      error: allError,
    });
  }

  const { name, email, password } = req.body;

  const rateLimit = `register-rate-limit${req.ip}:${email}`;

  if (await redisClient.get(rateLimit)) {
    return res
      .status(400)
      .json({ message: "wait a min u hit the max time for verification" });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      message: "urs already exist we cant create ur acc use diffrent acc name ",
    });
  }

  const hashPassword = bcrypt.hash(password, 12);

  const verifyToken = crypto.randomBytes(32).toString("hex");

  const verifyKey = `verify:${verifyToken}`;

  const dataToStore = JSON.stringify({
    name,
    email,
    password: hashPassword,
  });

  await redisClient.set(verifyKey, dataToStore, { EX: 300 });

  const subject = "verify ur email id to register";
  const html = getVerifyEmailHtml({ email, token: verifyToken });

  await sendMail({ email, subject, html });

  return res.status(200).json({ message: "done register" });
});
