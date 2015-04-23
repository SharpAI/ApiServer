if (Meteor.isClient) {
  Session.set('statics_data',{
    total_posts:0,
    total_users:0,
    browser_users:0,
    app_users:0,
    named_users:0,
    total_views:0,
    total_meets:0,
    total_comments:0,
    total_saved_draft:0,
    suggest_read:0,
    friends_request:0
  });
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
    total_comments:function(){
      return Session.get('statics_data').total_comments;
    },
    total_saved_draft:function(){
      return Session.get('statics_data').total_saved_draft;
    },
    friends_request:function(){
      return Session.get('statics_data').friends_request;
    },
    suggest_read:function(){
      return Session.get('statics_data').suggest_read;
    },
    comments: function () {
      return RefNames.find({}, {sort: {createdAt: -1}});
    },
    changeName: function(){
      return Session.get('changeName');
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
    },
    "click #changeName": function(event){
      if(Session.get('changeName')){
        Session.set('changeName',false)
      } else {
        Session.set('changeName',true)
      }
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
