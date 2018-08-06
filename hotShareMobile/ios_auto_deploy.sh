#!/bin/sh

cd ~/build-sharpai/ios/project

cp ~/workspace/hotShare/sharpai-buildfiles/ios/Gemfile ./
cp -R  ~/workspace/hotShare/sharpai-buildfiles/ios/fastlane ./
cp -R ~/workspace/hotShare/sharpai-buildfiles/ios/CordovaLib ./
cp -R ~/workspace/hotShare/sharpai-buildfiles/ios/sharpai ./
cp -R ~/workspace/hotShare/sharpai-buildfiles/ios/sharpai.xcodeproj ./

VER=`grep version_of_build ~/workspace/hotShare/hotShareMobile/lib/6_version.js | cut -d"'" -f 2`
fastlane gym --export_method ad-hoc
DESTFILE="$HOME/sharpai-$VER.ipa"
cp ./sharpai.ipa $DESTFILE

fastlane beta

cd -
