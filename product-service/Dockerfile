# Build stage
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 4001

# Command to run the application
CMD ["npm", "run", "start:prod"]
