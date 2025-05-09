#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { MoodleServer } from "./moodle";
import { moodleSchema } from "./schema";

const server = new FastMCP({
  name: "Moodle MCP Server",
  version: "0.1.0",
  instructions:
    "This server provides access to Moodle's Web Services API for managing courses, assignments, quizzes, and student submissions.",
});

const moodleServer = new MoodleServer(
  "https://localhost:8443/webservice/rest/server.php",
  "9a5d4e484222f954001075602ec7819f"
);

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
  execute: async (args) => {
    const students = await moodleServer.getStudents(args);
    return toMcpResponse(students);
  },
});

server.addTool({
  name: "get_assignments",
  description: "Gets the list of assignments assigned in the given course",
  parameters: moodleSchema.mod_assign_get_assignments.query,
  execute: async (args) =>
    moodleServer.getAssignments(args).then(toMcpResponse),
});

server.addTool({
  name: "get_quizzes",
  description: "Gets the list of quizzes in the given course",
  parameters: moodleSchema.mod_quiz_get_quizzes_by_courses.query,
  execute: async (args) => moodleServer.getQuizzes(args).then(toMcpResponse),
});

server.addTool({
  name: "get_submissions",
  description: "Gets the submissions of assignments in the configured course",
  parameters: moodleSchema.mod_assign_get_submissions.query,
  execute: async (args) =>
    moodleServer.getSubmissions(args).then(toMcpResponse),
});

server.addTool({
  name: "provide_feedback",
  description: "Provides feedback on an assignment submitted by a student",
  parameters: moodleSchema.mod_assign_save_grade.query,
  execute: async (args) =>
    moodleServer.provideFeedback(args).then(toMcpResponse),
});

server.addTool({
  name: "get_submission_content",
  description:
    "Gets the detailed content of a specific submission, including text and attachments",
  parameters: moodleSchema.mod_assign_get_submission_status.query,
  execute: async (args) =>
    moodleServer.getSubmissionContent(args).then(toMcpResponse),
});

server.addTool({
  name: "get_quiz_grade",
  description: "Gets the grade of a student in a specific quiz",
  parameters: moodleSchema.mod_quiz_get_user_best_grade.query,
  execute: async (args) => moodleServer.getQuizGrade(args).then(toMcpResponse),
});

// server.on("connect", (event) => {
//   console.log("Client connected:", event.session);
// });

// server.on("disconnect", (event) => {
//   console.log("Client disconnected:", event.session);
// });

// server.start({
//   transportType: "httpStream",
//   httpStream: {
//     endpoint: "/mcp",
//     port: 6277,
//   },
// });

server.start({
  transportType: "stdio",
});
