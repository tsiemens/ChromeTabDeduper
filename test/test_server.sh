#!/usr/bin/env bash
cd $(dirname $0)/..
if [ -d test/vendor ]; then
    echo "Vendor directory exists, skipping dep fetch"
else
    echo "Fetching test dependencies..."
    python3 test/fetch_deps.py
fi
echo "Starting test server at http://localhost:8000/test/index.html"
python3 -m http.server 8000

