#!/bin/env bash

echo "Fetching latest articles..."

# For historical reasons
date=$(date '+%Y-%m-%d_%H-%M-%S_%s')
curl https://feeds.elpais.com/mrss-s/pages/ep/site/brasil.elpais.com/portada > "portada-$date".xml
aws s3 cp news.json "s3://espanelm-website/rss_$date".xml


# es feed, not that relevant since most articles have not been translated yet
#node /app/index.js "https://elpais.com/rss/elpais/portada.xml" > news.json
#node /app/index.js "https://brasil.elpais.com/seccion/rss/internacional" > internacional.json
#node /app/index.js "https://brasil.elpais.com/seccion/rss/cultura" > cultura.json

# there's not many articles there, so it may not be that relevant
# node /app/index.js "https://brasil.elpais.com/seccion/rss/tecnologia" > tecnologia.json
# node /app/index.js "https://brasil.elpais.com/seccion/rss/deportes" > deportes.json
# node /app/index.js https://brasil.elpais.com/seccion/rss/ciencia > ciencia.json
# node /app/index.js https://brasil.elpais.com/seccion/rss/opinion > opinion.json
node /app/index.js "https://feeds.elpais.com/mrss-s/pages/ep/site/brasil.elpais.com/portada" > news.json
#jq -s add internacional.json cultura.json > news.json

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

