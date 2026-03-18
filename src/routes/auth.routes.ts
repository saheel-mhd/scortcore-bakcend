import { Router } from "express";

import { authController } from "../controllers/auth.controller.js";
import { authRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { loginValidationSchema, registerValidationSchema } from "../validations/auth.validation.js";

const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimitMiddleware,
  validateRequest(registerValidationSchema),
  authController.registerUser,
);
authRouter.post(
  "/login",
  authRateLimitMiddleware,
  validateRequest(loginValidationSchema),
  authController.loginUser,
);

export { authRouter };
export default authRouter;
