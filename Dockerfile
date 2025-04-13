FROM denoland/deno:latest

# Create the application directory
WORKDIR /app

# Copy dependency files first for caching
COPY deno.json deno.lock* ./

# Copy the rest of the application code
COPY . .

# Cache application dependencies
RUN deno cache baseline-mcp-server.ts

# Run the application
CMD ["run", "--allow-net=api.webstatus.dev", "baseline-mcp-server.ts"]