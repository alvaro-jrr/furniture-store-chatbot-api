import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";
import { logger } from "hono/logger";

import clients from "./controllers/clients";
import employees from "./controllers/employees";
import equipments from "./controllers/equipments";
import products from "./controllers/products";
import resources from "./controllers/resources";
import users from "./controllers/users";
import { getEnv, response } from "./shared/utils";

const app = new Hono({
	strict: false,
});

// Middlewares.
app.use(logger());
app.use("*", cors());

app.on(
	["GET", "POST", "PUT", "PATCH", "DELETE"],
	[
		"/employees/*",
		"/equipments/*",
		"/products/*",
		"/resources/*",
		"/clients/*",
	],
	jwt({ secret: getEnv().JWT_SECRET }),
);

// Routes.
app.get("/", (c) => c.text("Welcome"));

app.route("/users", users);
app.route("/employees", employees);
app.route("/equipments", equipments);
app.route("/products", products);
app.route("/resources", resources);
app.route("/clients", clients);

app.onError((err, c) => {
	return response(c, {
		status: err instanceof HTTPException ? err.status : 400,
		message: err.message,
	});
});

// Serve.
const port = 3000;
console.log(`Server is running on port ${port}`);
showRoutes(app);

serve({
	fetch: app.fetch,
	port,
});
