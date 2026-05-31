import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { errorHandler } from "./middlewares/error-handler";

const isProduction = process.env.NODE_ENV === "production";

function getAllowedOrigins(): string[] {
  const raw = process.env["CORS_ORIGIN"];
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (!isProduction) {
    // Default dev origins — override with CORS_ORIGIN env var as needed
    return ["http://localhost:3000", "http://localhost:5173"];
  }
  logger.warn(
    "CORS_ORIGIN is not set in production — all cross-origin requests will be blocked",
  );
  return [];
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: getAllowedOrigins(), credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Global error handler — must be registered after all routes
app.use(errorHandler);

export default app;
