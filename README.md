# Moodle MCP Server and API server 

An MCP (Model Context Protocol) server that enables LLMs to interact with the Moodle platform to manage courses, students, assignments, and quizzes.

This server also provide a REST API that coheres with the openapi spec. 

The openapi spec is available at `localhost:3000/doc` while the MCP server is available at `localhost:6277/sse`.

## Development 

you should start your local moodle server before running the test. 

you can also connect to a remote moodle server by setting the `MOODLE_BASE_URL` and `MOODLE_WSTOKEN` environment variables. 

```bash 
git pull
pnpm install 
# start the hono server and the mcp server 
pnpm run dev:all
# build the code 
pnpm run build 
# start the hono server and the mcp server 
pnpm run start
# build the hono as binary using bun
# this will only build the binary according to the current architecture, if you want to build for other architectures, you need to modify the command
pnpm run build:binary
# build the docker image 
pnpm run build:docker
# run the docker image 
docker run \
  -e MOODLE_BASE_URL=https://your.moodle.url \
  -e MOODLE_WSTOKEN=yourtoken \
  -p 3000:3000 \
  -p 6277:6277 \
  moodle-mcp-server
```

for example

```
docker run \
  -e MOODLE_BASE_URL=https://moodle-27.localcan.dev \
  -e MOODLE_WSTOKEN=0aa2a744e8ccb6c0a9453f432d3659dc \
  -p 3000:3000 \
  -p 6277:6277 \
  moodle-mcp-server
```

## limitation 

MCP is single tenant for now. we cannot connect to multiple moodle instances from the mcp server. 

https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/193 