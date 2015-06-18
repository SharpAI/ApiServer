# URL of crosswalk release (includes both x86 and arm processor versions)
CROSSWALK_RELEASE="https://s3.amazonaws.com/meteor-mobile/crosswalk-11.40.277.1.zip";
CROSSWALK_RELEASE="https://download.01.org/crosswalk/releases/crosswalk/android/beta/12.41.296.9/crosswalk-12.41.296.9.zip"

# Directory of build cordova project for android
ANDROID_DIR="${METEOR_ROOT}/.meteor/local/cordova-build/platforms/android";

# Directory where crosswalk release is stored
CROSSWALK_DIR="${METEOR_ROOT}/.build-tools/crosswalk-11.40.277.1";
CROSSWALK_DIR="${METEOR_ROOT}/.build-tools/crosswalk-12.41.296.9";

# Android SDK
SDK="${ANDROID_HOME}"
# $(dirname ~/.meteor/android_bundle/android-sdk/tools)"

# Android SDK tools installed by Meteor
SDK_TOOLS="${SDK}/tools";

# Android SDK platform tools installed by Meteor
SDK_PLATFORM_TOOLS="${SDK}/platform-tools";

# Add the Android SDK to the path
# export PATH=$PATH:$SDK_TOOLS:$SDK_PLATFORM_TOOLS

# export ANDROID_HOME="${SDK}"

# Download and unzip crosswalk package if it does not exist
if [ ! -d "$CROSSWALK_DIR" ]; then
  mkdir "${METEOR_ROOT}/.build-tools"
  cd "${METEOR_ROOT}/.build-tools";
  curl -sS $CROSSWALK_RELEASE > crosswalk-12.41.296.9.zip
  unzip crosswalk-12.41.296.9.zip -d ./;
  cd ../;
fi

#================== BUILD FOR x86 PROCESSORS ==================

# Remove CordovaLib contents from current meteor build
rm -Rf "${ANDROID_DIR}/CordovaLib/*";

# Replace CordovaLib with contents of crosswalk framework
cp -a "${CROSSWALK_DIR}"/crosswalk-x86/framework/* "${ANDROID_DIR}"/CordovaLib/;
cp -a "${CROSSWALK_DIR}"/crosswalk-x86/VERSION "${ANDROID_DIR}"/;

cd "${ANDROID_DIR}/CordovaLib/";
"${SDK_TOOLS}"/android update project --subprojects --path . --target "android-21";
ant debug;

# Move to .meteor/local/cordova-build/platforms/android
cd ..;

# Clean ant-gen and ant-build to get ready for building apk
rm -Rf ant-gen;
rm -Rf ant-build;

# Move to .meteor/local/cordova-build
cd "${ANDROID_DIR}/../../";


# Build cordova project
if [ "${DEBUG_MODE}" = true ]; then
  cordova build android;
  mv "${ANDROID_DIR}/ant-build/CordovaApp-debug.apk" "${RELEASE_DIR}/android/CordovaApp-x86-debug.apk";
else
  cordova build android --release;
  mv "${ANDROID_DIR}/ant-build/CordovaApp-release-unsigned.apk" "${RELEASE_DIR}/android/CordovaApp-x86-unsigned.apk";
fi

cd "${ROOT}"

#================== BUILD FOR ARM PROCESSORS ==================

# Remove CordovaLib contents from current meteor build
rm -Rf "${ANDROID_DIR}/CordovaLib/*";

# Replace CordovaLib with contents of crosswalk framework
cp -a "${CROSSWALK_DIR}"/crosswalk-arm/framework/* "${ANDROID_DIR}"/CordovaLib/;
cp -a "${CROSSWALK_DIR}"/crosswalk-arm/VERSION "${ANDROID_DIR}"/;

cd "${ANDROID_DIR}/CordovaLib/";
"${SDK_TOOLS}"/android update project --subprojects --path . --target "android-21";
ant debug;

# Move to .meteor/local/cordova-build/platforms/android
cd ..;

# Clean ant-gen and ant-build to get ready for building apk
rm -Rf ant-gen;
rm -Rf ant-build;

# Move to .meteor/local/cordova-build
cd "${ANDROID_DIR}/../../";

# Build cordova project
if [ "${DEBUG_MODE}" = true ]; then
  cordova build android;
  mv "${ANDROID_DIR}/ant-build/CordovaApp-debug.apk" "${RELEASE_DIR}/android/CordovaApp-arm-debug.apk";
else
  cordova build android --release;
  mv "${ANDROID_DIR}/ant-build/CordovaApp-release-unsigned.apk" "${RELEASE_DIR}/android/CordovaApp-arm-unsigned.apk";
fi

cd "${ROOT}"
