import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { validator } from "hono/validator";
import { response } from "../shared/utils";
import { employees, insertEmployeeSchema } from "../database/schema";
import { db } from "../database/database";
import { paramsValidator } from "../shared/validators";

const app = new Hono();

/**
 * Wether the employee exists.
 */
async function employeeExists(id: number) {
	return (
		(await db.query.employees.findFirst({
			where: (employees, { eq }) => eq(employees.id, id),
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
export function employeeValidator(json: any, context: Context) {
	const parsedEmployee = insertEmployeeSchema.safeParse(json);

	if (!parsedEmployee.success) {
		return response(context, {
			status: 422,
			message: "The payload schema is invalid",
		});
	}

	return parsedEmployee.data;
}

/**
 * Creates an employee.
 */
app.post("/", validator("json", employeeValidator), async (c) => {
	// Create employee.
	await db.insert(employees).values(c.req.valid("json"));

	return response(c, { status: 200 });
});

/**
 * Get the employees.
 */
app.get("/", async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.employees.findMany(),
	});
});

/**
 * Get the employee by `id`.
 */
app.get("/:id", validator("param", paramsValidator), async (c) => {
	return response(c, {
		status: 200,
		data: await db.query.employees.findFirst({
			where: (employees, { eq }) =>
				eq(employees.id, c.req.valid("param").id),
		}),
	});
});

/**
 * Updates an employee.
 */
app.put(
	"/:id",
	validator("param", paramsValidator),
	validator("json", employeeValidator),
	async (c) => {
		const employeeId = c.req.valid("param").id;

		if (!(await employeeExists(employeeId))) {
			return response(c, {
				status: 404,
				message: "Employee not found",
			});
		}

		const { id, ...employeeWithoutId } = c.req.valid("json");

		// Update employee.
		await db
			.update(employees)
			.set(employeeWithoutId)
			.where(eq(employees.id, employeeId));

		return response(c, { status: 200 });
	},
);

/**
 * Deletes an employee.
 */
// eslint-disable-next-line drizzle/enforce-delete-with-where
app.delete("/:id", validator("param", paramsValidator), async (c) => {
	const employeeId = c.req.valid("param").id;

	if (!(await employeeExists(employeeId))) {
		return response(c, {
			status: 404,
			message: "Employee not found",
		});
	}

	// Wether the employee participated in a product.
	const hasRelatedProducts =
		(await db.query.productsEmployees.findFirst({
			where: (productsEmployees, { eq }) =>
				eq(productsEmployees.employeeId, employeeId),
		})) !== undefined;

	if (hasRelatedProducts) {
		return response(c, {
			status: 400,
			message: "The employee has related products",
		});
	}

	// Delete employee.
	await db.delete(employees).where(eq(employees.id, employeeId));

	return response(c, { status: 200 });
});

export default app;
