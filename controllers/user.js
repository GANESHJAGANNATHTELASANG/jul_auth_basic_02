import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "express-mongo-sanitize";

export const register = TryCatch(async (req, res) => {
  console.log("1");
  console.log(req.body);
  const { name, email, password } = sanitize(req.body);
  console.log("2");
  return res.status(200).json({ message: "done register" });
});
