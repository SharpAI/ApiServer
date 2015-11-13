
Template.searchMyPosts.helpers({
  items: function () {
    return PostsSearch.getData({
      transform: function(matchText, regExp) {
        return matchText
      },
      sort: {createdAt: -1}
    });
  }
});
