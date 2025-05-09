import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { MoodleServer } from "./moodle";
import { moodleSchema } from "./schema";
import { Scalar } from "@scalar/hono-api-reference";
import packageJson from "../package.json" assert { type: "json" };
import dotenvx from "@dotenvx/dotenvx";

dotenvx.config();

type Variables = {
  moodleServer: MoodleServer;
};

const app = new OpenAPIHono<{ Variables: Variables }>();

const baseURL = process.env.MOODLE_BASE_URL;
const wstoken = process.env.MOODLE_WSTOKEN;
if (!baseURL) throw new Error("MOODLE_BASE_URL is not set");
if (!wstoken) throw new Error("MOODLE_WSTOKEN is not set");

// Middleware to check for required headers and create MoodleServer instance
const moodleAuth = async (c: any, next: any) => {
  const moodleServer = new MoodleServer(baseURL, wstoken);
  c.set("moodleServer", moodleServer);
  await next();
};

// Apply middleware to all /api routes
app.use("/api/*", moodleAuth);

// Define routes
const getStudentsRoute = createRoute({
  method: "post",
  path: "/api/core_enrol_get_enrolled_users",
  summary: "Get enrolled users",
  description: "Get enrolled users",
  request: {
    body: {
      content: {
        "application/json": {
          schema: moodleSchema.core_enrol_get_enrolled_users.query,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: moodleSchema.core_enrol_get_enrolled_users.output,
        },
      },
      description: "List of enrolled students",
    },
  },
});

const getAssignmentsRoute = createRoute({
  method: "post",
  path: "/api/mod_assign_get_assignments",
  summary: "Get assignments by courses",
  description: "Get assignments by courses",
  request: {
    body: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_get_assignments.query,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_get_assignments.output,
        },
      },
      description: "List of assignments",
    },
  },
});

const getQuizzesRoute = createRoute({
  method: "post",
  path: "/api/mod_quiz_get_quizzes_by_courses",
  summary: "Get quizzes by courses",
  description: "Get quizzes by courses",
  request: {
    body: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_quiz_get_quizzes_by_courses.query,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_quiz_get_quizzes_by_courses.output,
        },
      },
      description: "List of quizzes",
    },
  },
});

const getSubmissionsRoute = createRoute({
  method: "post",
  path: "/api/mod_assign_get_submissions",
  summary: "Get submissions for an assignment",
  description: "Get submissions for an assignment",
  request: {
    body: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_get_submissions.query,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_get_submissions.output,
        },
      },
      description: "List of submissions",
    },
  },
});

const getGradesRoute = createRoute({
  method: "post",
  path: "/api/mod_assign_get_grades",
  summary: "Get grades for an assignment",
  description: "Get grades for an assignment",
  request: {
    body: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_get_grades.query,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_get_grades.output,
        },
      },
      description: "List of grades",
    },
  },
});

const saveGradeRoute = createRoute({
  method: "post",
  path: "/api/mod_assign_save_grade",
  summary: "Save a grade for an assignment",
  description: "Save a grade for an assignment",
  request: {
    body: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_save_grade.query,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_save_grade.output,
        },
      },
      description: "Grade saved successfully",
    },
  },
});

const getSubmissionStatusRoute = createRoute({
  method: "post",
  tags: ["assignments"],
  path: "/api/mod_assign_get_submission_status",
  summary: "Get submission status",
  description: "Get submission status",
  request: {
    body: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_get_submission_status.query,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_assign_get_submission_status.output,
        },
      },
      description: "Submission status",
    },
  },
});

const getQuizGradeRoute = createRoute({
  method: "post",
  path: "/api/mod_quiz_get_user_best_grade",
  summary: "Get quiz grade",
  description: "Get quiz grade",
  request: {
    body: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_quiz_get_user_best_grade.query,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: moodleSchema.mod_quiz_get_user_best_grade.output,
        },
      },
      description: "Quiz grade",
    },
  },
});

// Register routes
app.openapi(getStudentsRoute, async (c) => {
  const moodleServer = c.get("moodleServer");
  const body = await c.req.json();
  const result = await moodleServer.getStudents(body);
  return c.json(result);
});

app.openapi(getAssignmentsRoute, async (c) => {
  const moodleServer = c.get("moodleServer");
  const body = await c.req.json();
  const result = await moodleServer.getAssignments(body);
  return c.json(result);
});

app.openapi(getQuizzesRoute, async (c) => {
  const moodleServer = c.get("moodleServer");
  const body = await c.req.json();
  const result = await moodleServer.getQuizzes(body);
  return c.json(result);
});

app.openapi(getSubmissionsRoute, async (c) => {
  const moodleServer = c.get("moodleServer");
  const body = await c.req.json();
  const result = await moodleServer.getSubmissions(body);
  return c.json(result);
});

app.openapi(getGradesRoute, async (c) => {
  const moodleServer = c.get("moodleServer");
  const body = await c.req.json();
  const result = await moodleServer.getGrades(body);
  return c.json(result);
});

app.openapi(saveGradeRoute, async (c) => {
  const moodleServer = c.get("moodleServer");
  const body = await c.req.json();
  const result = await moodleServer.provideFeedback(body);
  return c.json(result);
});

app.openapi(getSubmissionStatusRoute, async (c) => {
  const moodleServer = c.get("moodleServer");
  const body = await c.req.json();
  const result = await moodleServer.getSubmissionContent(body);
  return c.json(result);
});

app.openapi(getQuizGradeRoute, async (c) => {
  const moodleServer = c.get("moodleServer");
  const body = await c.req.json();
  const result = await moodleServer.getQuizGrade(body);
  return c.json(result);
});

// OpenAPI documentation
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Moodle MCP API",
    version: packageJson.version as `${number}.${number}.${number}`,
    description: "API for interacting with Moodle through MCP",
  },
});

app.get("/doc", Scalar({ url: "/openapi.json" }));

export default app;
