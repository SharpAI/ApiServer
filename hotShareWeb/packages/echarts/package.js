Package.describe({
  name: 'sraita:echarts',
  version: '3.0.0',
  // Brief, one-line summary of the package.
  summary: 'Use echarts with meteor.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/iEverX/meteor-echarts',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: null
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.addFiles('echarts.min.js', 'client', {bare:true});
  api.addFiles(['map/world.js'], 'client', {bare:true});
  api.addFiles(['map/china.js'], 'client', {bare:true});
});