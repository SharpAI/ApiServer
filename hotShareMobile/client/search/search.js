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
        },500);
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
        },500);
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
        },500);
      } else {
        Session.set("showSearchStatus", false);
        Session.set("searchLoading", false);
        Session.set("noSearchResult", false);
      }
    }
    return followUsersSearchData;
  },

  follows: function() {
    return Follows.find({}, {
      sort: {
        index: 1
      }
    });
  },

  isFollowed: function(follow) {
    var fcount;
    Meteor.subscribe("friendFollower", Meteor.userId(), follow.userId);
    fcount = Follower.find({
      "userId": Meteor.userId(),
      "followerId": follow.userId
    }).count();
    if (fcount > 0) {
      return true;
    } else {
      return false;
    }
  },

  isFollowedUser: function(follow) {
    var fcount;
    Meteor.subscribe("friendFollower", Meteor.userId(), follow._id);
    fcount = Follower.find({
      "userId": Meteor.userId(),
      "followerId": follow._id
    }).count();
    if (fcount > 0) {
      return true;
    } else {
      return false;
    }
  },

  isSelf: function(follow) {
    if (follow.userId === Meteor.userId()) {
      return true;
    } else {
      return false;
    }
  },

  notSelf: function(follow) {
    if (follow._id === Meteor.userId()) {
      return false;
    } else {
      return true;
    }
  },

  topic: function() {
    return Session.get('persistentTopics');
  },

  isLoading: function() {
    return FollowUsersSearch.getStatus().loading;
  }
});

Template.searchFollow.events({
  'click .topic': function(event) {
    Session.set("topicId", this._id);
    Session.set("topicTitle", "#" + this.text + "#");
    return PUB.page('/topicPosts');
  }
})
