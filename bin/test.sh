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

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null || {
  echo "$0: Must be run from tinydoc root.";
  exit 1
}

source "./bin/_helpers.sh"

nodejs_use_local_packages

SOURCE_DIRS=""

if [ -z $PACKAGE ]; then
  if [ "$1" != "--" ]; then
    PACKAGE=$1
  fi

  shift
fi

if [ -z $PACKAGE ]; then
  SOURCE_DIRS="packages/*/lib"
else
  if [ -d "packages/${PACKAGE}" ]; then
    SOURCE_DIRS="packages/${PACKAGE}/lib"
  elif [ -d "packages/tinydoc-plugin-${PACKAGE}" ]; then
    SOURCE_DIRS="packages/tinydoc-plugin-${PACKAGE}/lib"
  else
    echo "Invalid package '${PACKAGE}'."
    exit 1
  fi

  stat $SOURCE_DIRS/**/*.test.js &> /dev/null || {
    echo "No tests were found matching the pattern '${SOURCE_DIRS}/**/*.test.js' - nothing to do."
    exit 0
  }
fi

if [ "${COVERAGE}" == "1" ]; then
  ./node_modules/.bin/istanbul cover \
    --preserve-comments \
    --report lcov \
    --report html \
    ./node_modules/mocha/bin/_mocha -- "${SOURCE_DIRS}/**/*.test.js"
else
  exec ./node_modules/.bin/mocha $@ "${SOURCE_DIRS}/**/*.test.js"
fi
