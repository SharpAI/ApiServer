Template.series.helpers({
  postsLists: function(){
    if(Session.get('seriesContent')){
      return Session.get('seriesContent').postLists
    }
  },
  postCounts: function(){
    var seriesContent = Session.get('seriesContent')
    return (seriesContent && seriesContent.postLists)?seriesContent.postLists.length : 0
  },
  seriesTitle: function(){
    if(Session.get('seriesContent') && Session.get('seriesContent').title){
      document.title = Session.get('seriesContent').ownerName + '的合辑《' + Session.get('seriesContent').title + '》';
      return Session.get('seriesContent').title;
    } else {
      return "";
    }
  },
  mainImage: function() {
    if(Session.get('seriesContent') && Session.get('seriesContent').mainImage){
      return Session.get('seriesContent').mainImage;
    } else {
      return 'http://data.tiegushi.com/ocmainimages/mainimage5.jpg';
    }
  },
  showPublishBtn: function(){
    if(Session.get('seriesContent')){
      return !Session.get('seriesContent').publish && Template.series.__helpers.get('postCounts')()
    } else {
      return true;
    }
  }
});

Template.series.events({
  'click .back': function(e,t){
    console.log('back clicked');
  },
  'click .viewModal':function(e,t){
    Router.go('/posts/'+e.currentTarget.id);
  },
});
