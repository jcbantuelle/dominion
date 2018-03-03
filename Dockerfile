FROM node:6

RUN apt-get update \
    && apt-get install -y bsdtar \
    && ln -sf $(which bsdtar) $(which tar) \
    && curl "https://install.meteor.com/?release=1.4.1.1" | sh

COPY . /app/src
WORKDIR /app/src

RUN npm install \
    && meteor build /app/dist --directory --architecture os.linux.x86_64

WORKDIR /app/dist/bundle
RUN cd programs/server \
    && npm install

ENTRYPOINT ["node", "main.js"]
