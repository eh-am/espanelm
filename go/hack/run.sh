#!/usr/bin/env bash

# Fetches articles
# And pushes to date direectory

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

date=$(date '+%Y-%m-%d_%H-%M-%S_%s')

mkdir -p ../data/elpais/ptbr
go run cmd/main.go elpais run > "../data/elpais/ptbr/$date.json"

# TODO
# merge all existing articles
