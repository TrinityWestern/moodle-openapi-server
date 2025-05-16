# Moodle MCP Server and API server 

![moodle-mcp-server](https://app1.sharemyimage.com/2025/05/10/image.jpg)

An MCP (Model Context Protocol) server that enables LLMs to interact with the Moodle platform to manage courses, students, assignments, and quizzes.

This server also provide a REST API that coheres with the openapi spec. 

The MCP server is available at `localhost:6277/sse`.

[![](https://share.cleanshot.com/xmqhBX0D+)](https://share.cleanshot.com/dFLVz77G)

## Techstack 

This project uses latest tech and steps on the shoulders of giants:

- [hono](https://hono.dev/) for the rest api
- [bun](https://bun.sh/) for javascript runtime
- [docker](https://www.docker.com/) for the container
- [typescript](https://www.typescriptlang.org/) for the programming language
- [fastmcp](https://github.com/punkpeye/fastmcp) for the mcp protocol
- [zod](https://zod.dev/) for the schema validation
- [tsx](https://tsx.dev/) for the script runner
- [vitest](https://vitest.dev/) for the testing

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
  -e MOODLE_BASE_URL=https://learn.twu.ca \
  -e MOODLE_WSTOKEN=0aa2a744e8ccb6c0a9453f432d3659dc \
  -p 3000:3000 \
  -p 6277:6277 \
  moodle-mcp-server
```

## limitation 

MCP is single tenant for now. we cannot connect to multiple moodle instances from the mcp server. 

https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/193 

## License 

This project is licensed under the MIT License. See the LICENSE file for details.

This project is created and maintained by Yeung Man Lung Ken (manlung.yeung@twu.ca). It would be nice if you can give me a shoutout and star the repo if you like it. 