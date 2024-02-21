import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import { clients, insertClientSchema } from "~/database/schema";
import { response } from "~/shared/utils";
import { paramsValidator } from "~/shared/validators";

const app = new Hono();

/**
 * Wether the client exists.
 */
export async function clientExists(id: number) {
	return (
		(await db.query.clients.findFirst({
			where: (clients, { eq }) => eq(clients.id, id),
		})) !== undefined
	);
}

/**
 * Validates the JSON of an employee.
 *
 * @param json - The json from the request.
 * @param context - The app context.
 * @returns The error response or the parsed data.
 */
export function clientValidator(json: any, context: Context) {
	const parsedClient = insertClientSchema.safeParse(json);

	if (!parsedClient.success) {
		return response(context, {
			status: 422,
			message: "The payload schema is invalid",
		});
	}

	return parsedClient.data;
}

/**
 * Creates a client.
 */
app.post("/", validator("json", clientValidator), async (c) => {
	await db.insert(clients).values(c.req.valid("json"));
	return response(c, { status: 200 });
});

/**
 * Get the clients.
 */
app.get("/", async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.clients.findMany(),
	});
});

/**
 * Get the client by `id`.
 */
app.get("/:id", validator("param", paramsValidator), async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.clients.findFirst({
			where: (clients, { eq }) => eq(clients.id, c.req.valid("param").id),
		}),
	});
});

/**
 * Updates a client.
 */
app.put(
	"/:id",
	validator("param", paramsValidator),
	validator("json", clientValidator),
	async (c) => {
		const clientId = c.req.valid("param").id;

		if (!(await clientExists(clientId))) {
			return response(c, {
				status: 404,
				message: "Client not found",
			});
		}

		const { id, ...clientWithoutId } = c.req.valid("json");

		await db
			.update(clients)
			.set(clientWithoutId)
			.where(eq(clients.id, clientId));

		return response(c, { status: 200 });
	},
);

/**
 * Deletes a client.
 */
// eslint-disable-next-line drizzle/enforce-delete-with-where
app.delete("/:id", validator("param", paramsValidator), async (c) => {
	const clientId = c.req.valid("param").id;

	if (!(await clientExists(clientId))) {
		return response(c, {
			status: 404,
			message: "Client not found",
		});
	}

	// Wether the client has sales.
	const hasRelatedSales =
		(await db.query.sales.findFirst({
			where: (sales, { eq }) => eq(sales.clientId, clientId),
		})) !== undefined;

	if (hasRelatedSales) {
		return response(c, {
			status: 400,
			message: "The client has related sales",
		});
	}

	await db.delete(clients).where(eq(clients.id, clientId));
	return response(c, { status: 200 });
});

export default app;
