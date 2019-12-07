#!/bin/env bash

echo "Fetching latest articles..."
node /app/index.js "https://brasil.elpais.com/rss/brasil/portada_completo.xml" > news.json


echo "Validating JSON..."
size=$(jq -e '. | length' < "news.json")
if [[ "$size" -gt "0" ]]; then
	echo "Syncing files..."
	aws s3 cp --acl='public-read' news.json s3://espanelm/news.json

	aws s3 cp --acl='public-read' news.json s3://espanelm/news_"$(date '+%Y-%m-%d_%H-%M-%S_%s')".json
else
	echo "Invalid json. Won't sync."
	exit 1
fi

