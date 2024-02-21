import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import { insertResourceSchema, resources } from "~/database/schema";
import { response } from "~/shared/utils";
import { paramsValidator } from "~/shared/validators";

const app = new Hono();

/**
 * Wether the resource exists.
 */
export async function resourceExists(id: number) {
	return (
		(await db.query.resources.findFirst({
			where: (resources, { eq }) => eq(resources.id, id),
		})) !== undefined
	);
}

/**
 * Validates the JSON of a resource.
 *
 * @param json - The json from the request.
 * @param context - The app context.
 * @returns The error response or the parsed data.
 */
export function resourceValidator(json: any, context: Context) {
	const parsedResource = insertResourceSchema.safeParse(json);

	if (!parsedResource.success) {
		return response(context, {
			status: 422,
			message: "The payload schema is invalid",
		});
	}

	return parsedResource.data;
}

/**
 * Creates a resource.
 */
app.post("/", validator("json", resourceValidator), async (c) => {
	await db.insert(resources).values(c.req.valid("json"));
	return response(c, { status: 200 });
});

/**
 * Get the resources.
 */
app.get("/", async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.resources.findMany(),
	});
});

/**
 * Get the resource by `id`.
 */
app.get("/:id", validator("param", paramsValidator), async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.resources.findFirst({
			where: (resources, { eq }) =>
				eq(resources.id, c.req.valid("param").id),
		}),
	});
});

/**
 * Updates a resource.
 */
app.put(
	"/:id",
	validator("param", paramsValidator),
	validator("json", resourceValidator),
	async (c) => {
		const resourceId = c.req.valid("param").id;

		if (!(await resourceExists(resourceId))) {
			return response(c, {
				status: 404,
				message: "Resource not found",
			});
		}

		const { id, ...resourceWithoutId } = c.req.valid("json");

		await db
			.update(resources)
			.set(resourceWithoutId)
			.where(eq(resources.id, resourceId));

		return response(c, { status: 200 });
	},
);

/**
 * Deletes a resource.
 */
// eslint-disable-next-line drizzle/enforce-delete-with-where
app.delete("/:id", validator("param", paramsValidator), async (c) => {
	const resourceId = c.req.valid("param").id;

	if (!(await resourceExists(resourceId))) {
		return response(c, {
			status: 404,
			message: "Resource not found",
		});
	}
	await db.delete(resources).where(eq(resources.id, resourceId));
	return response(c, { status: 200 });
});

export default app;
