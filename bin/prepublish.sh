#!/usr/bin/env bash

if [ -z $PACKAGE ]; then
  PACKAGE=$1

  if [ -z $PACKAGE ]; then
    echo "Usage: $0 PACKAGE"
    exit 1
  fi
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

run_task refresh_dependencies
run_task lint_sources
run_task lint_ui_sources
run_task run_tests
run_task build_assets

echo "Package \"${PACKAGE_NAME}\" is good for publishing, nice work!"
echo "---------------------------------------------------------------"

# echo "Cleaning previous build artifacts..." &&
# ( [ -d "${PACKAGE_ROOT}/dist" ] && rm -r $PACKAGE_ROOT/dist || echo -n ) &&
# echo "Linting sources..." &&
# ./node_modules/.bin/eslint $PACKAGE_ROOT/lib &&
# echo "Linting UI sources..." &&
# ./node_modules/.bin/eslint -c .eslintrc -c .eslintrc--ui $PACKAGE_ROOT/ui &&
# echo "Running tests..." &&
# ./node_modules/.bin/mocha --reporter dot "${PACKAGE_ROOT}/lib/**/*.test.js" &&
# echo "Building assets..." &&
# ./cli/tinydoc-compile --optimize \
#   "${PACKAGE_ROOT}/dist/${PACKAGE_NAME}.js" \
#   "${PACKAGE_ROOT}/ui/index.js" &&
# echo "Done!"