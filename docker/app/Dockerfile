# Development stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port (common dev server ports)
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
