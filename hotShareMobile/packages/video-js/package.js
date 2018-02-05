Package.describe({
  name: 'sraita:video-js',
  version: '1.0.0',
  summary: 'video-js with useful plugins',
  git: 'https://github.com/sraita/video-js',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  
  api.use(['templating', 'jquery', 'reactive-var', 'blaze-html-templates', 'session'], ['client']);

  api.addAssets([
    // icon
    'lib/font/VideoJS.eot',
    'lib/font/VideoJS.ttf',
    'lib/font/VideoJS.woff',
    'lib/font/VideoJS.svg',

    // swf
    'lib/video-js.swf'
  ],'client');

  // add lib files
  api.addFiles([
    'lib/video.min.js',
    'lib/video-js.min.css',
    'lib/lang/zh-CN.js'
  ], 'client');

  // plugins
  api.addFiles([
    // ads
    'plugins/ads/videojs.ads.css',
    'plugins/ads/videojs.ads.min.js',
    // eme
    'plugins/eme/videojs-contrib-eme.min.js',
    // hls
    'plugins/hls/videojs-contrib-hls.min.js',
    // qualityselector
    'plugins/qualityselector/videojs-qualityselector.css',
    'plugins/qualityselector/videojs-qualityselector.min.js',
    // replay
    'plugins/replay/videojs-replay.css',
    'plugins/replay/videojs-replay.min.js',
    // watermark
    'plugins/watermark/videojs-watermark.css',
    'plugins/watermark/videojs-watermark.min.js',
    // titlebar
    'plugins/titlebar/videojs-titlebar.css',
    'plugins/titlebar/videojs-titlebar.js'
  ],'client');

});