import {
	bigint,
	decimal,
	int,
	mysqlEnum,
	mysqlTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { validateNumberPrecision } from "~/shared/utils";

/**
 * The users of the app.
 */
export const users = mysqlTable("users", {
	id: serial("id").primaryKey(),
	fullName: varchar("full_name", { length: 256 }).notNull(),
	email: varchar("email", { length: 256 }).unique().notNull(),
	password: varchar("password", { length: 256 }).notNull(),
	role: mysqlEnum("role", ["ADMIN", "USER"]).default("USER"),
});

export const insertUserSchema = createInsertSchema(users, {
	fullName: (schema) => schema.fullName.min(1),
	email: (schema) => schema.email.email(),
	password: (schema) => schema.password.min(1),
});

export const selectUserSchema = createSelectSchema(users);

/**
 * The messages sent by the user.
 */
export const messages = mysqlTable("messages", {
	id: serial("id").primaryKey(),
	userId: bigint("user_id", { unsigned: true, mode: "number" })
		.references(() => users.id, {
			onDelete: "cascade",
		})
		.notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
	text: varchar("message", { length: 256 }).notNull(),
});

export const insertMessageSchema = createInsertSchema(messages, {
	text: (schema) => schema.text.min(1),
});

export const selectMessageSchema = createSelectSchema(messages);

/**
 * The reply for the message.
 */
export const replies = mysqlTable("replies", {
	id: bigint("id", { mode: "number", unsigned: true })
		.primaryKey()
		.references(() => messages.id, {
			onDelete: "cascade",
		}),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
	text: text("text").notNull(),
});

export const insertReplySchema = createInsertSchema(replies, {
	text: (schema) => schema.text.min(1),
});

export const selectReplySchema = createSelectSchema(replies);

/**
 * The employees of the store.
 */
export const employees = mysqlTable("employees", {
	id: serial("id").primaryKey(),
	fullName: varchar("full_name", { length: 256 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 256 }).notNull(),
	role: mysqlEnum("role", ["WORKER", "ADMINISTRATIVE"]).notNull(),
	laborDescription: varchar("labor_description", { length: 256 }).notNull(),
	hourlyRate: decimal("hourly_rate", {
		precision: 10,
		scale: 1,
	}).notNull(),
	address: varchar("address", { length: 256 }),
});

export const insertEmployeeSchema = createInsertSchema(employees, {
	fullName: (schema) => schema.fullName.min(1),
	phoneNumber: (schema) => schema.phoneNumber.min(1),
	laborDescription: (schema) => schema.laborDescription.min(1),
	hourlyRate: (schema) =>
		schema.hourlyRate.refine((value) => {
			const parsedValue = Number(value);

			if (value.length === 0 || isNaN(parsedValue)) return false;

			if (parsedValue < 0) return false;

			return validateNumberPrecision({
				value: parsedValue,
				maxPrecision: 1,
			});
		}),
});

export const selectEmployeeSchema = createSelectSchema(employees);

/**
 * The equipments that can be used to make a furniture.
 */
export const equipments = mysqlTable("equipments", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 256 }).notNull(),
	hourlyRate: decimal("hourly_rate", {
		precision: 10,
		scale: 1,
	}),
});

export const insertEquipmentSchema = createInsertSchema(equipments, {
	name: (schema) => schema.name.min(1),
	hourlyRate: (schema) =>
		schema.hourlyRate.refine((value) => {
			const parsedValue = Number(value);

			if (value.length === 0 || isNaN(parsedValue)) return false;

			if (parsedValue < 0) return false;

			return validateNumberPrecision({
				value: parsedValue,
				maxPrecision: 1,
			});
		}),
});

export const selectEquipmentSchema = createSelectSchema(equipments);

/**
 * The products or furnitures.
 */
export const products = mysqlTable("products", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 256 }).notNull(),
	description: varchar("description", { length: 256 }),
	salesPrice: decimal("sales_price", {
		precision: 10,
		scale: 2,
	})
		.notNull()
		.default("0"),
	productionCost: decimal("production_cost", {
		precision: 10,
		scale: 2,
	})
		.notNull()
		.default("0"),
	stock: int("stock", { unsigned: true }).notNull().default(0),
});

