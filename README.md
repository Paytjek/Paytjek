## Hi there 👋

<!--
**Paytjek/Paytjek** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I'm currently working on ...
- 🌱 I'm currently learning ...
- 👯 I'm looking to collaborate on ...
- 🤔 I'm looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->

## Docker Setup

This project can be run using Docker and Docker Compose, which containerizes both the frontend and backend applications.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MISTRAL_API_KEY=your_mistral_api_key_here
```

### Building and Running

To build and start the application:

```bash
# Build the Docker images
docker-compose build

# Start the containers
docker-compose up
```

The services will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000

To run in detached mode (in the background):

```bash
docker-compose up -d
```

To stop the containers:

```bash
docker-compose down
```

### Development vs Production

The current configuration is set up for development with volumes mounted to enable hot reloading of code changes.

For production deployment, consider:
1. Removing the volume mounts
2. Adding proper environment configuration
3. Setting up a reverse proxy (like Nginx or Traefik) for TLS termination
4. Implementing proper logging and monitoring
