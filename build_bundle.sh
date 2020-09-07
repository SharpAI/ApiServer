#!/bin/bash

rm -rf ApiServer.tar.gz
meteor build --architecture=os.linux.x86_64 ../
mv ../ApiServer.tar.gz ./

echo "run \"docker build -t shareai/api_server:version .\""
