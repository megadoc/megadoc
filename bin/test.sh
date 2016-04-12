#!/usr/bin/env bash

./node_modules/.bin/mocha "packages/tinydoc-plugin-$1/lib/**/*.test.js" $@