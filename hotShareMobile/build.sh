#!/bin/bash
rm -rf ~/build-workai
rm -rf .meteor/local/cordova-build
rm -rf .meteor/local/build
rm -rf .meteor/local/bundler-cache
rm -rf .meteor/local/plugin-cache
meteor build ~/build-workai --server=http://workaihost.tiegushi.com
#测试版
#meteor build ~/build-workai --server=http://testworkai.tiegushi.com
rm -rf ~/build-workai/ios/project/WorkAI/Images.xcassets/*
cp -rf ../WorkAI_Assets/* ~/build-workai/ios/project/WorkAI/Images.xcassets/

# meteor build ~/build-hot-share --server=http://storeboard.tiegushi.com
# rm -rf ~/build-workai1
# rm -rf .meteor/local/cordova-build
# rm -rf .meteor/local/build
# rm -rf .meteor/local/bundler-cache
# rm -rf .meteor/local/plugin-cache
# meteor build ~/build-workai1 --server=http://workaihost.tiegushi.com
# rm -rf ~/build-workai1/ios/project/WorkAI/Images.xcassets/*
# cp -rf ../WorkAI_Assets/* ~/build-workai1/ios/project/WorkAI/Images.xcassets/

# rm -rf ~/build-workai-localserver
# rm -rf .meteor/local/cordova-build
# rm -rf .meteor/local/build
# rm -rf .meteor/local/bundler-cache
# rm -rf .meteor/local/plugin-cache
# meteor build ~/build-workai-localserver --server=http://192.168.2.8:9000

# rm -rf ~/build-workai-localserver/ios/project/WorkAI/Images.xcassets/*
# cp -rf ../WorkAI_Assets/* ~/build-workai-localserver/ios/project/WorkAI/Images.xcassets/


