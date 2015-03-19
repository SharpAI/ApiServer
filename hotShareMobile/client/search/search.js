Template.searchFollow.helpers({
  getFollowUsers: function() {
    return FollowUsersSearch.getData({
      transform: function(matchText, regExp) {
        //return matchText.replace(regExp, "<b>$&</b>")
        return matchText
      },
      sort: {createdAt: -1}
    });
  },
  
  isLoading: function() {
    return FollowUsersSearch.getStatus().loading;
  }
});
Template.searchPeopleAndTopic.helpers({
  getTopics: function() {
    return TopicsSearch.getData({
      transform: function(matchText, regExp) {
        //return matchText.replace(regExp, "<b>$&</b>")
        return matchText
      },
      sort: {createdAt: -1}
    });
  },

  getFollowUsers: function() {
    return FollowUsersSearch.getData({
      transform: function(matchText, regExp) {
        //return matchText.replace(regExp, "<b>$&</b>")
        return matchText
      },
      sort: {createdAt: -1}
    });
  },

  isLoading: function() {
    return FollowUsersSearch.getStatus().loading;
  }
});
