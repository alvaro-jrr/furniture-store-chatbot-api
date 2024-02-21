import { db } from "~/database/database";

import type { AddableDocument, DocumentAnswer } from "../train";

export type ClientsIntent = "clients.count" | "clients.list";

export const clientsDocuments = [
	{
		input: "¿Cuantos clientes hay registrados?",
		intent: "clients.count",
	},
	{
		input: "¿Cuales clientes hay registrados?",
		intent: "clients.list",
	},
] satisfies Array<AddableDocument<ClientsIntent>>;

export const clientsAnswers = [
	{
		answer: await (async () => {
			const clientsCount = (
				await db.query.clients.findMany({ columns: { id: true } })
			).length;

			return `Hay ${clientsCount} ${clientsCount === 1 ? "cliente" : "clientes"}`;
		})(),
		intent: "clients.count",
	},
	{
		answer: await (async () => {
			const clients = await db.query.clients.findMany({
				columns: { fullName: true, email: true },
			});

			let answer = "";
			clients.forEach(
				(client) =>
					(answer += `- ${client.fullName} (${client.email})\n`),
			);
			return answer.trim();
		})(),
		intent: "clients.list",
	},
] satisfies Array<DocumentAnswer<ClientsIntent>>;
