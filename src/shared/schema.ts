import { z } from "zod";

export const envSchema = z.object({
	JWT_SECRET: z.string().min(5),
	DB_HOST: z.union([z.literal("localhost"), z.string().ip()]),
	DB_DATABASE: z.string().min(1),
	DB_USERNAME: z.string().min(1).optional(),
	DB_PASSWORD: z.string().min(1).optional(),
});

export const jwtPayloadSchema = z.object({
	iat: z.number(),
	nbf: z.number(),
	exp: z.number(),
	userId: z.number(),
});

export const paramSchema = z.object({
	id: z.coerce.number().nonnegative(),
});
