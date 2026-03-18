import { Router } from "express";

import { Role } from "@prisma/client";
import { userController } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createUserValidationSchema,
  deleteUserValidationSchema,
  getUserValidationSchema,
  listUsersValidationSchema,
  updateUserValidationSchema,
} from "../validations/user.validation.js";

const userRouter = Router();

userRouter.use(authenticate, authorize(Role.admin));

userRouter.get("/", validateRequest(listUsersValidationSchema), userController.listUsers);
userRouter.get("/:id", validateRequest(getUserValidationSchema), userController.getUser);
userRouter.post("/", validateRequest(createUserValidationSchema), userController.createUser);
userRouter.put("/:id", validateRequest(updateUserValidationSchema), userController.updateUser);
userRouter.delete("/:id", validateRequest(deleteUserValidationSchema), userController.deleteUser);

export { userRouter };
export default userRouter;
