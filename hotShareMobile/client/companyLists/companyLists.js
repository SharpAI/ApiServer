var theCurrentDay = new ReactiveVar(null);
var theDisplayDay = new ReactiveVar(null);
var groupsData = new ReactiveVar([]);

Template.companyLists.onRendered(function () {
  Meteor.subscribe('get-my-group', Meteor.userId(), {
    onReady: function(){
      Session.set('companyListLoading', false)
    }
  });

  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,  0, 0, 0, 0);

  theCurrentDay.set(date); // UTC日期
  theDisplayDay.set(displayDate); // 当前显示日期

  Meteor.subscribe('userGroupsWorkstatusLists', date, {
    onReady: function() {
      Session.set('companyListLoading', false)
    }
  });
});

Template.companyLists.helpers({

})