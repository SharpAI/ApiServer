Package.describe({
  name: 'baidu:touch',
  version: '0.2.11',
  summary: 'A package for touch events',
});

Package.onUse(function(api) {
  api.addFiles('touch-0.2.11.js', 'client');
  api.export('touch', ['client']);
});