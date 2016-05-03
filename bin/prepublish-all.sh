#!/usr/bin/env bash

# Prepublish EVERYTHING; the core package and all official packages, running
# their lints, tests, and compiling their assets.

set -e

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null || {
  echo "$0: Must be run from tinydoc root.";
  exit 1
}

if [ -z $SKIP_SELF_PREPUBLISH ]; then # for travis
  npm run prepublish
fi

for pkg in $(find packages -maxdepth 1 -type d -name 'tinydoc-*' | sort | sed 's/packages\///')
do
  if [ $pkg == "tinydoc-plugin-skeleton" ]; then
    continue
  fi

  # prepublish a single package but skip its tests/lints since we already do
  # them implicitly in `npm run publish`...
  ./bin/prepublish.sh $pkg -S lint -S test
done