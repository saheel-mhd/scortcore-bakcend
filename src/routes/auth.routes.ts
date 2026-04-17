import { Router } from "express";

import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authRateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  changePasswordValidationSchema,
  loginValidationSchema,
  registerValidationSchema,
} from "../validations/auth.validation.js";

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

authRouter.get("/me", authenticate, authController.getMe);
authRouter.put(
  "/me/password",
  authenticate,
  validateRequest(changePasswordValidationSchema),
  authController.changeMyPassword,
);

export { authRouter };
export default authRouter;
