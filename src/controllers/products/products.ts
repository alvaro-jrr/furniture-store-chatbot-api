import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import { insertProductSchema, products } from "~/database/schema";
import { response } from "~/shared/utils";
import { paramsValidator } from "~/shared/validators";

import employees from "./employees";
import equipments from "./equipments";

const app = new Hono();

// Relation routes.
app.route("/employees", employees);
app.route("/equipments", equipments);

/**
 * Wether the product exists.
 */
export async function productExists(id: number) {
	return (
		(await db.query.products.findFirst({
			where: (products, { eq }) => eq(products.id, id),
		})) !== undefined
	);
}

/**
 * Validates the JSON of a product.
 *
 * @param json - The json from the request.
 * @param context - The app context.
 * @returns The error response or the parsed data.
 */
function productValidator(json: any, context: Context) {
	const parsedProduct = insertProductSchema.safeParse(json);

	if (!parsedProduct.success) {
		return response(context, {
			status: 422,
			message: "The payload schema is invalid",
		});
	}

	return parsedProduct.data;
}

/**
 * Creates a product.
 */
app.post("/", validator("json", productValidator), async (c) => {
	await db.insert(products).values(c.req.valid("json"));
	return response(c, { status: 200 });
});

/**
 * Get the products.
 */
app.get("/", async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.products.findMany(),
	});
});

/**
 * Get the product by `id`.
 */
app.get("/:id", validator("param", paramsValidator), async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.products.findFirst({
			where: (products, { eq }) =>
				eq(products.id, c.req.valid("param").id),
		}),
	});
});

/**
 * Updates a product.
 */
app.put(
	"/:id",
	validator("param", paramsValidator),
	validator("json", productValidator),
	async (c) => {
		const productId = c.req.valid("param").id;

		if (!(await productExists(productId))) {
			return response(c, {
				status: 404,
				message: "Product not found",
			});
		}

		const { id, ...productWithoutId } = c.req.valid("json");

		await db
			.update(products)
			.set(productWithoutId)
			.where(eq(products.id, productId));

		return response(c, { status: 200 });
	},
);

/**
 * Deletes a product.
 */
// eslint-disable-next-line drizzle/enforce-delete-with-where
app.delete("/:id", validator("param", paramsValidator), async (c) => {
	const productId = c.req.valid("param").id;

	if (!(await productExists(productId))) {
		return response(c, {
			status: 404,
			message: "Product not found",
		});
	}
	await db.delete(products).where(eq(products.id, productId));
	return response(c, { status: 200 });
});

export default app;
