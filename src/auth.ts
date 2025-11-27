import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./infrastructures/db.infrastructure";
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
    plugins: [admin()],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true
    },
});
