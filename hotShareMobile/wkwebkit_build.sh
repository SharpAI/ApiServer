#!/bin/bash
meteor add cordova:com.meteor.cordova-update@file://../cordova-plugins/com.meteor.cordova-update
meteor add practicalmeteor:wkwebview

sh ./build.sh

#open -a xcode .meteor/local/cordova-build/platforms/ios/hotShare.xcodeproj/
