
Template.searchMyPosts.helpers({
  items: function () {
    var postsSearchData = PostsSearch.getData({
      transform: function(matchText, regExp) {
        return matchText
      },
      sort: {createdAt: -1}
    });
    if (postsSearchData.length == 0) {
      Session.set("noSearchResult", true);
    } else {
      Session.set("noSearchResult", false);
    }
    return postsSearchData;
  }
});
