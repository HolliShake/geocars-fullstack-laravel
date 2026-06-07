# Use the official Node.js image
FROM node:20-alpine

# Install watchman (optional, but helps Expo with file watching on some systems)
RUN apk add --no-cache bash

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Expo development ports
# 19000: Metro Bundler, 19001: Expo Dev Server, 19002: Expo Web UI (if used)
EXPOSE 8081 19000 19001 19002

# Start the Expo server with host mapping allowed
CMD ["npx", "expo", "start", "--dev-client"]