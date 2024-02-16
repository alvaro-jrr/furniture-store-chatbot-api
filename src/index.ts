import { serve } from "@hono/node-server";
import { Hono } from "hono";
import users from "./controllers/users";
import { logger } from "hono/logger";

const app = new Hono();
app.use(logger());

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.route("/users", users);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
