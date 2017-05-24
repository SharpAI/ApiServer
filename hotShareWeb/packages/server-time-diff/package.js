Package.describe({		
  name: 'feiwu:server-time-diff',		
  version: "0.1.0"		
});		
 		
Package.onUse(function (api) {		
  api.export('GetServerDate');
  api.addFiles('time-diff.js', ['client', 'server']);		
});