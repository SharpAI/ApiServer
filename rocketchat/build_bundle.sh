#!/bin/bash

git diff .
rm -rf rocketchat.tar.gz
meteor build --architecture=os.linux.x86_64 ../
mv ../rocketchat.tar.gz ./

echo "run \"docker build -t zhangzhiyue/hotshare:version .\""
