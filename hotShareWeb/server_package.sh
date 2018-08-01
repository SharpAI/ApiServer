#!/bin/sh

./build_bundle.sh

# change the version number
VER=`grep version_of_build ./lib/6_version.js | cut -d"'" -f 2`
docker build -t lambdazhang/raidcdn:sharpai-$VER .
docker save -o sharpai-$VER.tar lambdazhang/raidcdn:sharpai-$VER
gzip sharpai-$VER.tar
mv sharpai-$VER.tar.gz ~

