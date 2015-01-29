Template.searchFollow.events({
  "keypress #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    if(text.length >0)
      Session.set('isSearching', true);
    else
      Session.set('isSearching', false);
    FollowUsersSearch.search(text);
  }, 200),
  "focusout #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    if(text.length >0)
      Session.set('isSearching', true);
    else
      Session.set('isSearching', false);
    FollowUsersSearch.search(text);
  }, 200),
  "keydown #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    if(text.length >0)
      Session.set('isSearching', true);
    else
      Session.set('isSearching', false);
    FollowUsersSearch.search(text);
  }, 200),
  "keyup #search-box": _.throttle(function(e) {
    var text = $(e.target).val().trim();
    if(text.length >0)
      Session.set('isSearching', true);
    else
      Session.set('isSearching', false);
    FollowUsersSearch.search(text);
  }, 200)
});
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
