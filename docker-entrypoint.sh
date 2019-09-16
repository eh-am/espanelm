#!/bin/sh

echo "Fetching latest articles..."
node /app/index.js "https://brasil.elpais.com/rss/brasil/portada_completo.xml" > news.json

printenv
cat "news.json"

echo "Syncing files..."
aws s3 cp --acl='public-read' news.json s3://espanelm/news.json
# s3-cli sync news.json s3://espanelm/news.json