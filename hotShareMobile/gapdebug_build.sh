#!/bin/bash
#set -x

###ENV
#test on: Ubuntu 14.04.5 LTS 64bit

### install gradle
#curl -s https://get.sdkman.io | bash
#sdk install gradle 2.9
#
#

TAGET_FILE=~/build-hot-share/android/project/AndroidManifest.xml
PATCH_FILE=$TAGET_FILE.patch
CONFIG_FILE=~/build-hot-share/android/project/res/xml/config.xml
PATCH_FILE2=$CONFIG_FILE.patch

if [ $1'x' == 'releasex' ] || [ $1'x' == 'debugx' ]
then
	echo "build "$1
else
	echo "usage: ./gapdebug_build.sh release"
	echo "or     ./gapdebug_build.sh debug"
	exit
fi

if [ $1'x' == 'debugx' ]
then
	rm -f client/disable_console_log.js
fi

echo "step 1, building project ..."
sudo -E bash ./build.sh
sudo chmod a+rw ~/build-hot-share/ -R

cat << EOF > $PATCH_FILE
            <intent-filter>
               <action android:name="android.intent.action.SEND" />
               <category android:name="android.intent.category.DEFAULT" />
               <data android:mimeType="image/*" />
               <data android:mimeType="text/plain" />
             </intent-filter>
             <intent-filter>
               <action android:name="android.intent.action.SEND_MULTIPLE" />
               <category android:name="android.intent.category.DEFAULT" />
               <data android:mimeType="image/*" />
             </intent-filter>
EOF
line_num=$(grep "android.intent.category.LAUNCHER" $TAGET_FILE -rn | cut -d ':' -f 1)
let line_num=line_num+1

grep "android.intent.action.SEND" $TAGET_FILE > /dev/null 2>&1
if [ $? == 0 ]
then
	echo -e "\tAndroidManifest.xml patch failed !!!"
else
	sed -i "${line_num} r ${PATCH_FILE}" $TAGET_FILE
fi

rm -f $PATCH_FILE

if [ $1'x' == 'debugx' ]
then
	echo "step 2, enable debug ..."
cat << EOF > $PATCH_FILE2
    <gap:config-file platform="android" parent="/manifest">
        <application android:debuggable="true" />
    </gap:config-file>
EOF

	grep "xmlns:gap" $CONFIG_FILE > /dev/null 2>&1
	if [ $? == 0 ]
	then
		echo -e "\tconfig.xml patch failed !!! "
	else
		sed -i 's/xmlns:cdv/ xmlns:gap=\"http:\/\/phonegap.com\/ns\/1.0\" xmlns:android=\"http:\/\/schemas.android.com\/apk\/res\/android\" xmlns:cdv/' $CONFIG_FILE
		sed -i "2 r ${PATCH_FILE2}" $CONFIG_FILE
	fi

	grep "android:debuggable" $TAGET_FILE > /dev/null 2>&1
	if [ $? == 0 ]
	then
		echo -e "\tAndroidManifest.xml patch failed !!!"
	else
		sed -i 's/application android:hardwareAccelerated/application android:debuggable="true" android:hardwareAccelerated/' $TAGET_FILE
	fi
fi

rm -f $PATCH_FILE2

echo "step 3, copy MainActivity.java ..."
cp -f ../ShareExtension/Android/MainActivity.java ~/build-hot-share/android/project/src/org/hotshare/everywhere/

echo "step 4, chang name ..."
sed  -i "s/hotShare/故事贴/" ~/build-hot-share/android/project/res/values/strings.xml

echo "step 5, ..."
echo 'android.useDeprecatedNdk=true' >  ~/build-hot-share/android/project/gradle.properties
keypath=$(pwd)/keystore
pushd ~/build-hot-share/android/project
gradle wrapper
./gradlew assembleRelease -Pandroid.injected.signing.store.file=${keypath} -Pandroid.injected.signing.store.password=actiontec -Pandroid.injected.signing.key.alias="wifi whiteboard" -Pandroid.injected.signing.key.password=actiontec

ls ./build/outputs/apk/project-armv7-release.apk -l

popd > /dev/null
