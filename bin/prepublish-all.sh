#!/usr/bin/env bash

# Prepublish EVERYTHING; the core package and all official packages, running
# their lints, tests, and compiling their assets.

set -e

npm run prepublish

for pkg in $(find packages -maxdepth 1 -type d -name 'tinydoc-*' | sort | sed 's/packages\///')
do
  if [ $pkg == "tinydoc-plugin-skeleton" ]; then
    continue
  fi

  ./bin/prepublish.sh $pkg $@
done