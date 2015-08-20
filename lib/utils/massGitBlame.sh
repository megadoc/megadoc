#!/usr/bin/env bash

FILES=$1

for file in $FILES; do
  echo "file: ${file}"
  git blame -p -c $file | egrep 'committer( |-mail|-time)'
done