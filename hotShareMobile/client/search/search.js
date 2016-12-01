Template.searchFollow.helpers({
  getFollowUsers: function() {
    var followUsersSearchData = FollowUsersSearch.getData({
      transform: function(matchText, regExp) {
        //return matchText.replace(regExp, "<b>$&</b>")
        return matchText
      },
      sort: {createdAt: -1}
    });
    if (FollowUsersSearch.getStatus().loaded == true) 
    {
      if (followUsersSearchData.length == 0) {
        Meteor.setTimeout (function(){
          Session.set("noSearchResult", true);
          Session.set("searchLoading", false);
        },2000);
      } else {
        Session.set("noSearchResult", false);
        Session.set("searchLoading", false);
      }
    }
    return followUsersSearchData;
  },
  
  isLoading: function() {
    return FollowUsersSearch.getStatus().loading;
  }
});
Template.searchPeopleAndTopic.helpers({
  getTopics: function() {
    var topicsSearchData = TopicsSearch.getData({
      transform: function(matchText, regExp) {
        //return matchText.replace(regExp, "<b>$&</b>")
        return matchText
      },
      sort: {createdAt: -1}
    });
    if (TopicsSearch.getStatus().loaded == true && Session.get('is_people') == false) {
      if (topicsSearchData.length == 0) {
        Meteor.setTimeout (function(){
          Session.set("searchLoading", false);
          Session.set("noSearchResult", true);
        },2000);
      } else {
        Session.set("showSearchStatus", false);
        Session.set("searchLoading", false);
        Session.set("noSearchResult", false);
      }
    }
    return topicsSearchData;
  },

  getFollowUsers: function() {
    var followUsersSearchData = FollowUsersSearch.getData({
      transform: function(matchText, regExp) {
        //return matchText.replace(regExp, "<b>$&</b>")
        return matchText
      },
      sort: {createdAt: -1}
    });
    if (FollowUsersSearch.getStatus().loaded == true && Session.get('is_people') == true) {
      if (followUsersSearchData.length == 0) {
        Meteor.setTimeout (function(){
          Session.set("searchLoading", false);
          Session.set("noSearchResult", true);
        },2000);
      } else {
        Session.set("showSearchStatus", false);
        Session.set("searchLoading", false);
        Session.set("noSearchResult", false);
      }
    }
    return followUsersSearchData;
  },

  isLoading: function() {
    return FollowUsersSearch.getStatus().loading;
  }
});
