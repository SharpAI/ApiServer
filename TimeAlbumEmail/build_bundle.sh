#!/bin/bash

git diff .
rm -rf TimeAlbumEmail.tar.gz
meteor build --architecture=os.linux.x86_64 ../
mv ../TimeAlbumEmail.tar.gz ./

echo "run \"docker build -t lambdazhang/raidcdn:version .\""
