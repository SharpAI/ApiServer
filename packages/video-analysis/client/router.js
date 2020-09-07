Router.route('/deepVideoAnalysis',{
  name: 'videoAnalysis'
})

Router.route('/dvaDetail/:_id', {
  name: 'dvaDetail',
  layoutTemplate: 'dvaLayout',
  yieldRegions: {
    'dvaDetailHeader': { to: 'header' },
  }
});

Router.route('/dvaImport', {
  name: 'dvaVideoImport',
  layoutTemplate: 'dvaLayout',
  yieldRegions: {
    'dvaVideoImportHeader': { to: 'header' },
  }
});