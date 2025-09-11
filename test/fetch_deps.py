#!/usr/bin/env python3
import urllib.request
import os
from pathlib import Path

DEPS = {
    'qunit.js': 'https://code.jquery.com/qunit/qunit-2.6.0.js',
    'qunit.css': 'https://code.jquery.com/qunit/qunit-2.6.0.css',
    'sinon-chrome.js': 'https://github.com/acvetkov/sinon-chrome/releases/download/v2.3.1/sinon-chrome.min.js'
}

def fetch_deps():
    vendor_dir = Path(__file__).parent / 'vendor'
    vendor_dir.mkdir(exist_ok=True)

    for filename, url in DEPS.items():
        target = vendor_dir / filename
        if not target.exists():
            print(f"Downloading {url} to {target}")
            urllib.request.urlretrieve(url, target)
        else:
            print(f"Already exists: {target}")

if __name__ == "__main__":
    fetch_deps()