export const insertProductSchema = createInsertSchema(products, {
	name: (schema) => schema.name.min(1),
	description: (schema) => schema.description.nullable(),
	salesPrice: (schema) =>
		schema.salesPrice.refine((value) => {
			const parsedValue = Number(value);

			if (value.length === 0 || isNaN(parsedValue)) return false;

			if (parsedValue < 0) return false;

			return validateNumberPrecision({
				value: parsedValue,
				maxPrecision: 2,
			});
		}),
	productionCost: (schema) =>
		schema.productionCost.refine((value) => {
			const parsedValue = Number(value);

			if (value.length === 0 || isNaN(parsedValue)) return false;

			if (parsedValue < 0) return false;

			return validateNumberPrecision({
				value: parsedValue,
				maxPrecision: 2,
			});
		}),
	stock: (schema) => schema.stock.nonnegative(),
});

export const selectProductSchema = createSelectSchema(products);

/**
 * The resources that can be used to make a furniture.
 */
export const resources = mysqlTable("resources", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 256 }).notNull(),
	type: mysqlEnum("type", ["INPUT", "RAW_MATERIAL"]).notNull(),
	unitPrice: decimal("unit_price", {
		precision: 10,
		scale: 2,
	})
		.notNull()
		.default("0"),
});

export const insertResourceSchema = createInsertSchema(resources, {
	name: (schema) => schema.name.min(1),
	unitPrice: (schema) =>
		schema.unitPrice.refine((value) => {
			const parsedValue = Number(value);

			if (value.length === 0 || isNaN(parsedValue)) return false;

			if (parsedValue < 0) return false;

			return validateNumberPrecision({
				value: parsedValue,
				maxPrecision: 2,
			});
		}),
});

export const selectResourceSchema = createSelectSchema(resources);

/**
 * The equipments used making a product.
 */
export const productsEquipments = mysqlTable("products_equipments", {
	productId: bigint("product_id", { mode: "number", unsigned: true })
		.references(() => products.id, {
			onDelete: "cascade",
		})
		.notNull(),
	equipmentId: bigint("equipment_id", { mode: "number", unsigned: true })
		.references(() => equipments.id, {
			onDelete: "restrict",
		})
		.notNull(),
	hours: int("hours", { unsigned: true }).notNull().default(0),
});

export const insertProductEquipmentSchema = createInsertSchema(
	productsEquipments,
	{
		productId: (schema) => schema.productId.nonnegative(),
		equipmentId: (schema) => schema.equipmentId.nonnegative(),
		hours: (schema) => schema.hours.nonnegative(),
	},
);

export const selectProductEquipmentSchema =
	createSelectSchema(productsEquipments);

/**
 * The labors done to make a product.
 */
export const productsEmployees = mysqlTable("products_employees", {
	productId: bigint("product_id", { mode: "number", unsigned: true })
		.references(() => products.id, {
			onDelete: "cascade",
		})
		.notNull(),
	employeeId: bigint("employee_id", { mode: "number", unsigned: true })
		.references(() => employees.id, {
			onDelete: "restrict",
		})
		.notNull(),
	hours: int("hours", { unsigned: true }).notNull().default(0),
});

export const insertProductLaborSchema = createInsertSchema(productsEmployees, {
	productId: (schema) => schema.productId.nonnegative(),
	employeeId: (schema) => schema.employeeId.nonnegative(),
	hours: (schema) => schema.hours.nonnegative(),
});

export const selectProductLaborSchema = createSelectSchema(productsEmployees);

/**
 * The resources used to make a product.
 */
export const productsResources = mysqlTable("products_resources", {
	productId: bigint("product_id", { mode: "number", unsigned: true })
		.references(() => products.id, {
			onDelete: "cascade",
		})
		.notNull(),
	resourceId: bigint("resource_id", { mode: "number", unsigned: true })
		.references(() => resources.id, {
			onDelete: "restrict",
		})
		.notNull(),
	quantity: int("hours", { unsigned: true }).notNull().default(0),
});

export const insertProductResourceSchema = createInsertSchema(
	productsResources,
	{
		productId: (schema) => schema.productId.nonnegative(),
		resourceId: (schema) => schema.resourceId.nonnegative(),
		quantity: (schema) => schema.quantity.nonnegative(),
	},
);

export const selectProductResourceSchema =
	createSelectSchema(productsResources);
