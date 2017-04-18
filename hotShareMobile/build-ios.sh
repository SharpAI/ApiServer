#!/bin/bash
rm -rf ~/build-workai
rm -rf .meteor/local/cordova-build
rm -rf .meteor/local/build
rm -rf .meteor/local/bundler-cache
rm -rf .meteor/local/plugin-cache
meteor remove-platform android
meteor build ~/build-workai --server=http://workaihost.tiegushi.com
open ~/build-workai/ios/project/WorkAI.xcodeproj/
meteor add-platform android
# meteor build ~/build-hot-share --server=http://storeboard.tiegushi.com
