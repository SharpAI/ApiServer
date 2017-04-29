#!/bin/bash
rm -rf ~/build-workai
rm -rf .meteor/local/cordova-build
rm -rf .meteor/local/build
rm -rf .meteor/local/bundler-cache
rm -rf .meteor/local/plugin-cache
meteor build ~/build-workai --server=http://workaihost.tiegushi.com
rm -rf ~/build-workai/ios/project/WorkAI/Images.xcassets/*
cp -rf ../WorkAI_Assets/* ~/build-workai/ios/project/WorkAI/Images.xcassets/
# meteor build ~/build-hot-share --server=http://storeboard.tiegushi.com
