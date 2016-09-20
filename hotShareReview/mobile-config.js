App.info({
  id: 'org.hotshare.review',
  version: '0.0.1',
  name: 'hotSharereview',
  description: 'Share everything with everyone',
  author: 'hotShare Design Team',
  email: '',
  website: ''
});

App.setPreference('KeyboardDisplayRequiresUserAction', false);
App.setPreference('StatusBarOverlaysWebView', false);
App.setPreference('orientation', 'portrait');
App.setPreference('StatusBarBackgroundColor', '#000000');
App.setPreference('StatusBarStyle','blacktranslucent');
App.setPreference('AutoHideSplashScreen', false);
App.setPreference('AndroidPersistentFileLocation','Internal');
App.setPreference('iosPersistentFileLocation','Library');
App.accessRule('*');
App.accessRule('http://*');
App.accessRule('https://*');

App.icons({
  'iphone_2x': 'resource/icon_120.png',
  'iphone_3x': 'resource/icon_180.png',
  'ipad': 'resource/icon_76.png',
  'ipad_2x': 'resource/icon_152.png',
  'android_mdpi': 'resource/icon_48.png',
  'android_hdpi': 'resource/icon_96.png',
  'android_xhdpi': 'resource/icon.png'
});

App.launchScreens({
  'iphone_2x': 'resource/splash_640_960.png',
  'iphone5': 'resource/splash_640_1136.png',
  'iphone6': 'resource/splash_750_1334.png',
  'iphone6p_portrait': 'resource/splash_1242_2208.png',
  'ipad_portrait': 'resource/splash_768_1024.png',
  'ipad_portrait_2x': 'resource/splash_1536_2048.png',
  'android_mdpi_portrait': 'resource/splash.png',
  'android_hdpi_portrait': 'resource/splash.png',
  'android_xhdpi_portrait': 'resource/splash.png'
});
