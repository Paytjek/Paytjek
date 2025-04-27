# Paytjek

This project can be run using Docker and Docker Compose, which containerizes both the frontend and backend applications.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Environment Variables

For production environment, create a `.env` file in the root directory with:

```
DATABASE_URL=postgresql+asyncpg://username:password@host:port/database
MISTRAL_API_KEY=your_mistral_api_key_here
```

**Note:** Contact the team for the actual database credentials and API keys. Never commit credentials to version control.

## Building and Running for Production

To build and start the application in production mode:

```bash
# Build the Docker images
docker-compose -f docker-compose.prod.yml build

# Start the containers
docker-compose -f docker-compose.prod.yml up -d
```

The services will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000

To stop the containers:

```bash
docker-compose -f docker-compose.prod.yml down
```

Check frontend changes:
```bash
docker-compose -f docker-compose.prod.yml build --no-cache frontend && docker-compose -f docker-compose.prod.yml up -d --force-recreate frontend
```

## Troubleshooting

If you encounter encoding issues with environment files:

```bash
echo DATABASE_URL=your_database_url > .env.new
echo MISTRAL_API_KEY=your_mistral_api_key >> .env.new
del .env
move .env.new .env
```

For calendar data issues, check that:
1. Backend is connected to the Supabase database
2. `VITE_API_URL` in `docker-compose.prod.yml` is set to `http://localhost:8000`
3. Calendar API endpoint returns JSON data

For database connection issues, use the `/db-info` endpoint to verify the connection.
