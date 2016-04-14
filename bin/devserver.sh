#!/usr/bin/env bash
#
# Run the webpack HMR devserver against a pre-compiled tinydoc **runtime**
# config file.
#
# Usage:
#
#   ./bin/devserver /path/to/config.js
#
# To generate the needed config.js, run ./cli/index.js and look for that file
# in the outputDir.

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null

if [ $? -ne 0 ]; then
  echo "$0: Must be run from tinydoc root.";
  exit 1
fi

export NODE_ENV="development"
export VERBOSE=1
export CONFIG_FILE=$1

if [ -z "${CONFIG_FILE}" ]; then
  echo "Usage: $0 path/to/tinydoc-config.js"
  exit 1
fi

if [ ! -d "./ui" ]; then
  echo "$1 must be run from tinydoc's root."
  exit 1
fi

exec node ./server.js