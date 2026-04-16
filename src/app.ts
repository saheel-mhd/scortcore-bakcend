import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";
import { AppError } from "./utils/app-error.js";

const app = express();
const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

console.log("[cors] allowed origins:", allowedOrigins);

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin:
      allowedOrigins.length === 1 && allowedOrigins[0] === "*"
        ? true
        : (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
              return;
            }

            callback(new AppError("Origin is not allowed by CORS", 403));
          },
  }),
);
app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
app.use(
  express.urlencoded({
    extended: true,
    limit: env.REQUEST_BODY_LIMIT,
    parameterLimit: 20,
  }),
);

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    data: {
      status: "ok",
    },
  });
});

app.use("/api", routes);

app.use((_request, _response, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorMiddleware);

export default app;
