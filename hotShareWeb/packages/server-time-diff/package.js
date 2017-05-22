Package.describe({
  name: 'feiwu:server-time-diff',
  version: "0.1.0"
});

Package.onUse(function (api) {
  api.addFiles('script.js', ['client', 'server']);
});
