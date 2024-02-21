import { db } from "~/database/database";

import type { AddableDocument, DocumentAnswer } from "../train";

export type EmployeesIntent =
	| "employees.count"
	| "employees.list"
	| "employees.worker.count"
	| "employees.admin.count";

export const employeesDocuments = [
	{
		input: "¿Cuantos empleados hay contratados?",
		intent: "employees.count",
	},
	{
		input: "¿Cuantos empleados hay?",
		intent: "employees.count",
	},
	{
		input: "¿Cuales son los empleados?",
		intent: "employees.list",
	},
	{
		input: "¿Cuantos obreros hay?",
		intent: "employees.worker.count",
	},
	{
		input: "¿Cuantos administrativos hay?",
		intent: "employees.admin.count",
	},
] satisfies Array<AddableDocument<EmployeesIntent>>;

export const employeesAnswers = [
	{
		answer: await (async () => {
			const employeesCount = (
				await db.query.employees.findMany({ columns: { id: true } })
			).length;

			return `Hay ${employeesCount} ${employeesCount === 1 ? "empleado" : "empleados"}`;
		})(),
		intent: "employees.count",
	},
	{
		answer: await (async () => {
			const employees = await db.query.employees.findMany({
				columns: { fullName: true, phoneNumber: true },
			});

			let answer = "";
			employees.forEach(
				(employee) =>
					(answer += `- ${employee.fullName} (${employee.phoneNumber})\n`),
			);
			return answer.trim();
		})(),
		intent: "employees.list",
	},
	{
		answer: await (async () => {
			const employeesCount = (
				await db.query.employees.findMany({
					columns: { id: true },
					where: (employees, { eq }) => eq(employees.role, "WORKER"),
				})
			).length;

			return `Hay ${employeesCount} ${employeesCount === 1 ? "obrero" : "obreros"}`;
		})(),
		intent: "employees.worker.count",
	},
	{
		answer: await (async () => {
			const employeesCount = (
				await db.query.employees.findMany({
					columns: { id: true },
					where: (employees, { eq }) =>
						eq(employees.role, "ADMINISTRATIVE"),
				})
			).length;

			return `Hay ${employeesCount} ${employeesCount === 1 ? "administrativo" : "administrativos"}`;
		})(),
		intent: "employees.admin.count",
	},
] satisfies Array<DocumentAnswer<EmployeesIntent>>;
