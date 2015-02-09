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
Template.searchPeopleAndTopic.events({
  "keyup #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    if(text.length > 0)
       FollowUsersSearch.search(text);
  }, 200)
});
