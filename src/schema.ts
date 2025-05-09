import { z } from "@hono/zod-openapi";

// Base schemas
export const StudentSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
      description: "Student ID",
    }),
    username: z.string().openapi({
      example: "john.doe",
      description: "Student username",
    }),
    firstname: z.string().openapi({
      example: "John",
      description: "Student first name",
    }),
    lastname: z.string().openapi({
      example: "Doe",
      description: "Student last name",
    }),
    email: z.string().email().openapi({
      example: "john.doe@example.com",
      description: "Student email",
    }),
  })
  .openapi("Student");

export const AssignmentSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
      description: "Assignment ID",
    }),
    name: z.string().openapi({
      example: "Week 1 Quiz",
      description: "Assignment name",
    }),
    duedate: z.number().openapi({
      example: 1704067200,
      description: "Assignment due date (Unix timestamp)",
    }),
    allowsubmissionsfromdate: z.number().openapi({
      example: 1704067200,
      description: "Date from which submissions are allowed (Unix timestamp)",
    }),
    grade: z.number().openapi({
      example: 100,
      description: "Maximum grade for the assignment",
    }),
    timemodified: z.number().openapi({
      example: 1704067200,
      description: "Last modification time (Unix timestamp)",
    }),
    cutoffdate: z.number().openapi({
      example: 1704067200,
      description: "Cut-off date for submissions (Unix timestamp)",
    }),
  })
  .openapi("Assignment");

export const QuizSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
      description: "Quiz ID",
    }),
    name: z.string().openapi({
      example: "Final Exam",
      description: "Quiz name",
    }),
    timeopen: z.number().openapi({
      example: 1704067200,
      description: "Quiz opening time (Unix timestamp)",
    }),
    timeclose: z.number().openapi({
      example: 1704067200,
      description: "Quiz closing time (Unix timestamp)",
    }),
    grade: z.number().openapi({
      example: 100,
      description: "Maximum grade for the quiz",
    }),
    timemodified: z.number().openapi({
      example: 1704067200,
      description: "Last modification time (Unix timestamp)",
    }),
  })
  .openapi("Quiz");

export const SubmissionSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
      description: "Submission ID",
    }),
    userid: z.number().openapi({
      example: 1,
      description: "User ID of the submitter",
    }),
    status: z.string().openapi({
      example: "submitted",
      description: "Submission status",
    }),
    timemodified: z.number().openapi({
      example: 1704067200,
      description: "Last modification time (Unix timestamp)",
    }),
    gradingstatus: z.string().openapi({
      example: "graded",
      description: "Grading status",
    }),
    gradefordisplay: z.string().optional().openapi({
      example: "85/100",
      description: "Grade display string",
    }),
  })
  .openapi("Submission");

export const FileSchema = z
  .object({
    filename: z.string().openapi({
      example: "assignment.pdf",
      description: "File name",
    }),
    fileurl: z.string().openapi({
      example: "https://example.com/files/assignment.pdf",
      description: "File URL",
    }),
    filesize: z.number().openapi({
      example: 1024,
      description: "File size in bytes",
    }),
    filetype: z.string().openapi({
      example: "application/pdf",
      description: "File MIME type",
    }),
  })
  .openapi("File");

export const PluginSchema = z
  .object({
    type: z.string().openapi({
      example: "file",
      description: "Plugin type",
    }),
    content: z.string().optional().openapi({
      example: "Assignment content",
      description: "Plugin content",
    }),
    files: z.array(FileSchema).optional().openapi({
      description: "List of files",
    }),
  })
  .openapi("Plugin");

export const SubmissionContentSchema = z
  .object({
    assignment: z.number().openapi({
      example: 1,
      description: "Assignment ID",
    }),
    userid: z.number().openapi({
      example: 1,
      description: "User ID",
    }),
    status: z.string().openapi({
      example: "submitted",
      description: "Submission status",
    }),
    submissiontext: z.string().optional().openapi({
      example: "This is my submission",
      description: "Submission text content",
    }),
    plugins: z.array(PluginSchema).optional().openapi({
      description: "List of plugins",
    }),
    timemodified: z.number().openapi({
      example: 1704067200,
      description: "Last modification time (Unix timestamp)",
    }),
  })
  .openapi("SubmissionContent");

export const QuizGradeResponseSchema = z
  .object({
    hasgrade: z.boolean().openapi({
      example: true,
      description: "Whether the user has a grade on the given quiz",
    }),
    grade: z.string().optional().openapi({
      example: "85/100",
      description: "Grade display string",
    }),
  })
  .openapi("QuizGradeResponse");

