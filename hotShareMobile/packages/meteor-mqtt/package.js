Package.describe({
  name: 'mkarliner:mqtt',
  version: '0.2.0',
  summary: 'Connect Meteor to MQTT message broker',
  git: 'http://www.github.com/mkarliner/meteor-mqtt',
  documentation: 'README.md'
});

Npm.depends({
	"mqtt": "2.9.0"
})

Package.onUse(function(api) {
  api.export("mqtt", "server");
  api.versionsFrom('1.0.3.1');
  api.addFiles('server.js', ["server"]);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('mkarliner:mqtt');
  api.addFiles('mqtt-tests.js');
});
