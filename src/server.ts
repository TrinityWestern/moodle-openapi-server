import { Hono, type Context, type Next } from "hono";

import { MoodleServer, moodleWebservices } from "@toptiertools/moodle-client";
import dotenvx from "@dotenvx/dotenvx";
import { HTTPException } from "hono/http-exception";

dotenvx.config();

type Variables = {
	moodleServer: MoodleServer;
};

const baseURL = process.env.MOODLE_BASE_URL;
if (!baseURL) {
	throw new Error("MOODLE_BASE_URL is not set");
}

// Middleware to check for required headers and create MoodleServer instance
const moodleAuth = async (c: Context, next: Next) => {
	// get the wstoken from the Authorization header
	const authHeader = c.req.header("Authorization");
	if (!baseURL || typeof baseURL !== "string")
		return new Response("Unauthorized", { status: 401 });
	if (!authHeader || typeof authHeader !== "string")
		return new Response("Unauthorized", { status: 401 });

	// Extract token from Authorization header
	const wstoken = authHeader.startsWith("Bearer ")
		? authHeader.substring(7)
		: authHeader;

	const moodleServer = new MoodleServer(baseURL, wstoken);
	c.set("moodleServer", moodleServer);
	await next();
};

const app = new Hono<{ Variables: Variables }>();

// Apply middleware to all /api routes
app.use("/api/*", moodleAuth);

// Handle all API requests with a wildcard route
app.post("/api/:function", async (c) => {
	const functionName = c.req.param(
		"function",
	) as (typeof moodleWebservices)[number];
	const moodleServer = c.get("moodleServer");

	// check if the functionName is a valid Moodle webservice
	if (!moodleWebservices.includes(functionName)) {
		return c.json(
			{ error: true, message: "Invalid Moodle webservice" },
			{ status: 400 },
		);
	}

	// Get the request body
	const body = await c.req.json();

	// Call the Moodle function with the provided parameters
	const result = await moodleServer.request[functionName](body);

	if (result.success) {
		return c.json(result.data, { status: 200 });
	}

	// Use a type assertion to avoid deep type instantiation issues
	throw new HTTPException(400, {
		message: "Invalid request",
		cause: result.error,
	});
});

// @ts-ignore
app.onError((err, c) => {
	if (err instanceof HTTPException) {
		// @ts-ignore
		return new Response(JSON.stringify(err.cause), {
			status: err.status,
			headers: {
				"Content-Type":
					typeof err.cause === "string" ? "text/plain" : "application/json",
			},
		});
	}
});

export default app;
