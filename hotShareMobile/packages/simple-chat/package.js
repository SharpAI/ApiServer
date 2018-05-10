Package.describe({
  name: 'feiwu:simple-chat',
  version: "0.1.0"
});

Package.onUse(function (api) {
  api.export('SimpleChat');
  api.use(['mongo', 'accounts-base', 'iron:router', 'less','momentjs:moment']);
  api.use(['templating', 'jquery', 'reactive-var', 'blaze-html-templates', 'session'], ['client']);

  // lib
  api.addAssets([
    // 'client/lib/crypto1/crypto/crypto.js',
    // 'client/lib/crypto1/hmac/hmac.js',
    // 'client/lib/crypto1/sha1/sha1.js',
    // 'client/lib/base64.js',
    // 'client/lib/plupload-2.1.2/js/plupload.full.min.js',
    'client/upload.js'
  ], 'client');
  api.addAssets([
    'client/lib/plupload-2.1.2/js/Moxie.swf',
    'client/lib/plupload-2.1.2/js/Moxie.xap'
  ], 'client');

  api.addFiles(['simple-chat.js', 'lib/collections.js', 'lib/config.js'], ['client', 'server']);
  api.addFiles(['server/subs.js', 'server/method.js'], 'server');
  api.addAssets([
    'images/image.png', 'images/back.png', 'images/account.png', 'images/sendingBmp.gif','images/groupsProfile.png','images/tips.jpg','images/nlp_tips1.jpg','images/nlp_tips2.jpg'
  ], 'client');
  api.addFiles([
    'client/upload.config.js', 'client/get_diff_time.js', 'client/to-chat/index.html', 'client/to-chat/label.html', 'client/app.less',
    'client/label/device.html', 'client/label/device.js', 'client/label/remove.html', 'client/label/remove.js', 'client/label/label.html', 'client/label/label.js', 'client/label/cropImage.html', 'client/label/cropImage.js',
    'client/nlp_label/chatItemUrl.html', 'client/nlp_label/chatItemUrl.js','client/nlp_label/chatItemUrl.less', 'client/nlp_label/nlp_device.html', 'client/nlp_label/nlp_device.js', 'client/nlp_label/nlp_label.html', 'client/nlp_label/nlp_label.js', 'client/nlp_label/nlp_remove.html', 'client/nlp_label/nlp_remove.js','client/nlp_label/nlp_error.html', 'client/nlp_label/nlp_error.js',
    'client/router.js',
    'client/tips/tips.html','client/tips/tips.js','client/tips/tips.less',
    'client/oneself_msg/oneself_msg.html','client/oneself_msg/oneself_msg.js',
    'client/to-chat/tools_bar.html', 'client/to-chat/tools_bar.js'
  ], 'client');
});
