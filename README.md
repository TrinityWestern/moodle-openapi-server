# Moodle MCP Server and API server 

An MCP (Model Context Protocol) server that enables LLMs to interact with the Moodle platform to manage courses, students, assignments, and quizzes.

## Development 

```bash 
git pull
pnpm install 
# start the hono server 
pnpm run dev
# build the code 
pnpm run build 
# build the hono as binary using bun
# this will only build the binary according to the current architecture, if you want to build for other architectures, you need to modify the command
pnpm run build:binary
# build the docker image 
pnpm run build:docker
```