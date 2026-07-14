import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
dotenv.config();
await connectDB();

const app = express();
app.use(express.json()); // ✅ This is required

// router is importing
import userRoutes from "./router/user.js";
//usong route
app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 4545;

app.listen(PORT, () => {
  console.log("hello ganesh");
});
