#!/bin/bash
npm install xcode
cordova platforms remove ios
cordova platforms remove android
cordova plugins add https://github.com/sgrebnov/cordova-plugin-background-download#master
cordova plugins add cordova-plugin-chrome-apps-power@1.0.4
cordova plugins add cordova-plugin-crosswalk-webview@1.5.0
cordova plugins add cordova-plugin-device
cordova plugins add cordova-plugin-file@4.1.1
cordova plugins add cordova-plugin-iosrtc@2.2.2
cordova plugins add cordova-plugin-whitelist@1.2.1

cordova platforms add android@5.1.0
cordova platforms add ios@3.9.2
