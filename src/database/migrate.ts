import bcrypt from "bcryptjs";
import "dotenv/config";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { z } from "zod";

import employeesJson from "./data/employees.json";
import productsJson from "./data/products.json";
import { connection, db } from "./database";
import {
	employees,
	insertEmployeeSchema,
	insertProductSchema,
	products,
	users,
} from "./schema";

// This will run migrations on the database, skipping the ones already applied.
await migrate(db, { migrationsFolder: "./drizzle" });

await db.insert(users).values({
	email: "admin@luxegpt.com",
	password: await bcrypt.hash("12345678", 10),
	fullName: "Administrador",
	role: "ADMIN",
});

// Employees.
await db
	.insert(employees)
	.values(z.array(insertEmployeeSchema).parse(employeesJson));

// Products.
await db
	.insert(products)
	.values(z.array(insertProductSchema).parse(productsJson));

await connection.end();
