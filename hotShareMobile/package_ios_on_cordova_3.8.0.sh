#!/bin/bash
cd .meteor/local/cordova-build
cordova platform update ios@3.8.0
cordova build ios
open -a Xcode platforms/ios/hotShare.xcodeproj
