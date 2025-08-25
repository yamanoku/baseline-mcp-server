FROM denoland/deno:latest

# Create the application directory
WORKDIR /app

# Copy dependency files first for caching
COPY --chown=deno:deno deno.json deno.lock* ./

# Copy the rest of the application code
COPY --chown=deno:deno . .

# Prefer not to run as root.
USER deno

# Cache application dependencies
RUN deno cache baseline-mcp-server.ts

# Run the application
CMD ["run", "--allow-net=api.webstatus.dev", "baseline-mcp-server.ts"]