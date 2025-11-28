#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# Se tiver migrations, rode aqui:
# npm run migrate