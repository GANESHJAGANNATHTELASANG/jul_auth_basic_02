import express from "express";
import {
  loginUser,
  logoutUser,
  myProfile,
  refreshCSRF,
  refreshToken,
  register,
  verifyOtp,
  verifyUser,
} from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";
import { verifyCSRFToken } from "../config/csrfMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/myProfile", isAuth, myProfile);
router.post("/refresh", refreshToken);
router.post("/logout", isAuth, verifyCSRFToken, logoutUser);
router.post("/refresh-csrf", isAuth, refreshCSRF);
export default router;
