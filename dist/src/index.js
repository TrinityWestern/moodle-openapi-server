import { FastMCP } from "fastmcp";
import { MoodleServer, moodleSchema, } from "@toptiertools/moodle-client";
import packageJson from "../package.json";
import { z } from "zod";
// import dotenvx from "@dotenvx/dotenvx";
// dotenvx.config();
// write process.argv to a file
// fs.writeFileSync("process.argv.txt", process.argv.join("\n"));
const baseURL = process.env.MOODLE_BASE_URL;
const wstoken = process.env.MOODLE_WSTOKEN;
if (!baseURL)
    throw new Error("MOODLE_BASE_URL is not set");
if (!wstoken)
    throw new Error("MOODLE_WSTOKEN is not set");
// force version to be number.number.number
if (!packageJson.version.match(/^\d+\.\d+\.\d+$/)) {
    throw new Error("Invalid version format");
}
const server = new FastMCP({
    name: "Moodle MCP Server",
    version: packageJson.version,
    instructions: "This server provides access to Moodle's Web Services API for managing courses, assignments, quizzes, and student submissions.",
    // ! authenticate does not work for most mcp client now
    // async authenticate(request) {
    //   // check the header to contain x-moodle-wstoken
    //   const wstoken = request.headers["x-moodle-wstoken"];
    //   if (!wstoken || typeof wstoken !== "string") {
    //     throw new Response("Unauthorized", { status: 401 });
    //   }
    //   return {
    //     wstoken,
    //   };
    // },
});
const moodleServer = new MoodleServer(baseURL, wstoken);
const toMcpResponse = (data) => {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
};
// only selective webservices is exposed to mcp
const exposedWebservices = [
    "core_enrol_get_enrolled_users",
];
// Add tools for each Moodle webservice
for (const wsfunction of exposedWebservices) {
    // remote the first two words from the wsfunction
    const toolName = wsfunction.split("_").slice(2).join(" ");
    // Get the schema for this webservice
    const schema = moodleSchema[wsfunction];
    // Add the tool
    server.addTool({
        name: toolName,
        description: `Moodle webservice: ${wsfunction}`,
        parameters: z.object({
            courseid: schema.query.shape.courseid,
        }),
        execute: async (args) => {
            return moodleServer.request[wsfunction](
            // @ts-ignore
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            args).then(toMcpResponse);
        },
    });
}
server.addTool({
    name: "Unenrol suspended users",
    description: "Unenrol suspended users from a course",
    parameters: z.object({
        courseid: z.number().describe("The course ID"),
    }),
    execute: async (args) => {
        return moodleServer.usecases
            .unenrolSuspendedUsers({ courseid: args.courseid })
            .then(toMcpResponse);
    },
});
server.start({
    transportType: "sse",
    sse: {
        endpoint: "/sse",
        port: 6277,
    },
});
