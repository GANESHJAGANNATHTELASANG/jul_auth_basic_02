import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
await connectDB();

//redis connection
const redis_url = process.env.REDIS_URL;

if (!redis_url) {
  console.log("redis url is not found ");
  process.exit(1);
}

export const redisClient = createClient({
  url: redis_url,
});

redisClient
  .connect()
  .then(() => {
    console.log("redis is connected");
  })
  .catch((error) => {
    console.log(`error in connecting redis ${error}`);
  });

// ---------redis code-----------//

const app = express();

//middleware
app.use(express.json()); // ✅ This is required
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

// router is importing
import userRoutes from "./router/user.js";
//usong route
app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 4545;

app.listen(PORT, () => {
  console.log("hello ganesh");
});
