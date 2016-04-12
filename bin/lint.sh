#!/usr/bin/env bash

./node_modules/.bin/eslint -c .eslintrc "packages/tinydoc-plugin-$1/lib" $@