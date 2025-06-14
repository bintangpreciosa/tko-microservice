# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./


# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 4003

# Command to run the application
CMD ["node", "dist/src/main"]

