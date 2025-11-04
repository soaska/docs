# Build stage
FROM node:20-alpine AS builder

# Install git (required for VitePress lastUpdated feature)
RUN apk add --no-cache git

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build with API URL from build arg
ARG VITE_API_URL=https://proxi.soaska.ru:8080
ENV VITE_API_URL=$VITE_API_URL

# Build the documentation
RUN pnpm run docs:build

# Runtime stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional, using default for now)
# If you need custom nginx config, uncomment and create nginx.conf:
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]