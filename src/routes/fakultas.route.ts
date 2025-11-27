import { Hono } from "hono";
import { RegExpRouter } from "hono/router/reg-exp-router";
import FakultasHandler from "../handlers/fakultas.handler";
import { zValidator } from "@hono/zod-validator";
import { postFakultasSchema, putFakultasSchema } from "../validators/fakultas.validator";
import { zodError } from "../utils/zod-error.util";
import AuthMiddleware from "../middlewares/auth.middleware";

const fakultasRoute = new Hono({ router: new RegExpRouter() });

// Public routes - bisa diakses tanpa login
fakultasRoute.get("/fakultas", FakultasHandler.getAll);
fakultasRoute.get("/fakultas/:id", FakultasHandler.get);

// Protected routes - harus login untuk mengakses
fakultasRoute.post("/fakultas", AuthMiddleware.requireAuth, zValidator("json", postFakultasSchema, zodError), FakultasHandler.post);
fakultasRoute.put("/fakultas/:id", AuthMiddleware.requireAuth, zValidator("json", putFakultasSchema, zodError), FakultasHandler.put);
fakultasRoute.delete("/fakultas/:id", AuthMiddleware.requireAuth, FakultasHandler.delete);

export default fakultasRoute;