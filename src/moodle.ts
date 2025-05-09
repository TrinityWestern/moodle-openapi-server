import { moodleSchema } from "./schema";
import qs from "qs";
import ky from "ky";
import type { z } from "zod";
import path from "path";

export class MoodleServer {
  private wstoken: string;
  private baseURL: string;

  constructor(baseURL: string, wstoken: string) {
    this.wstoken = wstoken;
    // if baseURL does not end with /webservice/rest/server.php, append it
    if (!baseURL.endsWith("/webservice/rest/server.php")) {
      this.baseURL = path.join(baseURL, "webservice/rest/server.php");
    } else {
      this.baseURL = baseURL;
    }
  }

  public getUrl<F extends keyof typeof moodleSchema>(
    wsfunction: F,
    query: z.output<(typeof moodleSchema)[F]["query"]>
  ) {
    return `${this.baseURL}/?${qs.stringify(
      {
        wsfunction,
        wstoken: this.wstoken,
        moodlewsrestformat: "json",
        ...query,
      },
      { encode: false }
    )}`;
  }

  public async request<F extends keyof typeof moodleSchema>(
    wsfunction: F,
    query: z.output<(typeof moodleSchema)[F]["query"]>
  ): Promise<
    z.SafeParseReturnType<
      z.output<(typeof moodleSchema)[F]["output"]>,
      z.output<(typeof moodleSchema)[F]["output"]>
    > & {
      url: string;
      raw?: unknown;
    }
  > {
    const url = this.getUrl(wsfunction, query);

    // logger.info({ url, query }, "Request sent to Moodle API");

    const raw = await ky.post(url).json();
    const data = moodleSchema[wsfunction].output.safeParse(raw);

    // logger.info({ url, data }, "Response received from Moodle API");
    return {
      url,
      ...data,
      raw: data.success ? undefined : raw,
    };
  }

  public async getStudents(
    args: z.output<typeof moodleSchema.core_enrol_get_enrolled_users.query>
  ) {
    return this.request("core_enrol_get_enrolled_users", args);
  }

  public async getAssignments(
    args: z.output<typeof moodleSchema.mod_assign_get_assignments.query>
  ) {
    return this.request("mod_assign_get_assignments", args);
  }

  public async getQuizzes(
    args: z.output<typeof moodleSchema.mod_quiz_get_quizzes_by_courses.query>
  ) {
    return this.request("mod_quiz_get_quizzes_by_courses", args);
  }

  public async getSubmissions(
    args: z.output<typeof moodleSchema.mod_assign_get_submissions.query>
  ) {
    return this.request("mod_assign_get_submissions", args);
  }

  public async getGrades(
    args: z.output<typeof moodleSchema.mod_assign_get_grades.query>
  ) {
    return this.request("mod_assign_get_grades", args);
  }

  public async provideFeedback(
    args: z.output<typeof moodleSchema.mod_assign_save_grade.query>
  ) {
    return this.request("mod_assign_save_grade", args);
  }

  public async getSubmissionContent(
    args: z.output<typeof moodleSchema.mod_assign_get_submission_status.query>
  ) {
    return this.request("mod_assign_get_submission_status", args);
  }

  public async getQuizGrade(
    args: z.output<typeof moodleSchema.mod_quiz_get_user_best_grade.query>
  ) {
    return this.request("mod_quiz_get_user_best_grade", args);
  }
}
