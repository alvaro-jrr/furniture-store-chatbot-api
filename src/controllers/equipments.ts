import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import { equipments, insertEquipmentSchema } from "~/database/schema";
import { response } from "~/shared/utils";
import { paramsValidator } from "~/shared/validators";

import { employeeValidator } from "./employees";

const app = new Hono();

/**
 * Wether the equipment exists.
 */
export async function equipmentExists(id: number) {
	return (
		(await db.query.equipments.findFirst({
			where: (equipments, { eq }) => eq(equipments.id, id),
		})) !== undefined
	);
}

/**
 * Validates the JSON of an equipment..
 *
 * @param json - The json from the request.
 * @param context - The app context.
 * @returns The error response or the parsed data.
 */
export function equipmentValidator(json: any, context: Context) {
	const parseedEquipment = insertEquipmentSchema.safeParse(json);

	if (!parseedEquipment.success) {
		return response(context, {
			status: 422,
			message: "The payload schema is invalid",
		});
	}

	return parseedEquipment.data;
}

/**
 * Creates an equipmment.
 */
app.post("/", validator("json", equipmentValidator), async (c) => {
	await db.insert(equipments).values(c.req.valid("json"));
	return response(c, { status: 200 });
});

/**
 * Get the equipments.
 */
app.get("/", async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.equipments.findMany(),
	});
});

/**
 * Get the equipment by `id`.
 */
app.get("/:id", validator("param", paramsValidator), async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.equipments.findFirst({
			where: (equipments, { eq }) =>
				eq(equipments.id, c.req.valid("param").id),
		}),
	});
});

/**
 * Updates an equipment.
 */
app.put(
	"/:id",
	validator("param", paramsValidator),
	validator("json", employeeValidator),
	async (c) => {
		const equipmentId = c.req.valid("param").id;

		if (!(await equipmentExists(equipmentId))) {
			return response(c, {
				status: 404,
				message: "Equipment not found",
			});
		}

		const { id, ...equipmentWithoutId } = c.req.valid("json");

		await db
			.update(equipments)
			.set(equipmentWithoutId)
			.where(eq(equipments.id, equipmentId));

		return response(c, { status: 200 });
	},
);

/**
 * Deletes an equipment.
 */
// eslint-disable-next-line drizzle/enforce-delete-with-where
app.delete("/:id", validator("param", paramsValidator), async (c) => {
	const equipmentId = c.req.valid("param").id;

	if (!(await equipmentExists(equipmentId))) {
		return response(c, {
			status: 404,
			message: "Equipment not found",
		});
	}

	// Wether the employee participated in a product.
	const hasRelatedProducts =
		(await db.query.productsEquipments.findFirst({
			where: (productsEmployees, { eq }) =>
				eq(productsEmployees.equipmentId, equipmentId),
		})) !== undefined;

	if (hasRelatedProducts) {
		return response(c, {
			status: 400,
			message: "The equipment has related products",
		});
	}

	await db.delete(equipments).where(eq(equipments.id, equipmentId));
	return response(c, { status: 200 });
});

export default app;
