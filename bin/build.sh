#!/usr/bin/env bash

if [ ! -d "./node_modules" ]; then
  echo "$1 must be run from tinydoc's root."
  exit 1
fi

export NODE_ENV="production"

node ./node_modules/webpack/bin/webpack.js \
  --progress \
  --display-chunks \
  --config=./ui/webpack.config.js \
  $@