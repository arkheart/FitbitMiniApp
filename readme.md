# Gemini Web App Dev Container

This project uses Docker to create a development environment for building HTML + JavaScript apps. It includes Gemini CLI, Git, and lets you edit files live from your host using VS Code.

## Quick Start

```bash
# Build and run the container
docker-compose up --build

# Access the container shell
docker exec -it gemini_dev_env bash

# Edit files from your host using VS Code
# Your project directory is mounted to /app inside the container
code .

# Start a development server inside the container
npm install -g http-server
http-server -p 3000
# Then open http://localhost:3000 in your browser

# Gemini CLI is pre-installed
gemini --help
# Make sure to set your API key or configuration if needed

# Common Docker commands
docker-compose up            # Start container
docker-compose down          # Stop container
docker-compose up --build    # Rebuild container
docker exec -it gemini_dev_env bash  # Access container shell
```

## Project Structure

```
gemini-webapp/
├── Dockerfile
├── docker-compose.yml
├── README.md
├── index.html
└── script.js
```

Happy coding!

Note:
Gemini CLI instructions
https://github.com/google-gemini/gemini-cli

Billing Dashboard (for my own use)
https://aistudio.google.com/usage