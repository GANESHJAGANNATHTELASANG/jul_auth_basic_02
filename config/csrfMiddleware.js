import crypto from "crypto";
import { redisClient } from "..";

export const generateCSRFToken = async (userId, res) => {
  const csrfToken = crypto.randomBytes(32).toString("hex");

  csrfKey = `csrf${userId}`;

  redisClient.setEx(csrfKey, 3600, csrfToken);

  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    sameSite: "none",
    security: true,
    maxAge: 60 * 60 * 1000,
  });

  return csrfToken;
};

export const verifyCSRFToken = async (req, res, next) => {
  try {
    if (req.method === "GET") {
      return next();
    }

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "the user is not authonticated" });
    }

    const clintToken = req.header["x-csrf-token"];

    if (!clintToken) {
      return res.status(403).json({
        message: "page reload again csrf token is missing",
        code: "CSRF_TOKEN_MISSING",
      });
    }

    const csrfTokenKey = `csrf${userId}`;

    const storedToken = redisClient.get(csrfTokenKey);

    if (!storedToken) {
      return res.status(403).json({
        message: "the csrf token is expired so load again",
        code: "CSRF_TOKEN_MISSING",
      });
    }

    if (storedToken != clintToken) {
      return res.status(403).json({
        message: "the csrf token is not matching, so load again",
        code: "CSRF_TOKEN_INVALID",
      });
    }

    next();
  } catch (error) {
    console.log("the error in csrf verfication error", error);
    return res.status(500).json({
      message: "the erorr in verifivation of csrf token",
      code: "CSRF_TOKEN_VERIFICATION_ERROR",
    });
  }
};

export const revokeCSRFToken = async (userId) => {
  const csrfKey = `{csrf${userId}`;

  await redisClient.del(csrfKey);
};

export const refreshCSRFToken = async (userId) => {
  await revokeCSRFToken(userId);
  return await generateCSRFToken(userId, res);
};
