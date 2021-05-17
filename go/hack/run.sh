#!/usr/bin/env bash

# Fetches articles
# And pushes to data direectory

set -euo pipefail
set -x

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

date=$(date '+%Y-%m-%d_%H-%M-%S_%s')

mkdir -p ../data/elpais/ptbr
go run cmd/main.go elpais run > "../data/elpais/ptbr/$date.json"

# TODO
# merge all existing articles
echo "Copying to ../data/articles.jso
"
cp "../data/elpais/ptbr/$date.json" "../data/articles.json"


