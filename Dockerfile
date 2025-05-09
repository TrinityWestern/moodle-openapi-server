FROM oven/bun:alpine

WORKDIR /app

# Copy only the JS files from dist directory
COPY dist/*.js ./

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["bun", "server.js"] 