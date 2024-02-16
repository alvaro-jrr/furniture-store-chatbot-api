import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

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
	if (typeof message === "undefined" && typeof data === "undefined") {
		throw new Error("A message or data must be sent");
	}

	return context.json(
		{
			status,
			message,
			data,
		},
		status,
	);
}
