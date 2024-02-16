import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { envSchema } from "../shared/schema";
import * as schema from "./schema";

const env = envSchema.parse(process.env);

export const connection = await mysql.createConnection({
	host: env.DB_HOST,
	user: env.DB_USERNAME,
	database: env.DB_DATABASE,
	password: env.DB_PASSWORD,
});

export const db = drizzle(connection, { schema, mode: "default" });
