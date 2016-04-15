#!/usr/bin/env bash

# Lint the back-end source files for a package or all packages.
#
# Usage:
#
#     $0 [PACKAGE]
#
# Environment variables:
#
#   - PACKAGE: the package, in case $1 is not passed

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null || {
  echo "$0: Must be run from tinydoc root.";
  exit 1
}

SOURCES=()

if [ -z $PACKAGE ]; then
  PACKAGE=$1
  shift
fi

if [ -z $PACKAGE ]; then
  SOURCES=("lib" packages/*/lib)
elif [ -d "packages/${PACKAGE}" ]; then
  SOURCES=("packages/${PACKAGE}/lib")
elif [ -d "packages/tinydoc-plugin-${PACKAGE}" ]; then
  SOURCES=("packages/tinydoc-plugin-${PACKAGE}/lib")
else
  echo "Invalid package '${PACKAGE}'."
  exit 1
fi

exec ./node_modules/.bin/eslint -c .eslintrc "${SOURCES[@]}" $@