#!/bin/sh

cd ~/build-sharpai/ios/project

PROJ_DIR=$HOME/workspace/sharpai
cp $PROJ_DIR/sharpai-buildfiles/ios/Gemfile ./
cp -R $PROJ_DIR/sharpai-buildfiles/ios/fastlane ./
cp -R $PROJ_DIR/sharpai-buildfiles/ios/CordovaLib ./
cp -R $PROJ_DIR/sharpai-buildfiles/ios/sharpai ./
cp -R $PROJ_DIR/sharpai-buildfiles/ios/sharpai.xcodeproj ./

VER=`grep version_of_build $PROJ_DIR/hotShareMobile/lib/6_version.js | cut -d"'" -f 2`

sed -i.bak "s/1.0.75/$VER/g" sharpai/sharpai-Info.plist

fastlane gym --export_method ad-hoc
TIMESTAMP=`date "+%Y%m%d%H%M%S"`
DESTFILE="$HOME/.jenkins/userContent/sharpai/sharpai-$VER-$TIMESTAMP.ipa"
cp ./sharpai.ipa $DESTFILE

fastlane beta

cd -
