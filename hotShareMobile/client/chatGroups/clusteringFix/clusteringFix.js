var limit = new ReactiveVar(0);
var limitSetp = 10

window.clusteringLazyloadInterval = null;
var initLazyload = function(){
  if(clusteringLazyloadInterval){
    window.clearInterval(clusteringLazyloadInterval);
  }
  window.setInterval(function(){
    $('ul').find('img.lazy:not([src])').lazyload({
      container: $('ul')
    });
  },600);
}
Template.clusteringFix.onRendered(function() {
  limit.set(20);
  var group_id = Router.current().params._id;
  Session.set('group_person_loaded',false);
  Session.set('group_person_loadmore','loaded');
  Meteor.subscribe('group_person',group_id, limit.get(),function(){
      Session.set('group_person_loaded',true);
  });

  // scroll Loading
  $(document).scroll(function(){
    if($('ul').height() - document.body.clientHeight - $(document).scrollTop() + 50 <= 0){
      console.log('start load more');
      Session.set('group_person_loadmore','loading');
      var limitCount = limit.get() + limitSetp;
      Meteor.subscribe('group_person',group_id, limitCount,function(){
        Session.set('group_person_loadmore','loaded');
        limit.set(limitCount);
      });
    }
  });
  initLazyload();
});

Template.clusteringFix.helpers({
  lists: function(){
    var group_id = Router.current().params._id;
    return Person.find({group_id: group_id},{limit: limit.get(), sort:{createAt: -1}}).fetch();
  },
  isLoaded: function(){
    return Session.get('group_person_loaded');
  },
  isLoadingMore: function(){
    return Session.equals('group_person_loadmore','loading');
  }
});

Template.clusteringFix.events({
  'click .back': function(e){
    return PUB.back();
  },
  'click .personListItem': function(e){
    var faceId = e.currentTarget.id;
    var group_id = Router.current().params._id;
    return PUB.page('/clusteringFixPerson/'+group_id+'/'+faceId);
  }
});

Template.clusteringFix.onDestroyed(function(){
  if(clusteringLazyloadInterval){
    window.clearInterval(clusteringLazyloadInterval);
  }
});