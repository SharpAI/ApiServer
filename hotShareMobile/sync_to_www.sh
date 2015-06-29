#!/bin/bash
echo 'Applying changes from meteor build directory'
cp -rf .meteor/local/build/programs/web.cordova/app/* .meteor/local/cordova-build/www/application/
mkdir -p .meteor/local/cordova-build/platforms/ios/www/application/
cp -rf .meteor/local/build/programs/web.cordova/app/* .meteor/local/cordova-build/platforms/ios/www/application/
mkdir -p .meteor/local/cordova-build/platforms/android/assets/www/application/
cp -rf .meteor/local/build/programs/web.cordova/app/* .meteor/local/cordova-build/platforms/android/assets/www/application/

