#!/bin/sh

cd ~/build-sharpai/android/project

cp ~/workspace/hotShare/ShareExtension/Android/MainActivity.java ./src/org/sharpai/everywhere/
cp ~/workspace/hotShare/sharpai-buildfiles/AndroidManifest.xml ./
# change the version number
VER=`grep version_of_build ~/workspace/hotShare/hotShareMobile/lib/6_version.js | cut -d"'" -f 2`
VERCODE='100'`echo $VER | cut -d'.' -f 3`
sed -i.bak "s/android:versionName=\"1.0.69\"/android:versionName=\"$VER\"/g" AndroidManifest.xml
sed -i.bak "s/android:versionCode=\"10069\"/android:versionCode=\"$VERCODE\"/g" AndroidManifest.xml

cp ~/workspace/hotShare/sharpai-buildfiles/gradle.properties ./gradle.properties
cp ~/workspace/hotShare/sharpai-buildfiles/strings.xml ./res/values/strings.xml
#cp ~/workspace/hotShare/hotShareMobile/android.build.gradle ./build.gradle

ANDROID_HOME=~/Library/Android/sdk gradle wrapper
ANDROID_HOME=~/Library/Android/sdk/ ./gradlew assembleRelease -Pandroid.injected.signing.store.file=/Users/actiontec/workspace/hotShare/hotShareMobile/keystore -Pandroid.injected.signing.store.password=actiontec -Pandroid.injected.signing.key.alias="wifi whiteboard" -Pandroid.injected.signing.key.password=actiontec

DESTFILE="$HOME/sharpai-$VER.apk"
cp ./build/outputs/apk/project-release.apk $DESTFILE

cd -
