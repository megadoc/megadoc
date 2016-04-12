#!/usr/bin/env bash

./node_modules/.bin/eslint \
  -c .eslintrc \
  -c .eslintrc--ui \
  "packages/tinydoc-plugin-$1/ui" $@