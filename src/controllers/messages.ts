import { Hono } from "hono";
import { validator } from "hono/validator";

import { db } from "~/database/database";
import { insertMessageSchema, messages } from "~/database/schema";
import { getJwt, response } from "~/shared/utils";
import { getNlp } from "~/training/train";

const app = new Hono();

/**
 * Creates the message.
 */
app.post(
	"/",
	validator("json", (json, c) => {
		const parsedMessage = insertMessageSchema
			.pick({ text: true })
			.safeParse(json);

		if (!parsedMessage.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsedMessage.data;
	}),
	async (c) => {
		const userId = (await getJwt(c))?.userId;
		const message = c.req.valid("json");

		if (userId === undefined) {
			return response(c, {
				status: 401,
				message: "User not found",
			});
		}

		// Store question.
		const [{ insertId: questionId }] = await db.insert(messages).values({
			userId,
			text: c.req.valid("json").text,
			type: "USER",
		});

		const nlp = await getNlp();
		const answer = await nlp.process("es", message.text);

		console.log(answer);

		// Store answer.
		const [{ insertId: answerId }] = await db.insert(messages).values({
			userId,
			text: answer.answer ?? "",
			type: "AI",
		});

		return response(c, {
			status: 200,
			data: {
				question: await db.query.messages.findFirst({
					where: (messages, { eq }) => eq(messages.id, questionId),
				}),
				answer: await db.query.messages.findFirst({
					where: (messages, { eq }) => eq(messages.id, answerId),
				}),
			},
		});
	},
);

/**
 * Get all the messages.
 */
app.get("/", async (c) => {
	const userId = (await getJwt(c))?.userId;

	if (userId === undefined) {
		return response(c, {
			status: 401,
			message: "User not found",
		});
	}

	return response(c, {
		status: 200,
		data: await db.query.messages.findMany({
			where: (messages, { eq }) => eq(messages.userId, userId),
		}),
	});
});

export default app;
