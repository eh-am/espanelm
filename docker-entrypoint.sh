#!/bin/env bash

echo "Fetching latest articles..."

# For historical reasons
date=$(date '+%Y-%m-%d_%H-%M-%S_%s')
curl https://feeds.elpais.com/mrss-s/pages/ep/site/brasil.elpais.com/portada > "rss_$date".xml

# backup now's rss
aws s3 cp rss_$date.xml "s3://espanelm-website/rss_$date".xml


node /app/index.js "elpais" > news.json

echo "Displaying news.json"
cat news.json


echo "Validating JSON..."
size=$(jq -e '. | length' < "news.json")
if [[ "$size" -gt "0" ]]; then
	echo "Syncing files..."
	aws s3 cp news.json s3://espanelm-website/news.json

	aws s3 cp news.json s3://espanelm-website/news_"$date".json
else
	echo "Invalid json. Won't sync."
	exit 1
fi

