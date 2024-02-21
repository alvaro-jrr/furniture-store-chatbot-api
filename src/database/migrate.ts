import "dotenv/config";
import { migrate } from "drizzle-orm/mysql2/migrator";

import { connection, db } from "./database";

// This will run migrations on the database, skipping the ones already applied.
await migrate(db, { migrationsFolder: "./drizzle" });

await connection.end();
