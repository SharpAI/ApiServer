#!/bin/bash

TARBALL=rt-portal.tar.gz

git diff .
rm -rf $TARBALL
meteor build --architecture=os.linux.x86_64 ../
mv ../$TARBALL ./

echo "run \"docker build -t lambdazhang/raidcnd:rt-portal-version .\""
