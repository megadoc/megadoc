#!/usr/bin/env bash

# OUTPUT=$1
FILES=$1

function blame() {
  git blame -p -c $1 | egrep 'committer( |-mail|-time)'
}

echo "Statting for ${FILES}"

for file in $FILES; do
  echo "file: ${file}"
  blame $file
done