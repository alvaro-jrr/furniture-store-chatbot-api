import "dotenv/config";
import type { Config } from "drizzle-kit";
import { envSchema } from "./src/shared/schema";

const env = envSchema.parse(process.env);

export default {
	schema: "./src/database/schema.ts",
	out: "./drizzle",
	driver: "mysql2",
	dbCredentials: {
		host: env.DB_HOST,
		database: env.DB_DATABASE,
		password: env.DB_PASSWORD,
		user: env.DB_USERNAME,
	},
} satisfies Config;
