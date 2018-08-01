#!/bin/bash

cd ../hotShareWeb-StaticJS
npm run build
cd -
#git diff .
rm -rf hotShareWeb.tar.gz
meteor build --architecture=os.linux.x86_64 ../
mv ../hotShareWeb.tar.gz ./

echo "run \"docker build -t zhangzhiyue/hotshare:version .\""
