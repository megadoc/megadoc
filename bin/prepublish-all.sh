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

PACKAGES=$(
  (cd packages/ && find ./ -maxdepth 1 -type d -name 'tinydoc-*') |
  sort |
  sed 's/\.\///'
)

for pkg in $PACKAGES; do
  if [ $pkg == "tinydoc-plugin-skeleton" ]; then
    continue
  fi

  ./bin/prepublish.sh $pkg $@ || {
    echo "${pkg} failed to build - aborting."
    exit 1
  }
done