#!/bin/bash
cd .meteor/local/cordova-build/
cordova platform update android
cordova platform remove ios 
cordova plugin rm com.file-transfer.baidu.bcs
rm -rf  local-plugins/com.file-transfer.baidu.bcs
rm -rf  plugins/com.file-transfer.baidu.bcs
cordova plugin rm cordova-plugin-crosswalk-webview
cordova plugin rm cordova-plugin-whitelist
cordova plugin add https://github.com/solderzzc/cordova-plugin-whitelist.git#r1.1.1
cordova plugin add https://github.com/MobileChromeApps/cordova-plugin-crosswalk-webview.git#1.2.0
cordova plugin add https://github.com/solderzzc/cordova-plugin-file-transfer.git#r0.5.2
cp ../../../../cordova-build-overide/config.xml ./
cp ../../../../cordova-build-overide/platforms/android/assets/www/index.html platforms/android/assets/www/index.html
cordova compile android --release
cd ../../../
cp .meteor/local/cordova-build/platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk android-armv7-release-unsigned.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore keystore android-armv7-release-unsigned.apk "wifi whiteboard" 
mv android-armv7-release-unsigned.apk android-armv7-release.apk
