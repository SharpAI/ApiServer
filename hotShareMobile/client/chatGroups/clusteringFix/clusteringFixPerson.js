var limit = new ReactiveVar(0);
var selectedLists = new ReactiveVar([]);
var limitSetp = 50

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
Template.clusteringFixPerson.onRendered(function() {
  limit.set(50);
  var group_id = Router.current().params.gid;
  var faceId = Router.current().params.fid;
  Session.set('group_person_loaded',false);
  Session.set('group_person_loadmore','loaded');
  Meteor.subscribe('clusteringLists',group_id, faceId, limit.get(),function(){
    Session.set('group_person_loaded',true);
  });

  // scroll Loading
  $(document).scroll(function(){
    if($('ul').height() - document.body.clientHeight - $(document).scrollTop() + 50 <= 0){
      console.log('start load more');
      Session.set('group_person_loadmore','loading');
      var limitCount = limit.get() + limitSetp;
      Meteor.subscribe('clusteringLists',group_id,faceId, limitCount,function(){
        Session.set('group_person_loadmore','loaded');
        limit.set(limitCount);
      });
    }
  });

  initLazyload();
});

Template.clusteringFixPerson.helpers({
  lists: function(){
    var group_id = Router.current().params.gid;
    var faceId = Router.current().params.fid;
    return Clustering.find({group_id: group_id, faceId: faceId, isOneSelf: true},{limit: limit.get()}).fetch();
  },
  selectedListsCount: function(){
    var lists = selectedLists.get() || [];
    return lists.length;
  },
  isLoaded: function(){
    return Session.get('group_person_loaded');
  },
  isLoadingMore: function(){
    return Session.equals('group_person_loadmore','loading');
  }
});

Template.clusteringFixPerson.events({
  'click .back': function(e){
    return PUB.back();
  },
  'click .clusteringItem': function(e){
    var lists = selectedLists.get() || [];
    var _id = e.currentTarget.id
    if($(e.currentTarget).hasClass('selected')){
      lists.splice(lists.indexOf(_id),1);
    } else {
      lists.push(_id);
    }
    console.log(lists);
    selectedLists.set(lists);
    $(e.currentTarget).toggleClass('selected');
  },
  'click #clusteringDel': function(e){
    var ids = selectedLists.get();
    var count = 0;
    // PUB.showWaitLoading('处理中');
    ids.forEach(function(item){
      Clustering.update({_id: item},{
        $set:{isOneSelf: false}
      },function(error, result){
        // PUB.hideWaitLoading();
        if(error){
          console.log(error)
        } 
        ids.splice(ids.indexOf(item),1);
        count += 1;
        // PUB.toast('删除了'+ count + '张照片，还剩'+ ids.length + '张！');
        selectedLists.set(ids);
      });
    });
  }
});


Template.clusteringFixPerson.onDestroyed(function(){
  if(clusteringLazyloadInterval){
    window.clearInterval(clusteringLazyloadInterval);
  }
});