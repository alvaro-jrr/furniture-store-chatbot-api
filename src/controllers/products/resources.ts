import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import {
	insertProductResourceSchema,
	productsResources,
} from "~/database/schema";
import { response } from "~/shared/utils";
import { paramsValidator } from "~/shared/validators";

import { resourceExists } from "../resources";
import { productExists } from "./products";
import { updateProductionCost } from "./utils";

const app = new Hono();

/**
 * Wether the product-resource exists.
 */
async function productResourceExists(id: number) {
	return (
		(await db.query.productsResources.findFirst({
			where: (productsResources, { eq }) => eq(productsResources.id, id),
		})) !== undefined
	);
}

/**
 * Assigns a resource to a product.
 */
app.post(
	"/",
	validator("json", (json, c) => {
		const parsedProductResource =
			insertProductResourceSchema.safeParse(json);

		if (!parsedProductResource.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsedProductResource.data;
	}),
	async (c) => {
		const productResource = c.req.valid("json");

		if (!(await productExists(productResource.productId))) {
			return response(c, {
				status: 404,
				message: "Product not found",
			});
		}

		if (!(await resourceExists(productResource.resourceId))) {
			return response(c, {
				status: 404,
				message: "Resource not found",
			});
		}

		// Wether the product already has the resource.
		const productHasResource =
			(await db.query.products.findFirst({
				columns: {
					id: true,
				},
				where: (products, { eq }) =>
					eq(products.id, productResource.productId),
				with: {
					resources: {
						where: (resources, { eq }) =>
							eq(
								resources.resourceId,
								productResource.resourceId,
							),
					},
				},
			})) !== undefined;

		if (productHasResource) {
			return response(c, {
				status: 400,
				message: "Resource is already assigned to product",
			});
		}

		await db.insert(productsResources).values(productResource);
		await updateProductionCost({ productId: productResource.productId });

		return response(c, { status: 200 });
	},
);

/**
 * Updates a product-resource.
 */
app.put(
	"/:id",
	validator("param", paramsValidator),
	validator("json", (json, c) => {
		const parsedProductResource = insertProductResourceSchema
			.pick({ quantity: true })
			.safeParse(json);

		if (!parsedProductResource.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsedProductResource.data;
	}),
	async (c) => {
		const productResourceId = c.req.valid("param").id;

		if (!(await productResourceExists(productResourceId))) {
			return response(c, {
				status: 404,
				message: "Product resource not found",
			});
		}

		await db
			.update(productsResources)
			.set({
				quantity: c.req.valid("json").quantity,
			})
			.where(eq(productsResources.id, productResourceId));

		await updateProductionCost({ productResourceId });

		return response(c, { status: 200 });
	},
);

/**
 * Deletes a product-resource.
 */
// eslint-disable-next-line drizzle/enforce-delete-with-where
app.delete("/:id", validator("param", paramsValidator), async (c) => {
	const productResourceId = c.req.valid("param").id;

	if (!(await productResourceExists(productResourceId))) {
		return response(c, {
			status: 404,
			message: "Product equipment not found",
		});
	}

	await db
		.delete(productsResources)
		.where(eq(productsResources.id, productResourceId));

	await updateProductionCost({ productResourceId });

	return response(c, { status: 200 });
});

export default app;
