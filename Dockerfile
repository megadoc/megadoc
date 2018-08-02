FROM node:8.11.3-alpine

ENV MEGADOC_VERSION "7.1.0"

RUN apk add --no-cache \
  git \
  ruby

RUN npm install -g npm@latest
RUN npm install --production \
      megadoc-cli@$MEGADOC_VERSION \
      megadoc-compiler@$MEGADOC_VERSION \
      megadoc-git-stats@$MEGADOC_VERSION \
      megadoc-html-dot@$MEGADOC_VERSION \
      megadoc-html-serializer@$MEGADOC_VERSION \
      megadoc-plugin-js@$MEGADOC_VERSION \
      megadoc-plugin-lua@$MEGADOC_VERSION \
      megadoc-plugin-markdown@$MEGADOC_VERSION \
      megadoc-plugin-reference-graph@$MEGADOC_VERSION \
      megadoc-plugin-yard-api@$MEGADOC_VERSION \
      megadoc-theme-minimalist@$MEGADOC_VERSION \
      megadoc-theme-qt@$MEGADOC_VERSION

# megadoc-git-stats dependencies
RUN gem install --no-rdoc --no-ri \
  json_pure \
  webrick

RUN ln -s /node_modules/.bin/megadoc /usr/local/bin/

WORKDIR /mnt

ENTRYPOINT [ "mimic", "megadoc" ]

RUN apk add --no-cache bash shadow sudo

COPY bin/mimic /usr/local/bin/