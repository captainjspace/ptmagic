# Build stage
FROM node:20-slim AS build

# Install pnpm
RUN npm install -g pnpm@11.1.3

WORKDIR /app

# Copy workspace configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package manifests
COPY packages/utils/package.json ./packages/utils/
COPY packages/schema-gen/package.json ./packages/schema-gen/
COPY packages/ts-config/package.json ./packages/ts-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/
COPY apps/pt-magic/package.json ./apps/pt-magic/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the project
RUN pnpm -r build

# Production stage
FROM nginx:alpine AS production

# Copy the build output from the app
COPY --from=build /app/apps/pt-magic/dist /usr/share/nginx/html

# Optional: Add custom Nginx config if needed for SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
