import { eq } from "drizzle-orm";

import { db } from "~/database/database";
import { products } from "~/database/schema";

/**
 * Updates the production cost of a product based on the id set.
 *
 * @param productId - The product id.
 */
export async function updateProductionCost({
	productId,
	productEmployeeId,
}: {
	productId?: number;
	productEmployeeId?: number;
}) {
	// Verify that only an id is set.
	if (
		[productId, productEmployeeId].filter((id) => id !== undefined)
			.length === 1
	) {
		throw new Error("Only set an id for the product query");
	}

	const product = await db.query.products.findFirst({
		columns: {
			id: true,
		},
		where:
			productId === undefined
				? undefined
				: (product, { eq }) => eq(product.id, productId),
		with: {
			employees: {
				columns: { hours: true },
				where:
					productEmployeeId === undefined
						? undefined
						: (productEmployee, { eq }) =>
								eq(productEmployee.id, productEmployeeId),
				with: {
					employee: {
						columns: { hourlyRate: true },
					},
				},
			},
			equipments: {
				columns: { hours: true },
				with: {
					equipment: {
						columns: { hourlyRate: true },
					},
				},
			},
			resources: {
				columns: { quantity: true },
				with: {
					resource: {
						columns: { unitPrice: true },
					},
				},
			},
		},
	});

	if (product === undefined) return;

	// Calculate the employees cost.
	const employeesCost = product.employees.reduce(
		(previous, current) =>
			previous + current.hours * parseFloat(current.employee.hourlyRate),
		0,
	);

	// Calculate the equipments cost.
	const equipmentsCost = product.equipments.reduce(
		(previous, current) =>
			previous + current.hours * parseFloat(current.equipment.hourlyRate),
		0,
	);

	// Calculate the resources cost.
	const resourcesCost = product.resources.reduce(
		(previous, current) =>
			previous +
			current.quantity * parseFloat(current.resource.unitPrice),
		0,
	);

	await db
		.update(products)
		.set({
			productionCost: (
				employeesCost +
				equipmentsCost +
				resourcesCost
			).toFixed(2),
		})
		.where(eq(products.id, product.id));
}
