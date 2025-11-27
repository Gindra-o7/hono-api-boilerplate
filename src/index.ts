import { Hono } from "hono";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { BlankEnv, BlankSchema } from "hono/types";
import GlobalHandler from "./handlers/global.handler";
import globalRoute from "./routes/global.route";
import LogMiddleware from "./middlewares/log.middleware";
import AuthMiddleware from "./middlewares/auth.middleware";
import universitasRoute from "./routes/universitas.route";
import fakultasRoute from "./routes/fakultas.route";
import { auth } from "./auth";

// Init Hono Object and Load environment variables from .env file
const app: Hono<BlankEnv, BlankSchema, "/"> = new Hono({
  router: new RegExpRouter(),
});

// Handler untuk better-auth dengan dukungan Origin header
// Mendukung semua HTTP methods (GET, POST, PUT, DELETE, etc.)
app.on(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], "/api/auth/**", async (c) => {
  let request = c.req.raw;

  // Jika Origin header tidak ada, tambahkan berdasarkan baseURL (yang sudah ada di trustedOrigins)
  if (!request.headers.get("Origin")) {
    const baseURL = process.env.BETTER_AUTH_URL || process.env.BASE_URL || `http://localhost:${process.env.APP_PORT || 5000}`;

    // Clone headers dan tambahkan Origin
    const headers = new Headers(request.headers);
    headers.set("Origin", baseURL);

    // Buat request baru dengan Origin header, pastikan body di-clone dengan benar
    request = new Request(request.url, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS' ? request.body : null,
      redirect: request.redirect,
    });
  }

  return auth.handler(request);
});

const { APP_PORT }: NodeJS.ProcessEnv = process.env;

// Load all available middlewares
app.use("*", LogMiddleware.hanzLogger);
// app.use("*", AuthMiddleware.authenticateAndSyncUser);

// Load all default routes for common handling
app.notFound(GlobalHandler.notFound);
app.onError(GlobalHandler.error);

// Load all available routes
app.route("/", globalRoute);
app.route("/", fakultasRoute);
app.route("/", universitasRoute);

export default {
  port: APP_PORT || 5000,
  fetch: app.fetch,
};

console.log(`[INFO] Server is on fire at port ${APP_PORT}! 🔥`);