// API Schema
export const moodleSchema = {
  core_enrol_get_enrolled_users: {
    query: z.object({
      courseid: z
        .string()
        .openapi({
          example: "2",
          description: "Course ID",
        })
        .describe("The course ID to get enrolled users for"),
      options: z
        .array(
          z.discriminatedUnion("name", [
            z.object({
              name: z.literal("withcapability"),
              value: z.string(),
            }),
            z.object({
              name: z.literal("withgroup"),
              value: z.number(),
            }),
            z.object({
              name: z.literal("onlyactive"),
              value: z.boolean(),
            }),
            z.object({
              name: z.literal("onlysuspended"),
              value: z.boolean(),
            }),
            z.object({
              name: z.literal("userfields"),
              value: z.array(z.string()),
            }),
            z.object({
              name: z.literal("limitfrom"),
              value: z.number(),
            }),
            z.object({
              name: z.literal("limitnumber"),
              value: z.number(),
            }),
            z.object({
              name: z.literal("sortby"),
              value: z.string(),
            }),
            z.object({
              name: z.literal("sortparams"),
              value: z.array(z.string()),
            }),
            z.object({
              name: z.literal("sortdirection"),
              value: z.string(),
            }),
          ])
        )
        .optional(),
    }),
    output: z.array(StudentSchema),
  },
  mod_assign_get_assignments: {
    query: z.object({
      courseids: z.array(z.string()).openapi({
        example: ["2"],
        description: "Array of course IDs",
      }),
    }),
    output: z.object({
      courses: z.array(
        z.object({
          assignments: z.array(AssignmentSchema),
        })
      ),
    }),
  },
  mod_quiz_get_quizzes_by_courses: {
    query: z.object({
      courseids: z.array(z.string()).openapi({
        example: ["2"],
        description: "Array of course IDs",
      }),
    }),
    output: z.object({
      quizzes: z.array(QuizSchema),
    }),
  },
  mod_assign_get_submissions: {
    query: z.object({
      assignmentids: z
        .array(z.number())
        .optional()
        .openapi({
          example: [1],
          description: "Array of assignment IDs",
        }),
      status: z.string().optional().openapi({
        example: "submitted",
        description: "Submission status filter",
      }),
      since: z.number().optional().openapi({
        example: 1704067200,
        description: "Filter submissions since this timestamp",
      }),
      before: z.number().optional().openapi({
        example: 1704067200,
        description: "Filter submissions before this timestamp",
      }),
    }),
    output: z.array(
      z.object({
        assignments: z.array(
          z.object({
            assignmentid: z.number(),
            submissions: z.array(SubmissionSchema),
          })
        ),
        warnings: z.array(
          z.object({
            item: z.string(),
            itemid: z.number(),
            warningcode: z.string(),
            message: z.string(),
          })
        ),
      })
    ),
  },
  mod_assign_get_grades: {
    query: z.object({
      assignmentids: z.array(z.number()).openapi({
        example: [1],
        description: "Array of assignment IDs",
      }),
    }),
    output: z.array(
      z.object({
        userid: z.number(),
        grade: z.number(),
      })
    ),
  },
  core_grades_get_grades: {
    query: z.object({
      courseid: z.string().openapi({
        example: "2",
        description: "Course ID",
      }),
      component: z.string().openapi({
        example: "mod_assign",
        description: "Component name",
      }),
      activityid: z.number().openapi({
        example: 1,
        description: "Activity ID",
      }),
    }),
    output: z.object({
      grades: z.array(
        z.object({
          userid: z.number(),
          grade: z.number(),
        })
      ),
    }),
  },
  mod_assign_save_grade: {
    query: z.object({
      assignmentid: z.number().openapi({
        example: 1,
        description: "Assignment ID",
      }),
      userid: z.number().openapi({
        example: 1,
        description: "User ID",
      }),
      grade: z.number().openapi({
        example: 85,
        description: "Grade value",
      }),
      feedback: z.string().openapi({
        example: "Good work!",
        description: "Feedback text",
      }),
    }),
    output: z.any(),
  },
  mod_assign_get_submission_status: {
    query: z.object({
      assignid: z.number().openapi({
        example: 1,
        description: "Assignment ID",
      }),
      userid: z.number().openapi({
        example: 1,
        description: "User ID",
      }),
    }),
    output: SubmissionContentSchema,
  },
  mod_quiz_get_user_best_grade: {
    query: z.object({
      quizid: z.number().openapi({
        example: 1,
        description: "Quiz ID",
      }),
      userid: z.number().openapi({
        example: 1,
        description: "User ID",
      }),
    }),
    output: QuizGradeResponseSchema,
  },
};
