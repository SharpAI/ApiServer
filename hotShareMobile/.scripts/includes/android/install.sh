# Name of android package to be installed/uninstalled
PACKAGE=`cat ${METEOR_ROOT}/.meteor/local/cordova-build/config.xml | grep 'widget id' | sed -e 's/^[^"]*.//' -e 's/".*//'`;

# Uninstall apk from plugged in device
adb uninstall $PACKAGE;

# Install apk to plugged in device
adb install "${METEOR_ROOT}/.release/android/CordovaApp-arm-debug.apk";
