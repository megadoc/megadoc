#!/usr/bin/env bash

for file in $1; do
  echo "file: ${file}"
  git blame -p -c $file | egrep 'committer( |-mail|-time)'
done