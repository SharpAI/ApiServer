var theCurrentDay = new ReactiveVar(null);
var theDisplayDay = new ReactiveVar(null);
var groupsData = new ReactiveVar([]);

var limit = new ReactiveVar(3);

window.companyCharts = {};
Template.companyLists.onRendered(function () {
  window.companyCharts = {};
  //Meteor.subscribe('get-my-group', Meteor.userId());

  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,  0, 0, 0, 0);

  theCurrentDay.set(date); // UTC日期
  theDisplayDay.set(displayDate); // 当前显示日期
  Session.set('companyListLoading', true);
  Meteor.subscribe('userGroupsWorkstatusLists', date, limit.get(), {
    onReady: function() {
      Session.set('companyListLoading', false)
    }
  });

  // scroll bottom to load more
  $('.content').scroll(function(){
    if( $('.content').scrollTop() + $('.content')[0].offsetHeight >=$('.content')[0].scrollHeight){
      console.log('load more');
      var _limit = limit.get() + 3;
      Meteor.subscribe('userGroupsWorkstatusLists', date,_limit, {
        onReady: function() {
          Session.set('companyListLoading', false);
          limit.set(_limit);
        }
      });
    }
  });

});

Template.companyLists.helpers({
  companies: function() {
		return SimpleChat.GroupUsers.find({user_id: Meteor.userId()},{limit: limit.get()}).fetch()
	}
});

Template.companyLists.onDestroyed(function() {
  window.companyCharts = null;
});
