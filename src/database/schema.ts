import { relations } from "drizzle-orm";
import {
	bigint,
	decimal,
	int,
	mysqlEnum,
	mysqlTable,
	serial,
	text,
	timestamp,
	unique,
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

/**
 * The user relations.
 */
export const usersRelations = relations(users, ({ one }) => ({
	room: one(rooms, {
		fields: [users.id],
		references: [rooms.userId],
	}),
}));

export const insertUserSchema = createInsertSchema(users, {
	fullName: (schema) => schema.fullName.min(1),
	email: (schema) => schema.email.email(),
	password: (schema) => schema.password.min(1),
});

export const selectUserSchema = createSelectSchema(users);

/**
 * The rooms where the messages are sent.
 */
export const rooms = mysqlTable("rooms", {
	id: serial("id").primaryKey(),
	userId: bigint("user_id", { unsigned: true, mode: "number" })
		.references(() => users.id, {
			onDelete: "cascade",
		})
		.notNull(),
});

/**
 * The rooms relations.
 */
export const roomsRelations = relations(rooms, ({ one, many }) => ({
	user: one(users, {
		fields: [rooms.userId],
		references: [users.id],
	}),
	messages: many(messages),
}));

/**
 * The messages sent by the user.
 */
export const messages = mysqlTable("messages", {
	id: serial("id").primaryKey(),
	roomId: bigint("room_id", { unsigned: true, mode: "number" })
		.references(() => rooms.id, {
			onDelete: "cascade",
		})
		.notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
	text: text("text").notNull(),
	type: mysqlEnum("type", ["USER", "AI"]).notNull(),
});

/**
 * The message relations.
 */
export const messageRelations = relations(messages, ({ one }) => ({
	room: one(rooms, {
		fields: [messages.roomId],
		references: [rooms.id],
	}),
}));

export const insertMessageSchema = createInsertSchema(messages, {
	text: (schema) => schema.text.min(1),
});

export const selectMessageSchema = createSelectSchema(messages);

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

/**
 * The employee relations.
 */
export const employeesRelations = relations(employees, ({ many }) => ({
	products: many(productsEmployees),
}));

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
	}).notNull(),
});

/**
 * The equipment relations.
 */
export const equipmentsRelations = relations(equipments, ({ many }) => ({
	products: many(productsEmployees),
}));

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

/**
 * The product relations.
 */
export const productsRelations = relations(products, ({ many }) => ({
	employees: many(productsEmployees),
	resources: many(productsResources),
	equipments: many(productsEquipments),
}));

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

/**
 * The resource relations.
 */
export const resourcesRelations = relations(resources, ({ many }) => ({
	products: many(productsResources),
}));

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
export const productsEquipments = mysqlTable(
	"products_equipments",
	{
		id: serial("id").primaryKey(),
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
		hours: int("hours", { unsigned: true }).notNull(),
	},
	(t) => ({
		unq: unique("product_equipment_unique").on(t.productId, t.equipmentId),
	}),
);

/**
 * The relation between product and equipment.
 */
export const productsEquipmentsRelations = relations(
	productsEquipments,
	({ one }) => ({
		product: one(products, {
			fields: [productsEquipments.productId],
			references: [products.id],
		}),
		equipment: one(equipments, {
			fields: [productsEquipments.equipmentId],
			references: [equipments.id],
		}),
	}),
);

export const insertProductEquipmentSchema = createInsertSchema(
	productsEquipments,
	{
		productId: (schema) => schema.productId.nonnegative(),
		equipmentId: (schema) => schema.equipmentId.nonnegative(),
		hours: (schema) => schema.hours.positive(),
	},
);

export const selectProductEquipmentSchema =
	createSelectSchema(productsEquipments);

/**
 * The employees that worked in a product.
 */
export const productsEmployees = mysqlTable(
	"products_employees",
	{
		id: serial("id").primaryKey(),
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
		hours: int("hours", { unsigned: true }).notNull(),
	},
	(t) => ({
		unq: unique("product_employee_unique").on(t.productId, t.employeeId),
	}),
);

/**
 * The relation between a product and an employee.
 */
export const productsEmployeesRelations = relations(
	productsEmployees,
	({ one }) => ({
		product: one(products, {
			fields: [productsEmployees.productId],
			references: [products.id],
		}),
		employee: one(employees, {
			fields: [productsEmployees.employeeId],
			references: [employees.id],
		}),
	}),
);

export const insertProductEmployeeSchema = createInsertSchema(
	productsEmployees,
	{
		productId: (schema) => schema.productId.nonnegative(),
		employeeId: (schema) => schema.employeeId.nonnegative(),
		hours: (schema) => schema.hours.positive(),
	},
);

export const selectProductEmployeeSchema =
	createSelectSchema(productsEmployees);

/**
 * The resources used to make a product.
 */
export const productsResources = mysqlTable(
	"products_resources",
	{
		id: serial("id").primaryKey(),
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
		quantity: int("hours", { unsigned: true }).notNull(),
	},
	(t) => ({
		unq: unique("product_resource_unique").on(t.productId, t.resourceId),
	}),
);

/**
 * The relation between a product and the resources.
 */
export const productsResourcesRelations = relations(
	productsResources,
	({ one }) => ({
		product: one(products, {
			fields: [productsResources.productId],
			references: [products.id],
		}),
		resource: one(resources, {
			fields: [productsResources.resourceId],
			references: [resources.id],
		}),
	}),
);

export const insertProductResourceSchema = createInsertSchema(
	productsResources,
	{
		productId: (schema) => schema.productId.nonnegative(),
		resourceId: (schema) => schema.resourceId.nonnegative(),
		quantity: (schema) => schema.quantity.positive(),
	},
);

export const selectProductResourceSchema =
	createSelectSchema(productsResources);
