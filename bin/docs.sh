#!/usr/bin/env bash

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null

if [ $? -ne 0 ]; then
  echo "$0: Must be run from tinydoc root.";
  exit 1
fi

source "./bin/_local-node-requires.sh"

exec ./cli/tinydoc --config=doc/tinydoc.conf.js $@