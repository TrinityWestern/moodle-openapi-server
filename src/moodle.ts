import { createFetch } from "@better-fetch/fetch";
import { moodleSchema } from "./schema";
import { logger } from "@better-fetch/logger";
import { BetterFetchPlugin } from "@better-fetch/fetch";

const moodlePlugin = (
  wstoken: string,
  options?: {
    moodlewsrestformat?: string;
  }
) => {
  const { moodlewsrestformat = "json" } = options || {};

  return {
    id: "moodle-plugin",
    name: "Moodle Plugin",
    init: async (
      /**
       * the url id of the request
       */
      url,
      options
    ) => {
      if (!options || !options.baseURL) throw new Error("Options are required");
      const _url = new URL(options.baseURL);

      // for each params in options, set search params on _url
      Object.entries(options?.query || {}).forEach(([key, value]) => {
        _url.searchParams.set(key, value as string);
      });
      _url.searchParams.set("wsfunction", url);
      _url.searchParams.set("wstoken", wstoken);
      _url.searchParams.set("moodlewsrestformat", moodlewsrestformat);

      return {
        url: _url.toString(),
        options,
      };
    },
  } satisfies BetterFetchPlugin;
};

function f(baseURL: string, wstoken: string) {
  return createFetch({
    baseURL,
    schema: moodleSchema,
    plugins: [
      logger({
        enabled: baseURL.startsWith("http://"),
        console,
      }),
      moodlePlugin(wstoken),
    ],
  });
}
export class MoodleMcpServer {
  private fetch: ReturnType<typeof f>;

  constructor(baseURL: string, wstoken: string) {
    this.fetch = f(baseURL, wstoken);
  }

  public async getStudents({ courseid }: { courseid: string }) {
    const response = await this.fetch("core_enrol_get_enrolled_users", {
      query: {
        courseid,
      },
      method: "POST",
    });

    if ("error" in response && response.error) {
      throw new Error(response.error.message);
    }

    if (!("data" in response)) {
      throw new Error("No data received from the server");
    }

    return response.data;
  }

  public async getAssignments({ courseid }: { courseid: string }) {
    const response = await this.fetch("mod_assign_get_assignments", {
      query: {
        courseids: [courseid],
      },
    });

    if ("error" in response && response.error) {
      throw new Error(response.error.message);
    }

    if (!("data" in response)) {
      throw new Error("No data received from the server");
    }

    return response.data.courses[0]?.assignments;
  }

  public async getQuizzes({ courseid }: { courseid: string }) {
    const response = await this.fetch("mod_quiz_get_quizzes_by_courses", {
      query: {
        courseids: [courseid],
      },
    });

    if ("error" in response && response.error) {
      throw new Error(response.error.message);
    }

    if (!("data" in response)) {
      throw new Error("No data received from the server");
    }

    return response.data.quizzes;
  }

  public async getSubmissions(args: {
    studentId?: number;
    assignmentId?: number;
  }) {
    const response = await this.fetch("mod_assign_get_submissions", {
      query: {
        assignmentids: args.assignmentId ? [args.assignmentId] : [],
      },
    });

    if ("error" in response && response.error) {
      throw new Error(response.error.message);
    }

    if (!("data" in response)) {
      throw new Error("No data received from the server");
    }

    let submissions = response.data;

    if (args.studentId) {
      submissions = submissions.filter(
        (submission) => submission.userid === args.studentId
      );
    }

    // Get grades for each submission
    const gradesResponse = await this.fetch("mod_assign_get_grades", {
      query: {
        assignmentids: args.assignmentId ? [args.assignmentId] : [],
      },
    });

    if ("error" in gradesResponse && gradesResponse.error) {
      throw new Error(gradesResponse.error.message);
    }

    if (!("data" in gradesResponse)) {
      throw new Error("No data received from the server");
    }

    const grades = gradesResponse.data;

    // Combine submissions with grades
    const submissionsWithGrades = submissions.map((submission) => {
      const studentGrade = grades.find(
        (grade) => grade.userid === submission.userid
      );
      return {
        ...submission,
        submittedAt: new Date(submission.timemodified * 1000).toISOString(),
        grade: studentGrade ? studentGrade.grade : "Not graded",
      };
    });

    return submissionsWithGrades;
  }

  public async provideFeedback(args: {
    studentId: number;
    assignmentId: number;
    grade: number;
    feedback: string;
  }) {
    const response = await this.fetch("mod_assign_save_grade", {
      query: {
        assignmentid: args.assignmentId,
        userid: args.studentId,
        grade: args.grade || -1,
        feedback: args.feedback,
      },
    });

    if ("error" in response && response.error) {
      throw new Error(response.error.message);
    }

    if (!("data" in response)) {
      throw new Error("No data received from the server");
    }

    return response.data;
  }

  public async getSubmissionContent(args: {
    studentId: number;
    assignmentId: number;
  }) {
    const response = await this.fetch("mod_assign_get_submission_status", {
      query: {
        assignid: args.assignmentId,
        userid: args.studentId,
      },
    });

    if ("error" in response && response.error) {
      throw new Error(response.error.message);
    }

    if (!("data" in response)) {
      throw new Error("No data received from the server");
    }

    return response.data;
  }

  public async getQuizGrade(args: { studentId: number; quizId: number }) {
    const response = await this.fetch("mod_quiz_get_user_best_grade", {
      query: {
        quizid: args.quizId,
        userid: args.studentId,
      },
    });

    if ("error" in response && response.error) {
      throw new Error(response.error.message);
    }

    if (!("data" in response)) {
      throw new Error("No data received from the server");
    }

    return response.data;
  }
}
