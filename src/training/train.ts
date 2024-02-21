import fs from "fs";
import { NlpManager } from "node-nlp";

import { clientsAnswers, clientsDocuments } from "./categories/clients";
import { employeesAnswers, employeesDocuments } from "./categories/employees";
import { productsAnswers, productsDocuments } from "./categories/products";

export interface AddableDocument<T> {
	input: string;
	intent: T;
}

export interface DocumentAnswer<T> {
	answer: string;
	intent: T;
}

/**
 * Trains the manager provided.
 *
 * @param manager - The manager to train.
 */
async function trainNlp(manager: NlpManager) {
	if (fs.existsSync("./model.nlp")) {
		manager.load("./model.nlp");
		return;
	}

	// Add documents.
	[employeesDocuments, productsDocuments, clientsDocuments].forEach(
		(documents) => {
			documents.forEach((document) => {
				manager.addDocument("es", document.input, document.intent);
			});
		},
	);

	await manager.train();

	// Add answers.
	[employeesAnswers, productsAnswers, clientsAnswers].forEach((answers) => {
		answers.forEach((answer) => {
			manager.addAnswer("es", answer.intent, answer.answer);
		});
	});

	manager.save();
}

export async function getNlp() {
	const nlp = new NlpManager({ languages: ["es"], forceNER: true });
	await trainNlp(nlp);
	return nlp;
}
