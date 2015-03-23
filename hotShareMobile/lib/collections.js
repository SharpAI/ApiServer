Posts = new Meteor.Collection('posts');
FollowPosts = new Meteor.Collection('followposts');
Feeds = new Meteor.Collection('feeds');
Drafts = new Meteor.Collection(null);
SavedDrafts = new Meteor.Collection('saveddrafts');
Follows = new Meteor.Collection('follows');
Follower = new Meteor.Collection('follower');
Topics = new Meteor.Collection('topics');
TopicPosts = new Meteor.Collection('topicposs');
Comment = new Meteor.Collection('comment');
Viewers = new Meteor.Collection('viewers');
RefComments = new Meteor.Collection("refcomments");
ReComment = new Meteor.Collection('recomment');
Reports = new Meteor.Collection('reports');

if(Meteor.isServer){
  Rnd = 0;
  Meteor.publish("refcomments", function() {
        Max = RefComments.find().count()-8;
        Rnd = Rnd + 1;
        if(Rnd>Max) Rnd = 0;
        return RefComments.find({},{fields: {text:1},skip:Rnd,limit:8});
  });
  Meteor.publish("topicposts", function() {
        return TopicPosts.find({});
  });
  Meteor.publish("topics", function() {
        return Topics.find({});
  });
  Meteor.publish("posts", function() {
        return Posts.find({owner: this.userId});
  });
  Meteor.publish("followposts", function(limit) {
        return FollowPosts.find({followby: this.userId}, {sort: {createdAt: -1}, limit:limit});
  });
  Meteor.publish("publicPosts", function(postId) {
        return Posts.find({_id: postId});
  });
  /*Meteor.publish("drafts", function() {
        return Drafts.find({owner: this.userId});
  });*/
  Meteor.publish("saveddrafts", function() {
        return SavedDrafts.find({owner: this.userId});
  });
  Meteor.publish("feeds", function(limit) {
        return Feeds.find({followby: this.userId}, {sort: {createdAt: -1}, limit:limit});
  });
  Meteor.publish("follows", function() {
        return Follows.find({}, {sort: { index: 1 }} );
  });
  Meteor.publish("follower", function() {
        return Follower.find({$or:[{userId:this.userId},{followerId:this.userId}]});
  });
  Meteor.publish("userinfo", function(id) {
        return Meteor.users.find({_id: id},{fields: {'username':1,'email':1,'profile.fullname':1,'profile.icon':1, 'profile.dec':1}});
  });
  Meteor.publish("comment", function(postId) {
        return Comment.find({postId: postId});
  });
  Meteor.publish("viewers", function(postId) {
        return Viewers.find({postId: postId});
  });
  Meteor.publish("reports", function(postId) {
        return Reports.find({postId: postId});
  });
  Reports.allow({
    insert: function (userId, doc) {
      return doc.username !== null;
    }
  });
  Posts.allow({
    insert: function (userId, doc) {
      if(doc.owner === userId){
        try{
            var follows=Follower.find({followerId:userId})
            if(follows.count()>0){
                follows.forEach(function(data){
                    FollowPosts.insert({
                        postId:doc._id,
                        title:doc.title,
                        addontitle:doc.addontitle,
                        mainImage: doc.mainImage,
                        mainImageStyle:doc.mainImageStyle,
                        heart:0,
                        retweet:0,
                        comment:0,
                        browse:0,
                        owner:doc.owner,
                        ownerName:doc.ownerName,
                        ownerIcon:doc.ownerIcon,
                        createdAt: doc.createdAt,
                        followby: data.userId
                    });

                    Feeds.insert({
                        owner:doc.owner,
                        ownerName:doc.ownerName,
                        ownerIcon:doc.ownerIcon,
                        eventType:'SelfPosted',
                        postId:doc._id,
                        postTitle:doc.title,
                        mainImage:doc.mainImage,
                        createdAt:doc.createdAt,
                        heart:0,
                        retweet:0,
                        comment:0,
                        followby: data.userId
                    });
                    pushnotification("newpost",doc,data.userId);
                    waitReadCount = Meteor.users.findOne({_id:data.userId}).profile.waitReadCount;
                    if(waitReadCount === undefined || isNaN(waitReadCount))
                    {
                        waitReadCount = 0;
                    }
                    Meteor.users.update({_id: data.userId}, {$set: {'profile.waitReadCount': waitReadCount+1}});
                });
            }
            FollowPosts.insert({
                postId:doc._id,
                title:doc.title,
                addontitle:doc.addontitle,
                mainImage: doc.mainImage,
                mainImageStyle:doc.mainImageStyle,
                heart:0,
                retweet:0,
                comment:0,
                browse:0,
                owner:doc.owner,
                ownerName:doc.ownerName,
                ownerIcon:doc.ownerIcon,
                createdAt: doc.createdAt,
                followby: userId
            });
        }
        catch(error){}

        return true;
      }
      return false;
    },
      remove: function (userId, doc) {
          if(doc.owner === userId){
              try{
                  FollowPosts.remove({
                      postId:doc._id
                  });
              }
              catch(error){}
              Feeds.remove({
                  owner:userId,
                  eventType:'SelfPosted',
                  postId:doc._id
              });
              return true;
          }
          return false;
      },
    update: function(userId, doc, fieldNames, modifier) {
      if (fieldNames.toString() === 'heart' || fieldNames.toString() === 'retweet' && modifier.$set !== void 0) {
        return true;
      }
      if (fieldNames.toString() === 'browse' && modifier.$set !== void 0) {
          pushnotification("read",doc,userId);
      /*
        try{
            var followPosts=FollowPosts.find({postId:doc._id});
            followPosts.forEach(function(data){
                FollowPosts.update(
                    {postId:doc._id, followby:data.followby},
                    {$set:{
                        browse:modifier.$set.browse
                      }
                    }
                );
            });
        }
        catch(error){}
      */
        return true;
      }

      if(doc.owner === userId){
        try{
            var follows=Follower.find({followerId:userId})
            if(follows.count()>0){
                follows.forEach(function(data){
                    FollowPosts.update(
                        {postId:doc._id, followby:data.userId},
                        {$set:{
                            title:modifier.$set.title,
                            addontitle:modifier.$set.addontitle,
                            mainImage: modifier.$set.mainImage,
                            mainImageStyle:modifier.$set.mainImageStyle,
                          }
                        }
                    );
                });
            }
            FollowPosts.update(
                {postId:doc._id, followby:userId},
                {$set:{
                    title:modifier.$set.title,
                    addontitle:modifier.$set.addontitle,
                    mainImage: modifier.$set.mainImage,
                    mainImageStyle:modifier.$set.mainImageStyle,
                  }
                }
            );
        }
        catch(error){}
        return true;
      }
      return false;
    }
  });
  TopicPosts.allow({
    insert: function (userId, doc) {
      if(doc.owner === userId)
      {
        try{
          Topics.update({_id: doc.topicId},{$inc: {posts: 1}});
        }
        catch(error){}
      }
      return doc.owner === userId;
    }
  });
  Topics.allow({
    insert: function (userId, doc) {
      return doc.text !== null && doc.type === "topic";
    }
  });
  Drafts.allow({
    insert: function (userId, doc) {
      return doc.owner === userId;
    },
    remove: function (userId, doc) {
      return doc.owner === userId;
    },
    update: function (userId, doc) {
      return doc.owner === userId;
    }
  });
  FollowPosts.allow({
    update: function (userId, doc, fieldNames, modifier) {
      if (fieldNames.toString() === 'browse' || fieldNames.toString() === 'heart' || fieldNames.toString() === 'retweet' || fieldNames.toString() === 'comment' && modifier.$inc !== void 0) {
        return true;
      }
      if(doc.owner === userId){
        return true
      }
      return false;
    }
  });
  SavedDrafts.allow({
    insert: function (userId, doc) {
      return doc.owner === userId;
    },
    remove: function (userId, doc) {
      return doc.owner === userId;
    },
    update: function (userId, doc) {
      return doc.owner === userId;
    }
  });
  Follower.allow({
    insert: function (userId, doc) {
      if(doc.userId === userId){
        try{
            var posts=Posts.find({owner: doc.followerId})
            if(posts.count()>0){
                posts.forEach(function(data){
                    FollowPosts.insert({
                        postId:data._id,
                        title:data.title,
                        addontitle:data.addontitle,
                        mainImage: data.mainImage,
                        mainImageStyle:data.mainImageStyle,
                        owner:data.owner,
                        ownerName:data.ownerName,
                        ownerIcon:data.ownerIcon,
                        createdAt: data.createdAt,
                        followby: userId
                    });
                });
            }
          }
          catch(error){};
        return true;
      }
      return false;
    },
    remove: function (userId, doc) {
      if(doc.userId === userId){
        try{
          FollowPosts.remove({owner:doc.followerId,followby:userId});
        }
        catch(error){};
        return true;
      }
      return false;
    },
    update: function (userId, doc) {
      return doc.userId === userId;
    }
  });
  Viewers.allow({
    insert: function (userId, doc) {
      if(doc.username==null)
        return false;
      return doc.username !== null;
    },
    remove: function (userId, doc) {
      return doc.userId === userId;
    },
    update: function (userId, doc) {
      return doc.userId === userId;
    }
  });
  Comment.allow({
    insert: function (userId, doc) {
      if(doc.username==null)
          return false;
      try{
        post = Posts.findOne({_id: doc.postId});
        commentsCount = post.commentsCount;
        if(commentsCount === undefined || isNaN(commentsCount))
        {
            commentsCount = 0;
        }
        commentsCount=commentsCount+1;
        Posts.update({_id: doc.postId}, {$set: {'commentsCount': commentsCount}});
        if(post.owner != userId)
        {
          if(ReComment.find({"postId":doc.postId,"commentUserId":userId}).count() === 0){
              ReComment.insert({
                  postId: doc.postId,
                  commentUserId: userId
              });
          }
          Feeds.insert({
              owner:userId,
              ownerName:doc.username,
              ownerIcon:doc.userIcon,
              eventType:'comment',
              postId:doc.postId,
              postTitle:post.title,
              mainImage:post.mainImage,
              createdAt:doc.createdAt,
              heart:0,
              retweet:0,
              comment:0,
              followby: post.owner
          });
          waitReadCount = Meteor.users.findOne({_id:post.owner}).profile.waitReadCount;
          if(waitReadCount === undefined || isNaN(waitReadCount))
          {
              waitReadCount = 0;
          }
          Meteor.users.update({_id: post.owner}, {$set: {'profile.waitReadCount': waitReadCount+1}});
          pushnotification("comment",doc,userId);
          recomments = ReComment.find({"postId": doc.postId}).fetch();
          for(item in recomments)
          {
              if(recomments[item].commentUserId!=undefined && recomments[item].commentUserId != userId && recomments[item].commentUserId != post.owner)
              {
                  Feeds.insert({
                      owner:userId,
                      ownerName:doc.username,
                      ownerIcon:doc.userIcon,
                      eventType:'recomment',
                      postId:doc.postId,
                      postTitle:post.title,
                      mainImage:post.mainImage,
                      createdAt:doc.createdAt,
                      heart:0,
                      retweet:0,
                      comment:0,
                      followby: recomments[item].commentUserId
                  });
                  waitReadCount = Meteor.users.findOne({_id:recomments[item].commentUserId}).profile.waitReadCount;
                  if(waitReadCount === undefined || isNaN(waitReadCount))
                  {
                      waitReadCount = 0;
                  }
                  Meteor.users.update({_id: recomments[item].commentUserId}, {$set: {'profile.waitReadCount': waitReadCount+1}});
                  pushnotification("recomment",doc,recomments[item].commentUserId);
              }
          }
        }
      }
      catch(error){}
      return doc.username !== null;
    },
    remove: function (userId, doc) {
      if(doc.userId != userId)
          return false;
      post = Posts.findOne({_id: doc.postId});
      commentsCount = post.commentsCount;
      if(commentsCount === undefined || isNaN(commentsCount))
      {
          commentsCount = 1;
      }
      commentsCount=commentsCount-1;
      Posts.update({_id: doc.postId}, {$set: {'commentsCount': commentsCount}});
      return doc.userId === userId;
    },
    update: function (userId, doc) {
      return doc.userId === userId;
    }
  });
  Meteor.users.allow({
    update: function (userId, doc, fieldNames, modifier) {
      if (doc._id === userId)
        return true;
      return false;
    }
  });

  SearchSource.defineSource('topics', function(searchText, options) {
    var options = {sort: {createdAt: -1}, limit: 20};

    if(searchText) {
      var regExp = buildRegExp(searchText);
      var selector = {'text': regExp};
      return Topics.find(selector, options).fetch();
    } else {
      return [];
      //return Topics.find({}, options).fetch();
    }
  });

  SearchSource.defineSource('followusers', function(searchText, options) {
    var options = {sort: {createdAt: -1}, limit: 20};

    if(searchText) {
      var regExp = buildRegExp(searchText);
      var selector = {$or: [
        {'username': regExp},
        {'profile.fullname': regExp}
      ]};
      return Meteor.users.find(selector, options).fetch();
    } else {
      return [];
      //return Meteor.users.find({}, options).fetch();
    }
  });

  function buildRegExp(searchText) {
    // this is a dumb implementation
    var parts = searchText.trim().split(/[ \-\:]+/);
    return new RegExp("(" + parts.join('|') + ")", "ig");
  }
}

