import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import { insertUserSchema, users } from "~/database/schema";
import { getJwt, response, setJwt } from "~/shared/utils";

const app = new Hono();

/**
 * Signs up an user.
 */
app.post(
	"/sign-up",
	validator("json", (json, c) => {
		const parsedUser = insertUserSchema
			.omit({ role: true })
			.safeParse(json);

		if (!parsedUser.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsedUser.data;
	}),
	async (c) => {
		const user = c.req.valid("json");

		const isEmailTaken =
			(await db.query.users.findFirst({
				columns: {
					id: true,
				},
				where: (users, { eq }) => eq(users.email, user.email),
			})) !== undefined;

		if (isEmailTaken) {
			return response(c, {
				status: 409,
				message: "Email is taken",
			});
		}

		const [{ insertId }] = await db.insert(users).values({
			...user,
			password: await bcrypt.hash(user.password, 10),
			role: "USER",
		});

		return response(c, {
			status: 200,
			data: await db.query.users.findFirst({
				columns: {
					id: true,
					fullName: true,
					email: true,
					role: true,
				},
				where: (users, { eq }) => eq(users.id, insertId),
			}),
		});
	},
);

/**
 * Login the user.
 */
app.post(
	"/login",
	validator("json", (json, c) => {
		const parsedUser = insertUserSchema
			.pick({ email: true, password: true })
			.safeParse(json);

		if (!parsedUser.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsedUser.data;
	}),
	async (c) => {
		const credentials = c.req.valid("json");

		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, credentials.email),
		});

		const isCorrectPassword =
			user !== undefined &&
			(await bcrypt.compare(credentials.password, user.password));

		if (!isCorrectPassword) {
			return response(c, {
				status: 401,
				message: "The credentials are invalid",
			});
		}

		// Set the JWT.
		const token = await setJwt(c, user.id);
		const { password, ...userWithoutPassword } = user;

		return response(c, {
			status: 200,
			data: {
				...userWithoutPassword,
				token,
			},
		});
	},
);

/**
 * Logs out the user.
 */
app.post("/logout", async (c) => {
	const jwt = await getJwt(c);

	if (jwt === undefined) {
		return response(c, {
			status: 404,
			message: "Token not found",
		});
	}

	c.set("jwtPayload", null);

	return response(c, {
		status: 200,
		message: "Logout successfully",
	});
});

/**
 * Get the logged user.
 */
app.get("/me", async (c) => {
	const userId = (await getJwt(c))?.userId;

	if (userId === undefined) {
		return response(c, {
			status: 404,
			message: "Token not found",
		});
	}

	return response(c, {
		status: 200,
		data: await db.query.users.findFirst({
			columns: {
				id: true,
				email: true,
				fullName: true,
				role: true,
			},
			where: (users, { eq }) => eq(users.id, userId),
		}),
	});
});

export default app;
