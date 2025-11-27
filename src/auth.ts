import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./infrastructures/db.infrastructure";

const baseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.APP_PORT || 5000}`;
const defaultTrustedOrigins = [
    baseURL,
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000'
];
const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? [...defaultTrustedOrigins, ...process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map(origin => origin.trim())]
    : defaultTrustedOrigins;

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: baseURL,
    basePath: "/api/auth",
    trustedOrigins: trustedOrigins,
    emailAndPassword: {
        enabled: true
    },
});
