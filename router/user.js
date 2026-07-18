import express from "express";
import {
  loginUser,
  myProfile,
  register,
  verifyOtp,
  verifyUser,
} from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/myProfile", isAuth, myProfile);
export default router;
