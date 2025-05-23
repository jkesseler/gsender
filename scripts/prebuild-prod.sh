#!/bin/bash

mkdir -p dist
rm -rf dist/*

pushd src
mkdir -p ../dist/gsender/
cp -af package.json ../dist/gsender/
cross-env NODE_ENV=production babel "*.js" \
    --config-file ../babel.config.js \
    --out-dir ../dist/gsender
cross-env NODE_ENV=production babel "electron-app/**/*.js" \
    --config-file ../babel.config.js \
    --out-dir ../dist/gsender/electron-app
popd
