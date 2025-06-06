FROM oven/bun:alpine

WORKDIR /app

# Copy only the bundled server file and package.json
COPY dist/server.bundle.js ./dist/server.bundle.js
COPY dist/package.json ./dist/package.json

# Expose the both port 3000 and 6277 the app runs on
EXPOSE 3000 

# Start the server by 
CMD ["bun", "dist/server.bundle.js"] 