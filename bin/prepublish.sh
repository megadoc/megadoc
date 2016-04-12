#!/usr/bin/env bash

if [ -z $PACKAGE ]; then
  echo "Usage: $0 PACKAGE"
  exit 1
fi

[ -f "./package.json" ] && grep '"name": "tinydoc"' ./package.json &> /dev/null

if [ $? -ne 0 ]; then
  echo "$0: Must be run from tinydoc root.";
  exit 1
fi

PACKAGE_NAME="tinydoc-plugin-${PACKAGE}"
PACKAGE_ROOT="packages/${PACKAGE_NAME}"

if [ ! -d "${PACKAGE_ROOT}" ]; then
  echo "${PACKAGE_NAME} is not a valid tinydoc plugin package."
  exit 1
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
  [ -f $PACKAGE_ROOT/package.json ] && (
    cd $PACKAGE_ROOT;
    echo "Ensuring dependencies are not out-of-date...";
    npm install --ignore-scripts &&
    npm prune &&
    npm dedupe
  )
}

function lint_sources {
  ./node_modules/.bin/eslint $PACKAGE_ROOT/lib
}

function lint_ui_sources {
  ./node_modules/.bin/eslint -c .eslintrc -c .eslintrc--ui $PACKAGE_ROOT/ui
}

function run_tests {
  ./node_modules/.bin/mocha --reporter dot "${PACKAGE_ROOT}/lib/**/*.test.js"
}

function build_assets {
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

IGNORED=()

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

echo "Skipping ${IGNORED}"

run_task refresh_dependencies

shouldRun "lint" && run_task lint_sources && run_task lint_ui_sources
shouldRun "test" && run_task run_tests
shouldRun "build" && run_task build_assets

echo "Package \"${PACKAGE_NAME}\" is good for publishing, nice work!"
echo "---------------------------------------------------------------"
