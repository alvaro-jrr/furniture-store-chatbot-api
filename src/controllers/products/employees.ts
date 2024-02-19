import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import {
	insertProductEmployeeSchema,
	productsEmployees,
} from "~/database/schema";
import { response } from "~/shared/utils";
import { paramsValidator } from "~/shared/validators";

import { employeeExists } from "../employees";
import { productExists } from "./products";
import { updateProductionCost } from "./utils";

const app = new Hono();

/**
 * Wether the product-employee exists.
 */
async function productEmployeeExists(id: number) {
	return (
		(await db.query.productsEmployees.findFirst({
			where: (productsEmployees, { eq }) => eq(productsEmployees.id, id),
		})) !== undefined
	);
}

/**
 * Assigns an employee to a product.
 */
app.post(
	"/",
	validator("json", (json, c) => {
		const parsedProductEmployee =
			insertProductEmployeeSchema.safeParse(json);

		if (!parsedProductEmployee.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsedProductEmployee.data;
	}),
	async (c) => {
		const productEmployee = c.req.valid("json");

		if (!(await productExists(productEmployee.productId))) {
			return response(c, {
				status: 404,
				message: "Product not found",
			});
		}

		if (!(await employeeExists(productEmployee.employeeId))) {
			return response(c, {
				status: 404,
				message: "Employee not found",
			});
		}

		// Wether the product already has the employee.
		const productHasEmployee =
			(await db.query.products.findFirst({
				columns: {
					id: true,
				},
				where: (products, { eq }) =>
					eq(products.id, productEmployee.productId),
				with: {
					employees: {
						where: (employees, { eq }) =>
							eq(
								employees.employeeId,
								productEmployee.employeeId,
							),
					},
				},
			})) !== undefined;

		if (productHasEmployee) {
			return response(c, {
				status: 400,
				message: "Employee is already assigned to product",
			});
		}

		await db.insert(productsEmployees).values(productEmployee);
		await updateProductionCost({ productId: productEmployee.productId });

		return response(c, { status: 200 });
	},
);

/**
 * Updates a product-employee.
 */
app.put(
	"/:id",
	validator("param", paramsValidator),
	validator("json", (json, c) => {
		const parsedProductEmployee = insertProductEmployeeSchema
			.pick({ hours: true })
			.safeParse(json);

		if (!parsedProductEmployee.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsedProductEmployee.data;
	}),
	async (c) => {
		const productEmployeeId = c.req.valid("param").id;

		if (!(await productEmployeeExists(productEmployeeId))) {
			return response(c, {
				status: 404,
				message: "Product employee not found",
			});
		}

		await db
			.update(productsEmployees)
			.set({
				hours: c.req.valid("json").hours,
			})
			.where(eq(productsEmployees.id, productEmployeeId));

		await updateProductionCost({ productEmployeeId });

		return response(c, { status: 200 });
	},
);

/**
 * Deletes a product-employee.
 */
// eslint-disable-next-line drizzle/enforce-delete-with-where
app.delete("/:id", validator("param", paramsValidator), async (c) => {
	const productEmployeeId = c.req.valid("param").id;

	if (!(await productEmployeeExists(productEmployeeId))) {
		return response(c, {
			status: 404,
			message: "Product employee not found",
		});
	}

	await db
		.delete(productsEmployees)
		.where(eq(productsEmployees.id, productEmployeeId));

	await updateProductionCost({ productEmployeeId });

	return response(c, { status: 200 });
});

export default app;
