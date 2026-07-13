import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
dotenv.config();
await connectDB();

const app = express();

// router is importing
import userRoutes from "./router/user.js";
app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 4545;

app.listen(PORT, () => {
  console.log("hello ganesh");
});
