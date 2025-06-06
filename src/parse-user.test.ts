import { expect, describe, it } from "bun:test";

import { parseUsers } from "./parse-users";

describe("parseUsers", () => {
	const validUsers = "user1:password1,user2:password2";
	const expectedOutput = [
		{ username: "user1", password: "password1" },
		{ username: "user2", password: "password2" },
	];
	it("should parse a valid users string", () => {
		const result = parseUsers(validUsers);
		expect(result).toEqual(expectedOutput);
	});
	it("should throw an error for an invalid users string", () => {
		const invalidUsers = "user1:password1,user2";
		expect(() => parseUsers(invalidUsers)).toThrow(
			"Invalid user format: user2. Expected format is username:password.",
		);
	});
	it("should throw an error for an empty users string", () => {
		const emptyUsers = "";
		expect(() => parseUsers(emptyUsers)).toThrow(
			"USERS environment variable must not be empty.",
		);
	});
});
