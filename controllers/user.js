import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import { registerSchema } from "../config/zod.js";

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

  return res.status(200).json({ message: "done register" });
});