if(Meteor.isClient){
  Deps.autorun(function() {
    if (Meteor.user()) {
      Meteor.subscribe("refcomments");
      Meteor.subscribe("topicposts");
      Meteor.subscribe("topics");
      Meteor.subscribe("posts");
      /*Meteor.subscribe("drafts");*/
      Meteor.subscribe("saveddrafts");
      Meteor.subscribe("follows");
      Meteor.subscribe("follower");
      var options = {
        keepHistory: 1000 * 60 * 5,
        localSearch: true
      };
      var fields = ['username', 'profile.fullname'];
      FollowUsersSearch = new SearchSource('followusers', fields, options);
      var topicsfields = ['text'];
      TopicsSearch = new SearchSource('topics', topicsfields, options);
    }
  });
  Tracker.autorun(function () {
    if(Session.get("postContent")){
      Meteor.subscribe("comment",Session.get("postContent")._id);
      Meteor.subscribe("viewers",Session.get("postContent")._id);
    }
  });
  var FOLLOWPOSTS_ITEMS_INCREMENT = 10;
  Session.setDefault('followpostsitemsLimit', FOLLOWPOSTS_ITEMS_INCREMENT);
  Deps.autorun(function() {
    if (Meteor.user()) {
      Meteor.subscribe('followposts', Session.get('followpostsitemsLimit'));
    }
  });
  var FEEDS_ITEMS_INCREMENT = 20;
  Session.setDefault('feedsitemsLimit', FEEDS_ITEMS_INCREMENT);
  Deps.autorun(function() {
    if (Meteor.user()) {
      Meteor.subscribe('feeds', Session.get('feedsitemsLimit'));
    }
  });
}
