# Use an official Node image with a Linux base
FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    python3 \
    python3-pip \
    python-is-python3 \
    unzip \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Install Gemini CLI globally via npx
RUN npm install -g @google/gemini-cli http-server

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./

# Install project dependencies
RUN npm install && ls -l node_modules && ls -l node_modules/express

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 3000

# Command to start the Node.js server
CMD ["npm", "start"]

