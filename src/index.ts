import { Hono } from "hono";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { BlankEnv, BlankSchema } from "hono/types";
import GlobalHandler from "./handlers/global.handler";
import globalRoute from "./routes/global.route";
import LogMiddleware from "./middlewares/log.middleware";
import universitasRoute from "./routes/universitas.route";
import fakultasRoute from "./routes/fakultas.route";
import { auth } from "./auth";
import { cors } from "hono/cors";

// Init Hono Object and Load environment variables from .env file
const app: Hono<BlankEnv, BlankSchema, "/"> = new Hono({
  router: new RegExpRouter(),
});

app.use(
	"/api/auth/*", // or replace with "*" to enable cors for all routes
	cors({
		origin: "http://localhost:3001", // replace with your origin
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.on(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
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
