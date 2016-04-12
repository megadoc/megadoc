#!/usr/bin/env bash

# Run eslint against the UI (ES6) sources of a package or all packages.
#
# Usage:
#
#     $0 [PACKAGE]
#
# Environment variables:
#
#   - PACKAGE: the package, in case $1 is not passed

SOURCES=()

if [ -z $PACKAGE ]; then
  PACKAGE=$1
  shift
fi

if [ -z $PACKAGE ]; then
  SOURCES=("ui" packages/*/ui)
elif [ -d "packages/${PACKAGE}" ]; then
  SOURCES=("packages/${PACKAGE}/ui")
elif [ -d "packages/tinydoc-plugin-${PACKAGE}" ]; then
  SOURCES=("packages/tinydoc-plugin-${PACKAGE}/ui")
else
  echo "Invalid package '${PACKAGE}'."
  exit 1
fi

exec ./node_modules/.bin/eslint \
  -c .eslintrc \
  -c .eslintrc--ui \
  "${SOURCES[@]}" $@