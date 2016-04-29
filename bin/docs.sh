#!/usr/bin/env bash

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null || {
  echo "$0: Must be run from tinydoc root.";
  exit 1
}

source "./bin/_helpers.sh"

nodejs_use_local_packages

exec ./cli/tinydoc --config=doc/tinydoc.conf.js $@