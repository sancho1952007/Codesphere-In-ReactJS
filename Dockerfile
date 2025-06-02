# Build stage using Bun
FROM oven/bun:1 AS builder

WORKDIR /app
COPY . .

# Install and build with Bun
RUN bun install
RUN bun run build

# Serve stage with nginx
FROM nginx:alpine

# Copy built files to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]