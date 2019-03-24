FROM node:8.11.3-alpine as builder

ENV NODE_ENV="production"

RUN apk add --no-cache bash git jq

RUN npm install --global npm@latest && \
    npm install --global lerna@latest

COPY lerna.json package.json /usr/local/src/
COPY packages/megadoc-cli/package.json /usr/local/src/packages/megadoc-cli/
COPY packages/megadoc-compiler/package.json /usr/local/src/packages/megadoc-compiler/
COPY packages/megadoc-git-stats/package.json /usr/local/src/packages/megadoc-git-stats/
COPY packages/megadoc-html-dev-server/package.json /usr/local/src/packages/megadoc-html-dev-server/
COPY packages/megadoc-html-dot/package.json /usr/local/src/packages/megadoc-html-dot/
COPY packages/megadoc-html-live-server/package.json /usr/local/src/packages/megadoc-html-live-server/
COPY packages/megadoc-html-serializer/package.json /usr/local/src/packages/megadoc-html-serializer/
COPY packages/megadoc-plugin-js/package.json /usr/local/src/packages/megadoc-plugin-js/
COPY packages/megadoc-plugin-lua/package.json /usr/local/src/packages/megadoc-plugin-lua/
COPY packages/megadoc-plugin-markdown/package.json /usr/local/src/packages/megadoc-plugin-markdown/
COPY packages/megadoc-plugin-reference-graph/package.json /usr/local/src/packages/megadoc-plugin-reference-graph/
COPY packages/megadoc-plugin-yard-api/package.json /usr/local/src/packages/megadoc-plugin-yard-api/
COPY packages/megadoc-theme-minimalist/package.json /usr/local/src/packages/megadoc-theme-minimalist/
COPY packages/megadoc-theme-qt/package.json /usr/local/src/packages/megadoc-theme-qt/

WORKDIR /usr/local/src

RUN npx lerna bootstrap \
      --hoist \
      --scope=megadoc-cli \
      --scope=megadoc-compiler \
      --scope=megadoc-git-stats \
      --scope=megadoc-html-dev-server \
      --scope=megadoc-html-dot \
      --scope=megadoc-html-live-server \
      --scope=megadoc-html-serializer \
      --scope=megadoc-plugin-js \
      --scope=megadoc-plugin-lua \
      --scope=megadoc-plugin-markdown \
      --scope=megadoc-plugin-reference-graph \
      --scope=megadoc-plugin-yard-api \
      --scope=megadoc-theme-minimalist \
      --scope=megadoc-theme-qt \
      -- --production && \
    rm -rf ~/.npm

COPY . /usr/local/src

RUN npx lerna exec \
      --stream \
      --concurrency 1 \
      --scope=megadoc-cli \
      --scope=megadoc-compiler \
      --scope=megadoc-git-stats \
      --scope=megadoc-html-dev-server \
      --scope=megadoc-html-dot \
      --scope=megadoc-html-live-server \
      --scope=megadoc-html-serializer \
      --scope=megadoc-plugin-js \
      --scope=megadoc-plugin-lua \
      --scope=megadoc-plugin-markdown \
      --scope=megadoc-plugin-reference-graph \
      --scope=megadoc-plugin-yard-api \
      --scope=megadoc-theme-minimalist \
      --scope=megadoc-theme-qt \
      -- \
        PACKAGE="${LERNA_PACKAGE_NAME}" ../../bin/prepublish -O build

FROM alpine:3.9 as production

RUN apk add --no-cache bash git ruby ruby-etc ruby-json ruby-webrick s6 shadow

COPY --from=builder /usr/local/src /usr/local/src
COPY --from=builder /usr/local/bin/* /usr/local/bin/
COPY --from=builder \
  /usr/lib/libstdc++.so.6 \
  /usr/lib/libgcc_s.so.1 \
  /usr/lib/

RUN ln -s /usr/local/src/packages/megadoc-cli/bin/megadoc.js /usr/local/bin/megadoc && \
    ln -s /usr/local/src/bin/mimic                           /usr/local/bin/mimic

ENV NODE_ENV="production" \
    NODE_PATH="/usr/local/src/node_modules:/usr/local/src/packages"

VOLUME [ "/mnt" ]
WORKDIR /mnt

ENTRYPOINT [ "mimic", "megadoc" ]
