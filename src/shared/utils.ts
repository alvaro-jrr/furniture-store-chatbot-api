import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import type { JwtPayload } from "./types";
import "dotenv/config";
import dayjs from "dayjs";
import { sign } from "hono/jwt";
import { envSchema, jwtPayloadSchema } from "./schema";

export function validateNumberPrecision({
	value,
	maxPrecision = 0,
}: {
	value: number;
	maxPrecision: number;
}) {
	if (maxPrecision < 0) {
		throw new Error("Max precision must be bigger or equal to 0");
	}

	const [, decimals = ""] = String(value).split(".");
	return decimals.length <= maxPrecision;
}

export function response(
	context: Context,
	{
		status,
		message,
		data,
	}: {
		status: StatusCode;
		message?: string;
		data?: unknown;
	},
) {
	return context.json(
		{
			status,
			message,
			data,
		},
		status,
	);
}

/**
 * Returns the env variables.
 *
 * @returns The env variables.
 */
export function getEnv() {
	return envSchema.parse(process.env);
}

/**
 * Sets the JWT payload for the user and returns the token.
 *
 * @param context - The app context.
 * @param userId - The user id to save.
 * @returns The JWT token.
 */
export async function setJwt(context: Context, userId: number) {
	const now = dayjs();
	const payload = {
		iat: now.unix(),
		nbf: now.unix(),
		exp: now.add(1, "day").unix(), // Expires in 1 day.
		userId,
	} satisfies JwtPayload;

	context.set("jwtPayload", payload);
	return await sign(payload, getEnv().JWT_SECRET);
}

/**
 * Returns the JWT payload.
 *
 * @param context - The app context.
 * @returns The JWT payload.
 */
export async function getJwt(context: Context) {
	const payload = jwtPayloadSchema.safeParse(context.get("jwtPayload"));

	return payload.success ? payload.data : null;
}
