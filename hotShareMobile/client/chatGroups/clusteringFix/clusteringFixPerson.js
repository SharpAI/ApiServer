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
  var rowHeight = Math.ceil(($('body').width() - 10) / 5);
  var rowCount = Math.floor(($('body').height() - 80) / rowHeight)
  var canFill = rowCount * 5;

  limit.set(canFill);
  var group_id = Router.current().params.gid;
  var faceId = Router.current().params.fid;
  Session.set('group_person_loaded',false);
  Session.set('group_person_loadmore','loaded');
  Meteor.subscribe('clusteringLists',group_id, faceId, limit.get(),function(){
    Session.set('group_person_loaded',true);
  });

  // scroll Loading
  // $(document).scroll(function(){
  //   if($('ul').height() - document.body.clientHeight - $(document).scrollTop() + 50 <= 0){
  //     console.log('start load more');
  //     Session.set('group_person_loadmore','loading');
  //     var limitCount = limit.get() + limitSetp;
  //     Meteor.subscribe('clusteringLists',group_id,faceId, limitCount,function(){
  //       Session.set('group_person_loadmore','loaded');
  //       limit.set(limitCount);
  //     });
  //   }
  // });

  initLazyload();
});

Template.clusteringFixPerson.helpers({
  lists: function(){
    var group_id = Router.current().params.gid;
    var faceId = Router.current().params.fid;
    return Clustering.find({group_id: group_id, faceId: faceId, marked: {$ne: true}},{limit: limit.get()}).fetch();
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
    var ids = selectedLists.get() || [];
    var marked_ids = [];
    PUB.showWaitLoading('处理中');

    $('.clusteringItem').not('.selected').each(function(item){
      marked_ids.push($(this).attr('id'))
    });
    console.log(marked_ids);

    Meteor.call('clusteringFixPersons',ids, marked_ids,function(error, result){
      PUB.hideWaitLoading();
      if(error){
        console.log(error);
        return PUB.toast('请重试！');
      }
      selectedLists.set([]);
      return PUB.toast(result);
    });
  }
});


Template.clusteringFixPerson.onDestroyed(function(){
  if(clusteringLazyloadInterval){
    window.clearInterval(clusteringLazyloadInterval);
  }
});