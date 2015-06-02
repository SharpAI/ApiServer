Package.describe({
  version: '0.0.10',
  summary: 'A package for creating apps that swipe between pages',
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use(['templating', 'coffeescript'], 'client')

  api.addFiles(['imageswipe/imageswipe.html', 'imageswipe/imageswipe.coffee', 'imageswipe/imageswipe.css'], 'client');

  api.export('ImageSwipe', ['client'])

});

// Package.onTest(function(api) {
//   api.use('tinytest');
//   api.use('ccorcos:swipe');
//   api.addFiles('ccorcos:swipe-tests.js');
// });
