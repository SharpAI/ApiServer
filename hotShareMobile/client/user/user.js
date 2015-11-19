
Template.searchMyPosts.helpers({
  items: function () {
    var postsSearchData = PostsSearch.getData({
      transform: function(matchText, regExp) {
        return matchText
      },
      sort: {createdAt: -1}
    });
    if (PostsSearch.getStatus().loaded == true) {
      Session.set("searchLoading", false)
      if (postsSearchData.length == 0) {
        Session.set("noSearchResult", true);
      } else {
        Session.set("noSearchResult", false);
      }
    }
    
    return postsSearchData;
  }
});
