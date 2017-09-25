var limit = new ReactiveVar(0);
var selectedLists = new ReactiveVar([]);
var limitSetp = 10

Template.clusteringFixPerson.onRendered(function() {
  limit.set(30);
  var group_id = Router.current().params.gid;
  var faceId = Router.current().params.fid;
  Meteor.subscribe('group_person',group_id, limit.get(),{
    onReady: function(){
      Session.set('group_person_loaded',true);
    },
    onStop: function(err){
      console.log(err);
    }
  });
});

Template.clusteringFixPerson.helpers({
  lists: function(){
    var group_id = Router.current().params.gid;
    var faceId = Router.current().params.fid;
    return Person.find({group_id: group_id},{limit: limit.get(), sort:{createAt: -1}}).fetch();
  },
  selectedListsCount: function(){
    var lists = selectedLists.get() || [];
    return lists.length;
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
  }
})