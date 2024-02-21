import type { Context } from "hono";

import { paramSchema } from "./schema";
import { response } from "./utils";

/**
 * Validates the params from the request.
 *
 * @param params - The request params.
 * @param context - The app context.
 * @returns The error response or params data.
 */
export function paramsValidator(
	params: Record<string, string>,
	context: Context,
) {
	const parsedParams = paramSchema.safeParse(params);

	if (!parsedParams.success) {
		return response(context, {
			status: 400,
			message: "The params are invalid",
		});
	}

	return parsedParams.data;
}
