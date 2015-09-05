#!/usr/bin/env bash

if [ ! -d "./node_modules" ]; then
  echo "$1 must be run from tinydoc's root."
  exit 1
fi

./node_modules/karma/bin/karma \
  start \
  ui/karma.conf.js \
  $@