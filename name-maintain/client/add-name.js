if (Meteor.isClient) {
  Template.body.rendered = function(){
    Meteor.call('getStatics',function(error,data){
      if (error){
        console.log('got error from call');
        return;
      }
      Session.set('statics_data',data);
      console.log("Got data " + JSON.stringify(data));
    });
  };
  Template.body.helpers({
    total_posts: function(){
      return Session.get('statics_data').total_posts;
    },
    total_users: function(){
      return Session.get('statics_data').total_users;
    },
    browser_users: function(){
      return Session.get('statics_data').browser_users;
    },
    app_users:function(){
      return Session.get('statics_data').app_users;
    },
    named_users:function(){
      return Session.get('statics_data').named_users;
    },
    total_views:function(){
      return Session.get('statics_data').total_views;
    },
    total_meets:function(){
      return Session.get('statics_data').total_meets;
    },
    comments: function () {
      return RefNames.find({}, {sort: {createdAt: -1}});
    },
    count: function () {
      return RefNames.find({}).count();
    }
  });
  Template.body.events({
  "submit .new-comment": function (event) {
    var text = event.target.text.value;
      if (RefNames.find({text:text}).count() === 0){
        RefNames.insert({
          text: text,
          createdAt: new Date()
        });
      } else {
        toastr.error('该名字已存在');
      }
    event.target.text.value = "";
    return false;
  }
  });
  Template.comment.events({
    "click .toggle-checked": function () {
      RefNames.update(this._id, {$set: {checked: ! this.checked}});
  },
  "click .delete": function () {
    if(this.checked){
      RefNames.remove(this._id);
    }
  }
  });
}
