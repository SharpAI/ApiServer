#!/bin/sh

./cleanbuild.sh
./build.sh

cd ~/build-sharpai/android/project

cp ~/workspace/hotShare/ShareExtension/Android/MainActivity.java ./src/org/sharpai/everywhere/
cp ~/workspace/hotShare/sharpai-buildfiles/AndroidManifest.xml ./
# change the version number
vim ./AndroidManifest.xml
cp ~/workspace/hotShare/sharpai-buildfiles/gradle.properties ./
cp ~/workspace/hotShare/sharpai-buildfiles/strings.xml ./res/values/
cp ~/workspace/hotShare/hotShareMobile/android.build.gradle ./build.gradle

ANDROID_HOME=~/android-sdk gradle wrapper
ANDROID_HOME=~/android-sdk ./gradlew assembleRelease -Pandroid.injected.signing.store.file=/home/sharpai/workspace/hotShare/hotShareMobile/keystore -Pandroid.injected.signing.store.password=actiontec -Pandroid.injected.signing.key.alias="wifi whiteboard" -Pandroid.injected.signing.key.password=actiontec

cd -

