#!/usr/bin/env bash

if [ ! -d "./node_modules" ]; then
  echo "$1 must be run from tinydoc's root."
  exit 1
fi

export NODE_ENV="production"

declare plugins=("cjs" "markdown" "git" "yard-api")

for plugin in "cjs" "markdown" "git" "yard-api"; do
  ./cli/tinydoc-compile \
    --optimize \
    plugins/${plugin}/ui/dist/tinydoc-plugin-${plugin}.js \
    plugins/${plugin}/ui/index.js

  [ $? -ne 0 ] && exit 1
done

node ./node_modules/webpack/bin/webpack.js \
  --progress \
  --display-chunks \
  --config=./webpack.config.js \
  $@
