
Template.searchMyPosts.helpers({
  items: function () {
    var postsSearchData = PostsSearch.getData({
      transform: function(matchText, regExp) {
        return matchText
      },
      sort: {createdAt: -1}
    });
    if (PostsSearch.getStatus().loaded == true) {
      if (postsSearchData.length == 0) {
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
    return postsSearchData;
  }
});
