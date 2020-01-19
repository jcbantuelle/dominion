# Docker Compose

`dominion-meteor` can be run locally and deployed to production using Docker Compose. This method will keep all the dependencies inside of Docker containers. It can also make production deployments easy and reproducible.


## Setup

You'll need to install [Docker CE][https://www.docker.com/community-edition] and [Docker Compose][https://docs.docker.com/compose/install/]. Create an `.env` file in the directory where this `README` resides and use it to configure Docker and Compose as necesary:

    COMPOSE_PROJECT_NAME=dominion

## Development

By default `docker-compose` reads two files: `docker-compose.yml` and `docker-compose.override.yml`. We use `docker-compose.yml` as a base and provide the development-specific configuration in `docker-compose.override.yml`.

Start the webapp and the database container with:

    docker-compose up

The app should run at http://localhost:3000. The root of the repository will be mounted as a volume. Any changes will be instantly reflected in the running app.

When you're done with the development, stop and remove the containers with:

    docker-compose down

## Production

In production you'll need to explicitly override the base settings defined in `docker-compose.yml`. Copy `docker-compose.prod.yml-sample` to `docker-compose.prod.yml` and edit it to match your deployment details. Start the containers by passing both the base _and_ the production compose files:

    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

The `-d` flag starts the containers detached. The database storage persists in Docker-managed volumes. See `docker volume ls` and `docker volume inspect` to learn more about these volumes.

If you run both the development stack and the production stack on the same computer, make sure to use a different `COMPOSE_PROJECT_NAME` for each stack, or to rename the volumes used by the `mongo` service in `docker-compose.prod.yml`. Otherwise you'll end up modifying the production database in your dev environment.
