import { type Context, Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import { insertSaleSchema, sales } from "~/database/schema";
import { response } from "~/shared/utils";
import { paramsValidator } from "~/shared/validators";

const app = new Hono();

/**
 * Wether the sale exists.
 */
export async function saleExists(id: number) {
	return (
		(await db.query.sales.findFirst({
			where: (sales, { eq }) => eq(sales.id, id),
		})) !== undefined
	);
}

/**
 * Validates the JSON of a sale.
 *
 * @param json - The json from the request.
 * @param context - The app context.
 * @returns The error response or the parsed data.
 */
export function saleValidator(json: any, context: Context) {
	const parsedSale = insertSaleSchema.safeParse(json);

	if (!parsedSale.success) {
		return response(context, {
			status: 422,
			message: "The payload schema is invalid",
		});
	}

	return parsedSale.data;
}

/**
 * Creates a sale.
 */
app.post("/", validator("json", saleValidator), async (c) => {
	await db.insert(sales).values(c.req.valid("json"));
	return response(c, { status: 200 });
});

/**
 * Get the sales.
 */
app.get("/", async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.sales.findMany(),
	});
});

/**
 * Get the sale by `id`.
 */
app.get("/:id", validator("param", paramsValidator), async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.sales.findFirst({
			where: (sales, { eq }) => eq(sales.id, c.req.valid("param").id),
		}),
	});
});

export default app;
