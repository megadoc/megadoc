#!/usr/bin/env bash

# Ensure a plugin package is good for publishing.
#
# Usage:
#
#     $0 PACKAGE [-S "lint"|"test"|"build"[, -S ...]]
#
# This script will perform the following:
#
#   - install NPM packages and make sure they're up to date
#   - (optional, -S lint to skip) lint the back-end and UI sources
#   - (optional, -S test to skip) run the back-end tests
#   - (optional, -S build to skip) compile the plugin's UI assets
#
# Environment variables:
#
#   - PACKAGE: the package, in case $1 is not passed

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null || {
  echo "$0: Must be run from tinydoc root.";
  exit 1
}

if [ -z $PACKAGE ]; then
  if [ $# -gt 0 ]; then
    PACKAGE=$1
    shift
  fi

  if [ -z $PACKAGE ]; then
    echo "Usage: $0 PACKAGE"
    exit 1
  fi
fi

PACKAGE_NAME="${PACKAGE}"
PACKAGE_ROOT="packages/${PACKAGE_NAME}"
IGNORED=()

if [ ! -d "${PACKAGE_ROOT}" ]; then
  PACKAGE_NAME="tinydoc-plugin-${PACKAGE}"
  PACKAGE_ROOT="packages/${PACKAGE_NAME}"

  if [ ! -d "${PACKAGE_ROOT}" ]; then
    echo "${PACKAGE_NAME} is not a valid tinydoc plugin package."
    exit 1
  fi
fi

function run_task {
  task=$@
  echo -e "\n[$task] STARTING $(date)"

  $task 2>&1 | while IFS="" read line; do echo -e "[$task] $line"; done

  exit_status=${PIPESTATUS[0]}

  if [[ $exit_status != 0 ]]; then
    echo -e "[$task] \033[31mFAILED!\033[0m (exit code $exit_status)"
    exit 1
  else
    echo -e "[$task] \033[32mOK\033[0m"
  fi

  echo -e "[$task] FINISHED $(date)\n"
}

function refresh_dependencies {
  [ -f $PACKAGE_ROOT/package.json ] && {
    cd $PACKAGE_ROOT
    echo "Ensuring dependencies are not out-of-date..."

    npm install --ignore-scripts && {
      # this is causing issues on travis, i think it's the dedupe...
      if [ -z $TRAVIS_BUILD ]; then
        echo "Pruning and deduping..."
        npm prune && npm dedupe
      fi
    }
  }
}

function lint_sources {
  ./bin/lint.sh $PACKAGE
}

function lint_ui_sources {
  ./bin/lint-ui.sh $PACKAGE
}

function run_tests {
  ./bin/test.sh $PACKAGE --reporter dot
}

function build_assets {
  if [ ! -f $PACKAGE_ROOT/ui/index.js ]; then
    echo "Package has no UI assets to compile - nothing to do!"
    return 0
  fi

  if [ -d $PACKAGE_ROOT/dist ]; then
    echo "Cleaning previous build artifacts..."
    rm -r $PACKAGE_ROOT/dist
  fi

  ./cli/tinydoc-compile --optimize \
    "${PACKAGE_ROOT}/dist/${PACKAGE_NAME}.js" \
    "${PACKAGE_ROOT}/ui/index.js"
}

echo "Preparing \"${PACKAGE_NAME}\" for publishing... hang on tight."
echo "---------------------------------------------------------------"

while getopts ":S:" opt; do
  case $opt in
    S)
      IGNORED+=("${OPTARG}")
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done

function shouldRun() {
  if [[ " ${IGNORED[@]} " =~ " $1 " ]]; then
    return 1
  else
    return 0
  fi
}

run_task refresh_dependencies

shouldRun "lint" && run_task lint_sources && run_task lint_ui_sources
shouldRun "test" && run_task run_tests
shouldRun "build" && run_task build_assets

echo "Package \"${PACKAGE_NAME}\" is good for publishing, nice work!"
echo "---------------------------------------------------------------"
