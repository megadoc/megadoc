#!/usr/bin/env bash

# Run mocha tests for the backend sources of a certain package or all packages.
#
# Usage:
#
#     $0 [PACKAGE]
#
# Environment variables:
#
#   - PACKAGE: the package, in case $1 is not passed
#   - COVERAGE: when set to "1", istanbul will run mocha to generate a coverage
#     report under /coverage

# This hack is very convenient to play around node require paths where our
# packages most usually require "tinydoc" and other core plugins as
# peerDependencies but they won't (and shouldn't) be installed locally.
#
# What this will do is that it will make node resolve those packages from
# /packages and it will work for the core library because we created a fake
# package inside /packages/tinydoc to this end.
export NODE_PATH="./packages:${NODE_PATH}"

SOURCE_DIRS=""

if [ -z $PACKAGE ]; then
  if [ "$1" != "--" ]; then
    PACKAGE=$1
  fi

  shift
fi

if [ -z $PACKAGE ]; then
  SOURCE_DIRS="{lib,packages/*/lib}"
elif [ -d "packages/${PACKAGE}" ]; then
  SOURCE_DIRS="packages/${PACKAGE}/lib"
elif [ -d "packages/tinydoc-plugin-${PACKAGE}" ]; then
  SOURCE_DIRS="packages/tinydoc-plugin-${PACKAGE}/lib"
else
  echo "Invalid package '${PACKAGE}'."
  exit 1
fi

SOURCES="${SOURCE_DIRS}/**/*.test.js"

stat "${SOURCES}" &> /dev/null || {
  echo "No tests were found matching the pattern '${SOURCES}' - nothing to do."
  exit 0
}

if [ "${COVERAGE}" == "1" ]; then
  ./node_modules/.bin/istanbul cover \
    --preserve-comments \
    --report lcov \
    --report html \
    ./node_modules/mocha/bin/_mocha -- "${SOURCE_DIRS}/**/*.test.js"
else
  exec ./node_modules/.bin/mocha $@ "${SOURCE_DIRS}/**/*.test.js"
fi
