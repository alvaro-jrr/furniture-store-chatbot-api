import type { Config } from "drizzle-kit";

import { getEnv } from "./src/shared/utils";

const env = getEnv();

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
