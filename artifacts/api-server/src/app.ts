import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
const appDir = path.dirname(fileURLToPath(import.meta.url));
const openApiSpecPath = path.resolve(appDir, "../../../lib/api-spec/openapi.yaml");
const openApiYaml = readFileSync(openApiSpecPath, "utf8");

function renderSwaggerUiHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SRE Command Center API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        background: #0b1020;
      }

      #swagger-ui {
        min-height: 100%;
        background: #fff;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin="anonymous"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/openapi.yaml",
          dom_id: "#swagger-ui",
          deepLinking: true,
          docExpansion: "list",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
        });
      };
    </script>
  </body>
</html>`;
}

app.get("/openapi.yaml", (_req, res) => {
  res.type("text/yaml").send(openApiYaml);
});

app.get(["/docs", "/docs/"], (_req, res) => {
  res.type("html").send(renderSwaggerUiHtml());
});

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
