import { describe, it, expect } from "vitest";
import { MoodleMcpServer } from "./moodle";

describe("MoodleMcpServer", () => {
  const baseURL = "http://localhost:8080/webservice/rest/server.php";
  const wstoken = "0aa2a744e8ccb6c0a9453f432d3659dc";
  const server = new MoodleMcpServer(baseURL, wstoken);

  it("should be instantiated with baseURL and wstoken", () => {
    expect(server).toBeInstanceOf(MoodleMcpServer);
  });

  it("should have all required methods", () => {
    expect(typeof server.getStudents).toBe("function");
    expect(typeof server.getAssignments).toBe("function");
    expect(typeof server.getQuizzes).toBe("function");
    expect(typeof server.getSubmissions).toBe("function");
    expect(typeof server.provideFeedback).toBe("function");
    expect(typeof server.getSubmissionContent).toBe("function");
    expect(typeof server.getQuizGrade).toBe("function");
  });

  it.only("getStudents should accept courseid parameter", async () => {
    const result = await server.getStudents({ courseid: "2" });
    expect(Array.isArray(result)).toBe(true);
    // assert id is a number
    expect(typeof result[0].id).toBe("number");
  });
});
