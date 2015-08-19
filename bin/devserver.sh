#!/usr/bin/env bash
#
# Run the webpack HMR devserver against a pre-compiled tinydoc-react-reporter
# config file (which contains the database).
#
# Usage:
#
#   ./bin/devserver [/path/to/config.js]
#
# To generate the needed config.js, run tiny-cli with tinydoc-react-reporter
# enabled as a plugin and look for that file in the outputDir.

export NODE_ENV="development"
export VERBOSE=1
export CONFIG_FILE=$1

if [ ! -z "${CONFIG_FILE}" ]; then
  echo "Using config file ${CONFIG_FILE}"
fi

if [ ! -d "./ui" ]; then
  echo "$1 must be run from tinydoc's root."
  exit 1
fi

node ./ui/server.js