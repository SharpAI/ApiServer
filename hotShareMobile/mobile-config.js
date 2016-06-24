App.info({
  id: 'org.hotshare.everywhere',
  version: '1.1.38',
  name: 'hotShare',
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
  'iphone': 'resource/icon_57.png',
  'iphone_2x': 'resource/icon_120.png',
  'iphone_3x': 'resource/icon_180.png',
  'ipad': 'resource/icon_76.png',
  'ipad_2x': 'resource/icon_152.png',
  'android_ldpi': 'resource/icon_36.png',
  'android_mdpi': 'resource/icon_48.png',
  'android_hdpi': 'resource/icon_96.png',
  'android_xhdpi': 'resource/icon.png'
});

App.launchScreens({
  'iphone': 'resource/splash_768_1024.png',
  'iphone_2x': 'resource/splash_640_960.png',
  'iphone5': 'resource/splash_640_1136.png',
  'iphone6': 'resource/splash_750_1334.png',
  'iphone6p_portrait': 'resource/splash_1242_2208.png',
  'ipad_portrait': 'resource/splash_768_1024.png',
  'ipad_portrait_2x': 'resource/splash_1536_2048.png',
  'android_ldpi_portrait': 'resource/splash.png',
  'android_mdpi_portrait': 'resource/splash.png',
  'android_hdpi_portrait': 'resource/splash.png',
  'android_xhdpi_portrait': 'resource/splash.png'
});

App.configurePlugin('nl.x-services.plugins.socialsharing', {
    APP_ID: 'wxcfcf19c225a36351'
});

App.configurePlugin('com.leon.cordova.wechat', {
    APP_ID: 'wxcfcf19c225a36351',
    QQ_APP_ID: '1104127289'
});
App.configurePlugin('com.share.wechatShare', {
    APP_ID: 'wxcfcf19c225a36351',
});

App.configurePlugin('org.zy.yuancheng.qq', {
    QQ_APP_ID: '1104127289'
});

App.configurePlugin('org.hotshare.baidutts', {
  API_KEY: 'iepMQqCsCil8uvGT2fPIP8lGMQDObIVi',
  API_SECRET: 'BlTv4N92QQb9F28vGXLkODdc3sOsXoUl',
  APP_ID: '6092105'
});

/* *********storeboard app config********** */
/*
App.info({
  id: 'org.hotshare.storeboard',
  version: '0.0.3',
  name: 'Storeboard',
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
  'iphone': 'resource/iconEN1_57.png',
  'iphone_2x': 'resource/iconEN1_120.png',
  'iphone_3x': 'resource/iconEN1_180.png',
  'ipad': 'resource/iconEN1_76.png',
  'ipad_2x': 'resource/iconEN1_152.png',
  'android_ldpi': 'resource/iconEN1_36.png',
  'android_mdpi': 'resource/iconEN1_48.png',
  'android_hdpi': 'resource/iconEN1_96.png',
  'android_xhdpi': 'resource/iconEN1.png'
});

 App.launchScreens({
   'iphone': 'resource/splashEN1_768_1024.png',
   'iphone_2x': 'resource/splashEN1_640_960.png',
   'iphone5': 'resource/splashEN1_640_1136.png',
   'iphone6': 'resource/splashEN1_750_1334.png',
   'iphone6p_portrait': 'resource/splashEN1_1242_2208.png',
   'ipad_portrait': 'resource/splashEN1_768_1024.png',
   'ipad_portrait_2x': 'resource/splashEN1_1536_2048.png',
   'android_ldpi_portrait': 'resource/splashEN1.png',
   'android_mdpi_portrait': 'resource/splashEN1.png',
   'android_hdpi_portrait': 'resource/splashEN1.png',
   'android_xhdpi_portrait': 'resource/splashEN1.png'
 });

App.configurePlugin('nl.x-services.plugins.socialsharing', {
    APP_ID: 'wxcfcf19c225a36351'
});

App.configurePlugin('com.leon.cordova.wechat', {
    APP_ID: 'wxcfcf19c225a36351',
    QQ_APP_ID: '1104127289'
});
App.configurePlugin('com.share.wechatShare', {
    APP_ID: 'wxcfcf19c225a36351',
});

App.configurePlugin('org.zy.yuancheng.qq', {
    QQ_APP_ID: '1104127289'
});

App.configurePlugin('org.hotshare.baidutts', {
  API_KEY: 'iepMQqCsCil8uvGT2fPIP8lGMQDObIVi',
  API_SECRET: 'BlTv4N92QQb9F28vGXLkODdc3sOsXoUl',
  APP_ID: '6092105'
});
*/