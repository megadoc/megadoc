# This hack is very convenient to play around node require paths where our
# packages most usually require "tinydoc" and other core plugins as
# peerDependencies but they won't (and shouldn't) be installed locally.
#
# What this will do is that it will make node resolve those packages from
# /packages and it will work for the core library because we created a fake
# package inside /packages/tinydoc to this end.
function nodejs_use_local_packages {
  export NODE_PATH="./packages:${NODE_PATH}"
}

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

# Returns a string containing the value of the "version" field in a package.json.
#
# @param {String} package
#        Path to package.json to read from.
function read_package_version {
  grep 'version' $1 | cut -d'"' -f4
}

# Returns a string containing the version value of a "peerDependencies": {}
# entry in a package.json.
#
# @param {String} package
#        Path to package.json to read from.
#
# @param {String} name
#        The dependency package name.
function read_peer_dependency_version {
  egrep -oz "\"peerDependencies\"[^\}]+\"$2\": \"[^\"]+\"[^\}]+}" $1 | grep $2 | cut -d'"' -f4
}
