#!/usr/bin/env bash

# Prepublish EVERYTHING; the core package and all official packages, running
# their lints, tests, and compiling their assets.

set -e

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null

if [ $? -ne 0 ]; then
  echo "$0: Must be run from tinydoc root.";
  exit 1
fi

npm run prepublish

for pkg in $(find packages -maxdepth 1 -type d -name 'tinydoc-*' | sort | sed 's/packages\///')
do
  if [ $pkg == "tinydoc-plugin-skeleton" ]; then
    continue
  fi

  ./bin/prepublish.sh $pkg $@
done