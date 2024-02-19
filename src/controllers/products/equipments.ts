import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import {
	insertProductEquipmentSchema,
	productsEquipments,
} from "~/database/schema";
import { response } from "~/shared/utils";
import { paramsValidator } from "~/shared/validators";

import { equipmentExists } from "../equipments";
import { productExists } from "./products";
import { updateProductionCost } from "./utils";

const app = new Hono();

/**
 * Wether the product-equipment exists.
 */
async function productEquipmentExists(id: number) {
	return (
		(await db.query.productsEquipments.findFirst({
			where: (productsEquipments, { eq }) =>
				eq(productsEquipments.id, id),
		})) !== undefined
	);
}

/**
 * Assigns an equipment to a product.
 */
app.post(
	"/",
	validator("json", (json, c) => {
		const parsedProductEquipment =
			insertProductEquipmentSchema.safeParse(json);

		if (!parsedProductEquipment.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsedProductEquipment.data;
	}),
	async (c) => {
		const productEquipment = c.req.valid("json");

		if (!(await productExists(productEquipment.productId))) {
			return response(c, {
				status: 404,
				message: "Product not found",
			});
		}

		if (!(await equipmentExists(productEquipment.equipmentId))) {
			return response(c, {
				status: 404,
				message: "Equipment not found",
			});
		}

		// Wether the product already has the equipment.
		const productHasEquipment =
			(await db.query.products.findFirst({
				columns: {
					id: true,
				},
				where: (products, { eq }) =>
					eq(products.id, productEquipment.productId),
				with: {
					equipments: {
						where: (equipments, { eq }) =>
							eq(
								equipments.equipmentId,
								productEquipment.equipmentId,
							),
					},
				},
			})) !== undefined;

		if (productHasEquipment) {
			return response(c, {
				status: 400,
				message: "Equipment is already assigned to product",
			});
		}

		await db.insert(productsEquipments).values(productEquipment);
		await updateProductionCost({ productId: productEquipment.productId });

		return response(c, { status: 200 });
	},
);

/**
 * Updates a product-equipment.
 */
app.put(
	"/:id",
	validator("param", paramsValidator),
	validator("json", (json, c) => {
		const parsedProductEquipment = insertProductEquipmentSchema
			.pick({ hours: true })
			.safeParse(json);

		if (!parsedProductEquipment.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsedProductEquipment.data;
	}),
	async (c) => {
		const productEquipmentId = c.req.valid("param").id;

		if (!(await productEquipmentExists(productEquipmentId))) {
			return response(c, {
				status: 404,
				message: "Product equipment not found",
			});
		}

		await db
			.update(productsEquipments)
			.set({
				hours: c.req.valid("json").hours,
			})
			.where(eq(productsEquipments.id, productEquipmentId));

		await updateProductionCost({ productEquipmentId });

		return response(c, { status: 200 });
	},
);

/**
 * Deletes a product-equipment.
 */
// eslint-disable-next-line drizzle/enforce-delete-with-where
app.delete("/:id", validator("param", paramsValidator), async (c) => {
	const productEquipmentId = c.req.valid("param").id;

	if (!(await productEquipmentExists(productEquipmentId))) {
		return response(c, {
			status: 404,
			message: "Product equipment not found",
		});
	}

	await db
		.delete(productsEquipments)
		.where(eq(productsEquipments.id, productEquipmentId));

	await updateProductionCost({ productEquipmentId });

	return response(c, { status: 200 });
});

export default app;
