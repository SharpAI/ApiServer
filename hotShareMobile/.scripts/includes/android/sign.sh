APPLICATION_NAME="Todos";

# Generate key to sign .apk if it does not exist
if [ ! -f "${RELEASE_DIR}/android/${APPLICATION_NAME}.keystore" ]; then
  echo "";
  echo "Keystore does not exist! Attempting to generate one...";
  echo "";

  keytool -genkey -v -keystore "${RELEASE_DIR}/android/${APPLICATION_NAME}.keystore" \
  -alias "${APPLICATION_NAME}" -keyalg RSA -keysize 2048 -validity 10000
fi

echo "";
echo "Using ${APPLICATION_NAME}.keystore to sign CordovaApp-x86-unsigned.apk.";
echo "";

# Sign x86 .apk using jarsigner
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore \
"${RELEASE_DIR}/android/${APPLICATION_NAME}.keystore" "${RELEASE_DIR}/android/CordovaApp-x86-unsigned.apk" "${APPLICATION_NAME}";

# Remove previously aligned x86 apk
if [ -f "${RELEASE_DIR}/android/${APPLICATION_NAME}-x86.apk" ]; then
  rm -rf "${RELEASE_DIR}/android/${APPLICATION_NAME}-x86.apk";
fi

# Align x86 .apk using zipalign
zipalign -v 4 "${RELEASE_DIR}/android/CordovaApp-x86-unsigned.apk" "${RELEASE_DIR}/android/${APPLICATION_NAME}-x86.apk";

echo "";
echo "Using ${APPLICATION_NAME}.keystore to sign CordovaApp-arm-unsigned.apk.";
echo "";

# Sign arm .apk using jarsigner
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore \
"${RELEASE_DIR}/android/${APPLICATION_NAME}.keystore" "${RELEASE_DIR}/android/CordovaApp-arm-unsigned.apk" "${APPLICATION_NAME}";

# Remove previously aligned arm apk
if [ -f "${RELEASE_DIR}/android/${APPLICATION_NAME}-arm.apk" ]; then
  rm -rf "${RELEASE_DIR}/android/${APPLICATION_NAME}-arm.apk";
fi

# Align arm .apk using zipalign
zipalign -v 4 "${RELEASE_DIR}/android/CordovaApp-arm-unsigned.apk" "${RELEASE_DIR}/android/${APPLICATION_NAME}-arm.apk";
