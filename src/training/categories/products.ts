import { db } from "~/database/database";

import type { AddableDocument, DocumentAnswer } from "../train";

export type ProductsIntent =
	| "products.count"
	| "products.in_stock"
	| "products.out_stock"
	| "products.in_stock_list"
	| "products.out_stock_list";

export const productsDocuments = [
	{
		input: "¿Cuantos productos hay?",
		intent: "products.count",
	},
	{
		input: "¿Cuales productos hay disponibles?",
		intent: "products.in_stock_list",
	},
	{
		input: "¿Cuales productos no estan disponibles?",
		intent: "products.out_stock_list",
	},
	{
		input: "¿Cuantos productos hay disponibles?",
		intent: "products.in_stock",
	},
	{
		input: "¿Cuantos productos hay en stock?",
		intent: "products.in_stock",
	},
	{
		input: "¿Cuantos productos no hay disponibles?",
		intent: "products.out_stock",
	},
	{
		input: "¿Cuantos productos no hay en stock?",
		intent: "products.out_stock",
	},
] satisfies Array<AddableDocument<ProductsIntent>>;

export const productsAnswers = [
	{
		answer: await (async () => {
			const productsCount = (
				await db.query.products.findMany({ columns: { id: true } })
			).length;

			return `Hay ${productsCount} ${productsCount === 1 ? "producto" : "productos"}`;
		})(),
		intent: "products.count",
	},
	{
		answer: await (async () => {
			const products = await db.query.products.findMany({
				columns: { name: true },
				where: (products, { gt }) => gt(products.stock, 0),
			});

			let answer = "";
			products.forEach((product) => (answer += `- ${product.name}\n`));
			return answer.trim();
		})(),
		intent: "products.in_stock_list",
	},
	{
		answer: await (async () => {
			const products = await db.query.products.findMany({
				columns: { name: true },
				where: (products, { eq }) => eq(products.stock, 0),
			});

			let answer = "";
			products.forEach((product) => (answer += `- ${product.name}\n`));
			return answer.trim();
		})(),
		intent: "products.out_stock_list",
	},
	{
		answer: await (async () => {
			const productsCount = (
				await db.query.products.findMany({
					columns: { id: true },
					where: (products, { gt }) => gt(products.stock, 0),
				})
			).length;

			return `Hay ${productsCount} ${productsCount === 1 ? "producto disponible" : "productos disponibles"} `;
		})(),
		intent: "products.in_stock",
	},
	{
		answer: await (async () => {
			const productsCount = (
				await db.query.products.findMany({
					columns: { id: true },
					where: (products, { eq }) => eq(products.stock, 0),
				})
			).length;

			return `Hay ${productsCount} ${productsCount === 1 ? "producto sin stock" : "productos sin stock"} `;
		})(),
		intent: "products.out_stock",
	},
] satisfies Array<DocumentAnswer<ProductsIntent>>;
