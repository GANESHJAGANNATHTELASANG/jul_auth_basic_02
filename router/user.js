import express from "express";
import { loginUser, register, verifyUser } from "../controllers/user.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify/:token", verifyUser);
router.post("/login", loginUser);

export default router;
