declare module "node-nlp" {
	export function dockStart(params: { use: string[] }): Dock;

	export interface Dock {
		/**
		 * Returns the manager by key.
		 *
		 * @param key - The manager key.
		 *
		 * @returns The manager for the `key` requested.
		 */
		get: (key: string) => NlpManager;
	}

	export class NlpManager {
		constructor(params: { languages: string[]; forceNER: boolean });

		/**
		 * Adds a language for the manager.
		 *
		 * @param lang - The language of the manager.
		 */
		addLanguage: (lang: string) => void;

		/**
		 * Adds a document to train the manager.
		 *
		 * @param lang - The language of the input.
		 * @param input - The input the manager that the manager is being trained to recognize.
		 * @param intent - The intent that the manager should associate with the input.
		 */
		addDocument: (lang: string, input: string, intent: string) => void;

		/**
		 * Adds an answer for the intent.
		 *
		 * @param lang - The language of the answer.
		 * @param intent - The intent to trigger the answer.
		 * @param answer - The answer for the intent.
		 */
		addAnswer: (lang: string, intent: string, answer: string) => void;

		/**
		 * Trains the manager based on the documents and answers set.
		 */
		train: () => Promise<void>;

		/**
		 * Saves the manager.
		 */
		save: () => void;

		/**
		 * Loads the manager, instead training it again.
		 *
		 * @param path - The path of the file to train the manager.
		 */
		load: (path: string) => void;

		/**
		 * Returns an answer for the input.
		 *
		 * @param lang - The `input` language.
		 * @param input - The input to process.
		 *
		 * @returns The answer for the `input`.
		 */
		process: (lang: string, input: string) => Promise<ProcessResponse>;
	}

	export interface ProcessResponse {
		utterance: string;
		locale: string;
		languageGuessed: boolean;
		localeIso2: string;
		language: string;
		domain: string;
		classifications: Array<{ label: string; value: number }>;
		intent: string;
		score: number;
		entities: Array<{
			start: number;
			end: number;
			len: number;
			accuracy: number;
			sourceText: string;
			utteranceText: string;
			entity: string;
			resolution: unknown[];
		}>;
		sentiment: {
			score: number;
			comparative: number;
			vote: string;
			numWords: number;
			numHits: number;
			type: string;
			language: string;
		};
		actions: unknown[];
		srcAnswer: string;
		answer: string;
	}
}
