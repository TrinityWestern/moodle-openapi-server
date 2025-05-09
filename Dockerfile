FROM oven/bun:alpine

# install pnpm 
RUN bun install -g pnpm

WORKDIR /app

# Copy package.json and pnpm-lock.yaml and install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy only the JS files  from dist directory
COPY dist/src/*.js ./dist/src/
COPY dist/package.json ./dist/package.json

# Expose the both port 3000 and 6277 the app runs on
EXPOSE 3000 6277

# Start the server by 
CMD ["bun", "start"] 