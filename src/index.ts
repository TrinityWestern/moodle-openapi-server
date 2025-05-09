#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { z } from "zod";
import { MoodleMcpServer } from "./moodle";

const server = new FastMCP({
  name: "Moodle MCP Server",
  version: "0.1.0",
  instructions:
    "This server provides access to Moodle's Web Services API for managing courses, assignments, quizzes, and student submissions.",
});

const moodleServer = new MoodleMcpServer(
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
  parameters: z.object({
    courseid: z.string().describe("Course ID"),
  }),
  execute: async (args) => {
    const students = await moodleServer.getStudents(args);
    return toMcpResponse(students);
  },
});

server.addTool({
  name: "get_assignments",
  description: "Gets the list of assignments assigned in the given course",
  parameters: z.object({
    courseid: z.string().describe("Course ID"),
  }),
  execute: async (args) => {
    const assignments = await moodleServer.getAssignments(args);
    return toMcpResponse(assignments);
  },
});

server.addTool({
  name: "get_quizzes",
  description: "Gets the list of quizzes in the given course",
  parameters: z.object({
    courseid: z.string().describe("Course ID"),
  }),
  execute: async (args) => {
    const quizzes = await moodleServer.getQuizzes(args);
    return toMcpResponse(quizzes);
  },
});

server.addTool({
  name: "get_submissions",
  description: "Gets the submissions of assignments in the configured course",
  parameters: z.object({
    studentId: z
      .number()
      .optional()
      .describe(
        "Optional student ID. If not provided, submissions from all students will be returned"
      ),
    assignmentId: z
      .number()
      .optional()
      .describe(
        "Optional assignment ID. If not provided, all assignments submissions will be returned"
      ),
  }),
  execute: async (args) => {
    return toMcpResponse(await moodleServer.getSubmissions(args));
  },
});

server.addTool({
  name: "provide_feedback",
  description: "Provides feedback on an assignment submitted by a student",
  parameters: z.object({
    studentId: z.number().describe("Student ID"),
    assignmentId: z.number().describe("Assignment ID"),
    grade: z.number().describe("Numeric grade to assign"),
    feedback: z.string().describe("Feedback text to provide"),
  }),
  execute: async (args) => {
    return toMcpResponse(await moodleServer.provideFeedback(args));
  },
});

server.addTool({
  name: "get_submission_content",
  description:
    "Gets the detailed content of a specific submission, including text and attachments",
  parameters: z.object({
    studentId: z.number().describe("Student ID"),
    assignmentId: z.number().describe("Assignment ID"),
  }),
  execute: async (args) => {
    return toMcpResponse(await moodleServer.getSubmissionContent(args));
  },
});

server.addTool({
  name: "get_quiz_grade",
  description: "Gets the grade of a student in a specific quiz",
  parameters: z.object({
    studentId: z.number().describe("Student ID"),
    quizId: z.number().describe("Quiz ID"),
  }),
  execute: async (args) => {
    return toMcpResponse(await moodleServer.getQuizGrade(args));
  },
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
