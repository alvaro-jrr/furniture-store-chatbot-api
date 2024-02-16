import { z } from "zod";

export const envSchema = z.object({
	DB_HOST: z.string().min(1),
	DB_DATABASE: z.string().min(1),
	DB_USERNAME: z.string().min(1).optional(),
	DB_PASSWORD: z.string().min(1).optional(),
});
