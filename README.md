# Moodle MCP Server and API server 

![moodle-openapi-server](https://app1.sharemyimage.com/2025/05/10/image.jpg)

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

## Environment Variables

The following environment variables are required to run the server:

```
MOODLE_BASE_URL=https://your.moodle.url
MOODLE_WSTOKEN=yourtoken
# Example: USERS=user1:password1,user2:password2
USERS=admin:admin,teacher:teacher
```

- `MOODLE_BASE_URL`: The base URL of your Moodle instance (e.g., https://learn.twu.ca)
- `MOODLE_WSTOKEN`: The web service token for your Moodle user
- `USERS`: Comma-separated list of username:password pairs for basic authentication (e.g., admin:admin,teacher:teacher)

## Development 

you should start your local moodle server before running the test. 

you can also connect to a remote moodle server by setting the `MOODLE_BASE_URL` environment variables. 

> [!NOTE]
> you need to create a ws token for the external service. see [CREATE_WS_TOKEN.md](./CREATE_WS_TOKEN.md) for more details.
> However, you don't need to set the `MOODLE_WSTOKEN` environment variable to run the docker image.

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
  -e USERS=admin:admin,teacher:teacher \
  -p 3000:3000 \
  moodle-openapi-server
```

for example


```
docker run \
  -e MOODLE_BASE_URL=https://learn.twu.ca \
  -e USERS=admin:admin,teacher:teacher \
  -p 3000:3000 \
  moodle-openapi-server
```

## limitation 

MCP is single tenant for now. we cannot connect to multiple moodle instances from the mcp server. 

https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/193 

## License 

This project is licensed under the MIT License. See the LICENSE file for details.

This project is created and maintained by Yeung Man Lung Ken (manlung.yeung@twu.ca). It would be nice if you can give me a shoutout and star the repo if you like it. 