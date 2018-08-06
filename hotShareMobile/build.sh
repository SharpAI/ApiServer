#!/bin/bash
rm -rf ~/build-sharpai
rm -rf .meteor/local/cordova-build
rm -rf .meteor/local/build
rm -rf .meteor/local/bundler-cache
rm -rf .meteor/local/plugin-cache
#meteor build ~/build-sharpai --server=http://workaihost.tiegushi.com
#测试版
meteor build ~/build-sharpai --server=http://testworkai.tiegushi.com
rm -rf ~/build-sharpai/ios/project/sharpai/Images.xcassets/*
cp -rf ../WorkAI_Assets/* ~/build-sharpai/ios/project/sharpai/Images.xcassets/

