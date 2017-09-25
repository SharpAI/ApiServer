var limit = new ReactiveVar(0);
var limitSetp = 10

Template.clusteringFix.onRendered(function() {
  limit.set(30);
  var group_id = Router.current().params._id;
  Meteor.subscribe('group_person',group_id, limit.get(),{
    onReady: function(){
      Session.set('group_person_loaded',true);
    },
    onStop: function(err){
      console.log(err);
    }
  });
});

Template.clusteringFix.helpers({
  lists: function(){
    var group_id = Router.current().params._id;
    return Person.find({group_id: group_id},{limit: limit.get(), sort:{createAt: -1}}).fetch();
  }
});

Template.clusteringFix.events({
  'click .back': function(e){
    return PUB.back();
  }
  'click .personListItem': function(e){
    var faceId = e.currentTarget.id;
    var group_id = Router.current().params._id;
    return PUB.page('/clusteringFixPerson/'+group_id+'/'+faceId);
  }
})