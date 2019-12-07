#!/usr/bin/env bash

# Reads a list of links to download from stdin and saves them under $ARTICLES_PATH
# Usage: "cat links | download_articles.sh"
# these links were manually gathered by looking at the output of the rss feed 

set -euo pipefail

# So that this script can be run from anywhere
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

ARTICLES_PATH="$SCRIPT_DIR/../test/fixtures/articles_es"
ARTICLES_LIST="$ARTICLES_PATH/list.ts"

mkdir -p "$ARTICLES_PATH"


# handcraft a json object, ts ready
echo "export default [" > "$ARTICLES_LIST"


while read -r line; do
  # Same article may have two versions: a spanish one and a brazilian one
  # Thus we add a preffix to differentiate them
  ID=$(echo $line | sed -re "s@.*\\/([0-9]+_[0-9]+)\.html.*@\1@")
  PREFFIX=$(echo $line | sed -re "s@.*\\/\\/(.*)\.elpais\.com.*@\1@")


  # there's no preffix
  if [ "$PREFFIX" == "$line" ]; then
    PREFFIX=""
  fi

  FILENAME="$PREFFIX$ID"
  echo "Creating file named $FILENAME Article $line"
  
  (cd "$ARTICLES_PATH" && curl -s -o "$FILENAME" "$line")
  echo "{ name: \"$FILENAME\", url: \"$line\" }," >> "$ARTICLES_LIST"
done

# remove last ','
truncate -s-2 "$ARTICLES_LIST"
echo "]" >> "$ARTICLES_LIST"