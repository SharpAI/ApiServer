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