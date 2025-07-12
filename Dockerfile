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

# Expose the dev server port (you can change if needed)
EXPOSE 3000

# Default command to start http-server on port 3000 serving current folder
CMD ["http-server", "-p", "3000"]
