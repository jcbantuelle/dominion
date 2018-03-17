FROM node:6-slim as dev
RUN curl "https://install.meteor.com/?release=1.4.1.1" | sh
COPY . /app/src
WORKDIR /app/src

# Build the bundle on a glibc system because meteor build uses its own
# dynamically-linked node binary which doesn't work on node:alpine.
FROM dev as build
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        python \
    && npm install \
    && /root/.meteor/meteor build /app/dist --directory \
    && apt-get remove --purge -y \
        build-essential \
        python \
    && apt-get autoremove -y \
    && apt-get clean

# In production build Node Fibers against the musl-compatible node.
FROM node:6-alpine as prod
COPY --from=build /app/dist/bundle /bundle
WORKDIR /bundle
RUN apk add --no-cache --virtual bundle-deps \
        build-base \
        python \
    && cd programs/server \
    && npm install \
    && apk del bundle-deps

ENTRYPOINT ["node"]
CMD ["main.js"]
