import { Hono, type Context, type Next } from "hono";

import { logger } from "hono/logger";
import { cors } from "hono/cors";

import {
	MoodleServer,
	moodleWebservices,
	swagger2,
	openapi31,
	usecaseOpenapi,
} from "@toptiertools/moodle-client";
import { HTTPException } from "hono/http-exception";
import { basicAuth } from "hono/basic-auth";
import { parseUsers } from "./parse-users";
import { html } from "hono/html";
import { getDomainUrl } from "./get-domain-url";

type Variables = {
	moodleServer: MoodleServer;
	domainUrl: string;
};

const baseURL = process.env.MOODLE_BASE_URL;
if (!baseURL) {
	throw new Error("MOODLE_BASE_URL is not set");
}

// Example: USERS=user1:password1,user2:password2
if (!process.env.USERS) {
	throw new Error("USERS environment variable is not set");
}
const users = parseUsers(process.env.USERS);

console.log({
	baseURL,
	users,
});

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

	// we are not checking the token is valid, we are just using it to get the user id
	// we just direct the user to the moodle server

	const moodleServer = new MoodleServer(baseURL, wstoken);
	c.set("moodleServer", moodleServer);
	await next();
};

const app = new Hono<{ Variables: Variables }>();

app.use(cors());
app.use(logger());

app.use(async (c, next) => {
	const domainUrl = getDomainUrl(c.req.raw, {
		defaultHost: "localhost:3000",
	});
	c.set("domainUrl", domainUrl);
	await next();
});

// Apply middleware to all /api routes
app.use("/api/*", moodleAuth);

app.post("/api/usecases/:function", async (c) => {
	const functionName = c.req.param(
		"function",
	) as keyof MoodleServer["usecases"];
	const moodleServer = c.get("moodleServer");
	// check if the functionName is a valid Moodle usecase
	if (!Object.keys(moodleServer.usecases).includes(functionName)) {
		return c.json(
			{ error: true, message: "Invalid Moodle usecase" },
			{ status: 400 },
		);
	}

	const body = await c.req.json();
	// Call the Moodle usecase with the provided parameters
	const result = await moodleServer.usecases[functionName](body);
	if (result.success) {
		return c.json(result, { status: 200 });
	}

	// Use a type assertion to avoid deep type instantiation issues
	throw new HTTPException(400, {
		message: "Invalid request",
		// @ts-ignore
		cause: result.error || "Unknown error",
	});
});

// Handle all API requests with a wildcard route
app
	.post("/api/:function", async (c) => {
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
	})
	.get(async (c) => {
		// please use post
		return c.json(
			{ error: true, message: "GET requests are not supported" },
			{ status: 405 },
		);
	});

app.use(
	"/docs/*",
	basicAuth(
		{
			username: users[0].username,
			password: users[0].password,
		},
		// exclude the first user from the list
		...users.slice(1),
	),
);

interface SiteData {
	title: string;
	children?: unknown;
}

const Layout = (props: SiteData) =>
	html`<!doctype html>
		<html lang="en">
			<head>
				<title>${props.title}</title>
			</head>
			<body>
				${props.children}
			</body>
		</html>`;

app.get("/docs", (c) => {
	const swaggerLinks = swagger2.map(
		(doc, i) =>
			html`<li><a href="/docs/swagger/${i}">${doc.info?.title || `Swagger Doc ${i + 1}`}</a></li>`,
	);

	const openapi31Docs = [openapi31, usecaseOpenapi].filter(Boolean);
	const openapi31Links = openapi31Docs.map(
		(doc, i) =>
			html`<li><a href="/docs/openapi_3_1/${i}">${doc.info?.title || `OpenAPI 3.1 Doc ${i + 1}`}</a></li>`,
	);

	return c.html(
		Layout({
			title: "API Docs Links",
			children: html`
				<h1>API Docs</h1>
				<h2>Swagger 2.0 Docs</h2>
				<ol>${swaggerLinks}</ol>
				<h2>OpenAPI 3.1 Docs</h2>
				<ol>${openapi31Links}</ol>
			`,
		}),
	);
});

app.get("/meta", async (c) => {
	const packageJson = await import("../package.json");
	return c.json(
		{
			version: packageJson.version,
		},
		{ status: 200 },
	);
});

// swagger 2.0 docs
app.get("/docs/swagger/:id", (c) => {
	const id = c.req.param("id");
	const domainUrl = c.get("domainUrl");
	const swaggerDocs = swagger2.filter(Boolean);
	const doc = swaggerDocs[Number(id)];
	if (!doc) {
		return c.json({ error: true, message: "Invalid id" }, { status: 400 });
	}
	// we need to update the basePath in the swagger doc
	// remove the protocol and the domain from the domainUrl
	const host = new URL(domainUrl).host;
	doc.host = host;

	return c.json(doc, { status: 200 });
});

app.get("/docs/openapi_3_1/:id{.+\\.json}", (c) => {
	const id = c.req.param("id");
	const domainUrl = c.get("domainUrl");
	// remove the .json from the id
	const idWithoutJson = id.replace(".json", "");
	const openapi31Docs = [openapi31, usecaseOpenapi].filter(Boolean);
	const doc = openapi31Docs[Number(idWithoutJson)];
	if (!doc) {
		return c.json({ error: true, message: "Invalid id" }, { status: 400 });
	}

	// we need to update the servers in the openapi doc
	doc.servers = [
		{
			url: `${domainUrl}/api`,
			description: "Moodle webservice API",
		},
	];
	return c.json(doc, { status: 200 });
});

app.get("/docs/openapi_3_1/:id", (c) => {
	const id = c.req.param("id");
	const openapi31Docs = [openapi31, usecaseOpenapi].filter(Boolean);
	const doc = openapi31Docs[Number(id)];
	if (!doc) {
		return c.json({ error: true, message: "Invalid id" }, { status: 400 });
	}
	return c.html(
		Layout({
			title: doc.info?.title || "OpenAPI 3.1 Doc",
			children: html`
				<div id="app"></div>
				<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
				<script>
					Scalar.createApiReference('#app', {
						url: '/docs/openapi_3_1/${id}.json',
						authentication: {
							securitySchemes: {
								bearerAuth: {
									token: 'default-token',
								},
							},
						},
					});
				</script>
			`,
		}),
	);
});

app.get("/logout", (c) => {
	// clear the cookie
	c.res.headers.set("Set-Cookie", "token=; Max-Age=0; Path=/;");
	// return a 401 response
	return c.text("Unauthorized", 401, {
		"WWW-Authenticate": 'Basic realm="Secure Area"',
	});
});

// @ts-ignore
app.onError((err, c) => {
	// if error is 401, return a 401 response
	if (err instanceof HTTPException && err.status === 401) {
		return c.text("Unauthorized", 401, {
			"WWW-Authenticate": 'Basic realm="Secure Area"',
		});
	}
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
