import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { db } from "../database/database";
import { insertUserSchema, users } from "../database/schema";
import { response, setJwt } from "../shared/utils";

const app = new Hono();

/**
 * Signs up an user.
 */
app.post("/sign-up", async (c) => {
	let json;

	try {
		json = await c.req.json();
	} catch (e) {
		return response(c, {
			status: 400,
			message: "A JSON is required",
		});
	}

	const parsedUser = insertUserSchema.safeParse(json);

	if (!parsedUser.success) {
		return response(c, {
			status: 422,
			message: "The payload schema is invalid",
		});
	}

	const isEmailTaken =
		(await db.query.users.findFirst({
			columns: {
				id: true,
			},
			where: (users, { eq }) => eq(users.email, parsedUser.data.email),
		})) !== undefined;

	if (isEmailTaken) {
		return response(c, {
			status: 409,
			message: "Email is taken",
		});
	}

	const [{ insertId }] = await db.insert(users).values({
		...parsedUser.data,
		password: await bcrypt.hash(parsedUser.data.password, 10),
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
});

/**
 * Login the user.
 */
app.post("/login", async (c) => {
	let json;

	try {
		json = await c.req.json();
	} catch (e) {
		return response(c, {
			status: 400,
			message: "A JSON is required",
		});
	}

	const credentials = insertUserSchema
		.pick({ email: true, password: true })
		.safeParse(json);

	if (!credentials.success) {
		return response(c, {
			status: 422,
			message: "The payload schema is invalid",
		});
	}

	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, credentials.data.email),
	});

	const isCorrectPassword =
		user !== undefined &&
		(await bcrypt.compare(credentials.data.password, user.password));

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
});

export default app;
