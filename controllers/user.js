import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import { loginSchema, registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";

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

  const hashPassword = await bcrypt.hash(password, 12);

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

  await redisClient.set(rateLimit, "true", { EX: 60 });

  return res.status(200).json({ message: "done register" });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "the token is not there" });
  }

  const verifyToken = `verify:${token}`;

  const userDataJson = await redisClient.get(verifyToken);

  if (!userDataJson) {
    return res
      .status(400)
      .json({ message: "the verification link is expired plz try again" });
  }

  await redisClient.del(verifyToken);

  const userData = JSON.parse(userDataJson);

  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    return res.status(400).json({ message: "the user already exist" });
  }

  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  return res.status(201).json({ message: "the user acc is created" });
});

export const loginUser = TryCatch(async (req, res) => {
  const saniti = sanitize(req.body);
  const validation = loginSchema.safeParse(saniti);

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

  const { email, password } = req.body;

  const rateLimit = `login-rate-limit${req.ip}:${email}`;

  if (await redisClient.get(rateLimit)) {
    return res
      .status(400)
      .json({ message: "wait a min u hit the max time for verification" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "the user not found and credentials are not found = E",
    });
  }

  const checkPass = bcrypt.compare(user.password, password);

  if (!checkPass) {
    return res
      .status(400)
      .json({ message: "the credentials are not correct = P" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, JSON.parse(otp), { EX: "300" });

  const subject = "the otp verification plx give us ur otp ";

  const html = getOtpHtml({ email, otp });

  await sendMail({ email, subject, html });

  await redisClient.set(rateLimit, "true", { EX: 60 });

  return res
    .status(200)
    .json({ message: "the mail is send for otp verification" });
});
