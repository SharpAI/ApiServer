if (process.env.DEV) {
  exports.iosTestApp = "sample-code/apps/TestApp/build/release-iphonesimulator/TestApp.app";
  exports.iosWebviewApp = "sample-code/apps/WebViewApp/build/release-iphonesimulator/WebViewApp.app";
  exports.iosUICatalogApp = "sample-code/apps/UICatalog/build/release-iphonesimulator/UICatalog.app";
  exports.androidApiDemos = "C:/Users/nosson/Desktop/android-armv7-release.apk";
  exports.selendroidTestApp = "app/android-armv7-release.apk";
} else {
  exports.iosTestApp = "http://appium.github.io/appium/assets/TestApp7.1.app.zip";
  exports.iosWebviewApp = "http://appium.github.io/appium/assets/WebViewApp7.1.app.zip";
  exports.iosUICatalogApp = "http://appium.github.io/appium/assets/UICatalog7.1.app.zip";
  exports.androidApiDemos = "C:/Users/nosson/Desktop/android-armv7-release.apk";
  exports.selendroidTestApp = "http://appium.github.io/appium/assets/selendroid-test-app-0.10.0.apk";

  exports.iosWebviewAppLocal = "http://localhost:3000/WebViewApp7.1.app.zip";
  exports.androidApiDemosLocal = "app/android-armv7-release.apk";
}
