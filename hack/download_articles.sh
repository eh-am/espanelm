#!/usr/bin/env bash

# Reads a list of links to download from stdin and saves them under $ARTICLES_PATH
# Usage: "cat links | download_articles.sh"
# these links were manually gathered by looking at the output of the rss feed 

set -euo pipefail

# So that this script can be run from anywhere
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

ARTICLES_PATH="$SCRIPT_DIR/../fixtures/articles"
ARTICLES_LIST="$ARTICLES_PATH/list.ts"

mkdir -p "$ARTICLES_PATH"


# handcraft a json object, ts ready
echo "export default [" > "$ARTICLES_LIST"

while read -r line; do
  FILENAME=$(echo $line | sed -re "s@.*\\/([0-9]+_[0-9]+)\.html.*@\1@")
  
  (cd "$ARTICLES_PATH" && curl -o "$FILENAME" "$line")
  echo "{ name: \"$FILENAME\", url: \"$line\" }," >> "$ARTICLES_LIST"
done

# remove last ','
truncate -s-2 "$ARTICLES_LIST"
echo "]" >> "$ARTICLES_LIST"