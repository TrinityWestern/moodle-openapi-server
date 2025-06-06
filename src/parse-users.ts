export const parseUsers = (
	users: string,
): {
	username: string;
	password: string;
}[] => {
	// check if users is a valid string
	if (!users || users.trim() === "") {
		throw new Error("USERS environment variable must not be empty.");
	}

	// Split the string by commas and validate each pair
	return users
		.split(",")
		.map((user) => user.trim())
		.map((user) => {
			const [username, password] = user.split(":");
			if (!username || !password) {
				throw new Error(
					`Invalid user format: ${user}. Expected format is username:password.`,
				);
			}
			return { username, password };
		});
};
