import { z } from "zod";
import { createSchema } from "@better-fetch/fetch";

// Base schemas
export const StudentSchema = z.object({
  id: z.number(),
  username: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
});

export const AssignmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  duedate: z.number(),
  allowsubmissionsfromdate: z.number(),
  grade: z.number(),
  timemodified: z.number(),
  cutoffdate: z.number(),
});

export const QuizSchema = z.object({
  id: z.number(),
  name: z.string(),
  timeopen: z.number(),
  timeclose: z.number(),
  grade: z.number(),
  timemodified: z.number(),
});

export const SubmissionSchema = z.object({
  id: z.number(),
  userid: z.number(),
  status: z.string(),
  timemodified: z.number(),
  gradingstatus: z.string(),
  gradefordisplay: z.string().optional(),
});

export const FileSchema = z.object({
  filename: z.string(),
  fileurl: z.string(),
  filesize: z.number(),
  filetype: z.string(),
});

export const PluginSchema = z.object({
  type: z.string(),
  content: z.string().optional(),
  files: z.array(FileSchema).optional(),
});

export const SubmissionContentSchema = z.object({
  assignment: z.number(),
  userid: z.number(),
  status: z.string(),
  submissiontext: z.string().optional(),
  plugins: z.array(PluginSchema).optional(),
  timemodified: z.number(),
});

export const QuizGradeResponseSchema = z.object({
  hasgrade: z.boolean(),
  grade: z.string().optional(),
});

// API Schema
export const moodleSchema = createSchema({
  core_enrol_get_enrolled_users: {
    query: z.object({
      courseid: z.string(),
    }),
    output: z.array(StudentSchema),
  },
  mod_assign_get_assignments: {
    query: z.object({
      courseids: z.array(z.string()),
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
      courseids: z.array(z.string()),
    }),
    output: z.object({
      quizzes: z.array(QuizSchema),
    }),
  },
  mod_assign_get_submissions: {
    query: z.object({
      assignmentids: z.array(z.number()),
    }),
    output: z.array(SubmissionSchema),
  },
  mod_assign_get_grades: {
    query: z.object({
      assignmentids: z.array(z.number()),
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
      courseid: z.string(),
      component: z.string(),
      activityid: z.number(),
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
      assignmentid: z.number(),
      userid: z.number(),
      grade: z.number(),
      feedback: z.string(),
    }),
    output: z.any(),
  },
  mod_assign_get_submission_status: {
    query: z.object({
      assignid: z.number(),
      userid: z.number(),
    }),
    output: SubmissionContentSchema,
  },
  mod_quiz_get_user_best_grade: {
    query: z.object({
      quizid: z.number(),
      userid: z.number(),
    }),
    output: QuizGradeResponseSchema,
  },
});
