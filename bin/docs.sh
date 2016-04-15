#!/usr/bin/env bash

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null || {
  echo "$0: Must be run from tinydoc root.";
  exit 1
}

source "./bin/_local-node-requires.sh"

exec ./cli/tinydoc --config=doc/tinydoc.conf.js $@