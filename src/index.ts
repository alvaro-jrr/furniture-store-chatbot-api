import type { StatusCode } from "hono/utils/http-status";

import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { jwt } from "hono/jwt";
import users from "./controllers/users";
import employees from "./controllers/employees";
import { getEnv, response } from "./shared/utils";

const app = new Hono();

// Middlewares.
app.use(logger());
app.use("/", jwt({ secret: getEnv().JWT_SECRET }));

// Routes.
app.get("/", (c) => c.text("Welcome"));

app.route("/users", users);
app.route("/employees", employees);

app.onError((err, c) => {
	return response(c, {
		status:
			"status" in err && typeof err.status === "number"
				? (err.status as StatusCode)
				: 400,
		message: err.message,
	});
});

// Serve.
const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
