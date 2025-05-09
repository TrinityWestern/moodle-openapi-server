#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { MoodleServer } from "./moodle";
import { moodleSchema } from "./schema";
import packageJson from "../package.json" assert { type: "json" };
import dotenvx from "@dotenvx/dotenvx";

dotenvx.config();

const baseURL = process.env.MOODLE_BASE_URL;
const wstoken = process.env.MOODLE_WSTOKEN;
if (!baseURL) throw new Error("MOODLE_BASE_URL is not set");
if (!wstoken) throw new Error("MOODLE_WSTOKEN is not set");

// force version to be number.number.number
if (!packageJson.version.match(/^\d+\.\d+\.\d+$/)) {
  throw new Error("Invalid version format");
}

const server = new FastMCP({
  name: "Moodle MCP Server",
  version: packageJson.version as `${number}.${number}.${number}`,
  instructions:
    "This server provides access to Moodle's Web Services API for managing courses, assignments, quizzes, and student submissions.",
});

const moodleServer = new MoodleServer(baseURL, wstoken);

const toMcpResponse = (data: object) => {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
};

server.addTool({
  name: "get_students",
  description: "Gets the list of students enrolled in the given course",
  parameters: moodleSchema.core_enrol_get_enrolled_users.query,
  execute: async (args, { log }) => {
    return moodleServer.getStudents(args).then(toMcpResponse);
  },
});
server.addTool({
  name: "get_assignments",
  description: "Gets the list of assignments assigned in the given course",
  parameters: moodleSchema.mod_assign_get_assignments.query,
  execute: async (args) => {
    return {
      content: [
        {
          type: "text" as const,
          text: "Assignments fetched",
        },
      ],
    };
  },
});

server.addTool({
  name: "get_quizzes",
  description: "Gets the list of quizzes in the given course",
  parameters: moodleSchema.mod_quiz_get_quizzes_by_courses.query,
  execute: async (args) => {
    return {
      content: [
        {
          type: "text" as const,
          text: "Quizzes fetched",
        },
      ],
    };
  },
});
server.addTool({
  name: "get_submissions",
  description: "Gets the submissions of assignments in the configured course",
  parameters: moodleSchema.mod_assign_get_submissions.query,
  execute: async (args) => {
    return {
      content: [
        {
          type: "text" as const,
          text: "Submissions fetched",
        },
      ],
    };
  },
});

server.addTool({
  name: "provide_feedback",
  description: "Provides feedback on an assignment submitted by a student",
  parameters: moodleSchema.mod_assign_save_grade.query,
  execute: async (args) => {
    return {
      content: [
        {
          type: "text" as const,
          text: "Feedback provided",
        },
      ],
    };
  },
});

server.addTool({
  name: "get_submission_content",
  description:
    "Gets the detailed content of a specific submission, including text and attachments",
  parameters: moodleSchema.mod_assign_get_submission_status.query,
  execute: async (args) => {
    return {
      content: [
        {
          type: "text" as const,
          text: "Submission content fetched",
        },
      ],
    };
  },
});
server.addTool({
  name: "get_quiz_grade",
  description: "Gets the grade of a student in a specific quiz",
  parameters: moodleSchema.mod_quiz_get_user_best_grade.query,
  execute: async (args) => {
    return {
      content: [
        {
          type: "text" as const,
          text: "Quiz grade fetched",
        },
      ],
    };
  },
  // execute: async (args) => moodleServer.getQuizGrade(args).then(toMcpResponse),
});

// server.on("connect", (event) => {
//   console.log("Client connected:", event.session);
// });

// server.on("disconnect", (event) => {
//   console.log("Client disconnected:", event.session);
// });

server.start({
  transportType: "sse",
  sse: {
    endpoint: "/sse",
    port: 6277,
  },
});

// server.start({
//   transportType: "stdio",
// });
