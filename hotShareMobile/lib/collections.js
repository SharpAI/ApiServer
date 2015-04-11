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
Messages = new Meteor.Collection('messages');
MsgSession = new Meteor.Collection('msgsession');
MsgGroup = new Meteor.Collection('msggroup');
Meets = new Meteor.Collection('meets');

if(Meteor.isServer){
  Rnd = 0;
  Meteor.publish('meetscountwithlimit', function(limit) {
     return Meets.find({me:this.userId},{sort:{count:-1},limit:limit});
  });
  Meteor.publish('meetscount', function() {
     return Meets.find({me:this.userId});
  });
  Meteor.publish('waitreadcount', function() {
        return Meteor.users.find(
            { _id : this.userId },
            { field: {'profile.waitReadCount':1}}
        );
  });
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
  Meteor.publish("userFeeds", function(followId,postId) {
        return Feeds.find({followby: followId,postId: postId,eventType:'recommand',recommanderId:this.userId}, {sort: {createdAt: -1}, limit:2});
  });
  Meteor.publish("follows", function() {
        return Follows.find({}, {sort: { index: 1 }} );
  });
  Meteor.publish("follower", function() {
        return Follower.find({$or:[{userId:this.userId},{followerId:this.userId}]});
  });
  Meteor.publish("userinfo", function(id) {
        userinfo = Meteor.users.find({_id: id},{fields: {'username':1,'email':1,'profile.fullname':1,'profile.icon':1, 'profile.desc':1, 'profile.location':1}});
        return userinfo;
  });
  Meteor.publish("comment", function(postId) {
        return Comment.find({postId: postId});
  });
  Meteor.publish("userViewers", function(postId,userId) {
        return Viewers.find({postId: postId,userId: userId}, {sort: {createdAt: -1}, limit:2});
  });
  Meteor.publish("recentPostsViewByUser", function(userId) {
        return Viewers.find({userId: userId}, {sort: {createdAt: -1}, limit:3});
  });
  Meteor.publish("viewers", function(postId) {
        return Viewers.find({postId: postId}, {sort: {createdAt: -1}});
  });
  Meteor.publish("reports", function(postId) {
        return Reports.find({postId: postId});
  });
  Meteor.publish("messages", function(to){
        var filter = {};
        to = to || {};
        
        switch(to.type){
          case "user":
            filter = {
              $or: [
                // 我发给ta的
                {userId: this.userId, toUserId: to.id}, 
                // ta发给我的
                {userId: to.id, toUserId: this.userId}
              ]
            };
            break;
          case "group":
            var group = MsgGroup.findOne(to.id);
            filter = {
              $or: [
                // 我发的群消息
                {userId: this.userId, toGroupId: group._id}, 
                // 给我的群消息
                {'toUsers.userId': this.userId, toGroupId: group._id}
              ]
            };
            break;
          case "session":
            var session = MsgSession.findOne(to.id);
            if(session.sesType === 'singleChat'){
              filter = {
                $or: [
                  // 我发给ta的
                  {userId: this.userId, toUserId: session.toUserId}, 
                  // ta发给我的
                  {userId: session.toUserId, toUserId: this.userId}
                ]
              };
            }else{
              filter = {
                $or: [
                  // 我发的群消息
                  {userId: this.userId, toGroupId: session.toGroupId}, 
                  // 给我的群消息
                  {'toUsers.userId': this.userId, toGroupId: session.toGroupId}
                ]
              };
            }
            break;
          default:
            return [];
        }
    
        return Messages.find(filter, {sort: {createTime: 1}});
  });
  Meteor.publish("msgSession", function(){
        return MsgSession.find({userId: this.userId}, {sort: {updateTime: -1}});
  });
  Meteor.publish("msgGroup", function(){
        return MsgGroup.find({"users.userId": this.userId});
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
                  Feeds.remove({
                      owner:userId,
                      eventType:'SelfPosted',
                      postId:doc._id
                  });
                  var TPs=TopicPosts.find({postId:doc._id})
                  if(TPs.count()>0){
                      TPs.forEach(function(data){
                          PostsCount = Topics.findOne({_id:data.topicId}).posts;
                          if(PostsCount === 1)
                          {
                              Topics.remove({_id:data.topicId});
                          }
                          else if(PostsCount > 1)
                          {
                              Topics.update({_id: data.topicId}, {$set: {'posts': PostsCount-1}});
                          }
                      });
                  }
                  TopicPosts.remove({
                      postId:doc._id
                  });
              }
              catch(error){}
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
                            mainImageStyle:modifier.$set.mainImageStyle
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
                    mainImageStyle:modifier.$set.mainImageStyle
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
      if(Follower.findOne({userId:doc.userId,followerId:doc.followerId}))
      {
        return false;
      }
      if(doc.userId === userId || doc.followerId === userId){
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
                        followby: doc.userId
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
  Feeds.allow({
    insert: function (userId, doc) {
      userData = Meteor.users.findOne({_id:userId})
      userName = userData.username;
      if(userData.profile.fullname !== null && userData.profile.fullname !== '')
        userName = userData.profile.fullname;
      if(doc.eventType==='recommand')
      {
        if(Feeds.findOne({recommanderId:userId,recommander:userName,postId:doc.postId,followby:doc.followby}))
        {
          return false;
        }
        if(userName !== doc.recommander)
        {
          return false;
        }
        if(doc.postId !== null && doc.followby !== null && doc.recommander !== null)
          pushnotification("recommand",doc,doc.followby);
        return (doc.postId !== null && doc.followby !== null && doc.recommander !== null)
      }else{  /*eventType === 'sendrequest' || eventType === 'getrequest'*/
        if(doc. requesterId !== userId)
          return false;
        if(Feeds.findOne({requesteeId:doc.requesteeId,requesterId:doc.requesterId,followby:doc.followby}))
        {
          return false;
        }
        return true;
      }
    }
  });
  Viewers.allow({
    insert: function (userId, doc) {
      if(doc.username==null)
        return false;
      if( Viewers.findOne({postId:doc.postId,userId:doc.userId}))
        return false;
      if(doc.username !== null) {
        try{
          var views=Viewers.find({postId:doc.postId});
          if(views.count()>0){
            views.forEach(function(data){
              var meetItemOne = Meets.findOne({me:doc.userId,ta:data.userId});
              if(meetItemOne){
                var meetCount = meetItemOne.count;
                if(meetCount === undefined || isNaN(meetCount))
                  meetCount = 0;
                Meets.update({me:doc.userId,ta:data.userId},{$set:{count:meetCount+1}});
              }else{
                Meets.insert({
                  me:doc.userId,
                  ta:data.userId,
                  count:1
                });
              }

              var meetItemTwo = Meets.findOne({me:data.userId,ta:doc.userId});
              if(meetItemTwo){
                var meetCount = meetItemTwo.count;
                if(meetCount === undefined || isNaN(meetCount))
                  meetCount = 0;
                Meets.update({me:data.userId,ta:doc.userId},{$set:{count:meetCount+1}});
              }else{
                Meets.insert({
                  me:data.userId,
                  ta:doc.userId,
                  count:1
                });
              }

            });
          }
        }
        catch(error){}
      }
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
  Messages.allow({
    insert: function (userId, doc) {
      // 处理群消息的接收对象
      if(userId === doc.userId){
        if(doc.sesType === 'groupChat' || doc.sesType === 'chatNotify'){
          var group = MsgGroup.findOne(doc.toGroupId);
          doc.toUsers = [];
          for(var i=0;i<group.users.length;i++){
            doc.toUsers.push(
              {
                userId: group.users[i].userId,
                userName: group.users[i].userName,
                userIcon: group.users[i].userIcon
              }
            );
          }
        }
      }
      
      // 处理会话
      if(userId === doc.userId){
        var toUser = {};
        
        // 群消息或群通知
        if(doc.sesType === 'groupChat' || doc.sesType === 'chatNotify'){
          var group = MsgGroup.findOne(doc.toGroupId);
          toUser = {
            groupId: group._id,
            groupName: group.name,
            groupIcon: '/usersChat.jpg'
          };
        }else{
          var user = Meteor.users.findOne(doc.toUserId); 
          toUser = {
            userId: user._id,
            userName: user.profile.fullname || user.username,
            userIcon: user.profile.icon || '/userPicture.png'
          };
        }
        
        //sep1:我的会话
        // 群消息或群通知
        if(doc.sesType === 'groupChat' || doc.sesType === 'chatNotify'){
          MsgSession.upsert(
            {userId: userId, toGroupId: toUser.groupId},
            {
              $set: {
                userId: userId,
                userName: doc.userName,
                userIcon: doc.userIcon,
                toGroupId: toUser.groupId,
                toGroupName: toUser.groupName,
                toGroupIcon: toUser.groupIcon,
                text: doc.text || '[图片]',
                isRead: true,
                readTime: new Date(),
                waitRead: 0,
                msgType: doc.msgType,
                sesType: doc.sesType,
                updateTime: new Date()
              }
            }
          );       
        }else{
          MsgSession.upsert(
            {userId: userId, toUserId: toUser.userId},
            {
              $set: {
                userId: userId,
                userName: doc.userName,
                userIcon: doc.userIcon,
                toUserId: toUser.userId,
                toUserName: toUser.userName,
                toUserIcon: toUser.userIcon,
                text: doc.text || '[图片]',
                isRead: true,
                readTime: new Date(),
                waitRead: 0,
                msgType: doc.msgType,
                sesType: doc.sesType,
                updateTime: new Date()
              }
            }
          );
        }
        
        //sep2:ta的会话
        // 群消息或群通知
        if(doc.sesType === 'groupChat' || doc.sesType === 'chatNotify'){
          for(var i=0;i<doc.toUsers.length;i++){
            if(doc.toUsers[i].userId != userId){
              MsgSession.upsert(
                {userId: doc.toUsers[i].userId, toGroupId: toUser.groupId},
                {
                  $set: {
                    userId: doc.toUsers[i].userId,
                    userName: doc.toUsers[i].userName,
                    userIcon: doc.toUsers[i].userIcon,
                    toGroupId: toUser.groupId,
                    toGroupName: toUser.groupName,
                    toGroupIcon: toUser.groupIcon,
                    text: doc.text || '[图片]',
                    isRead: false,
                    msgType: doc.msgType,
                    sesType: doc.sesType,
                    updateTime: new Date()
                  },
                  $inc: {
                    waitRead: 1
                  }
                }
              );
            }
          }
        }else{
          MsgSession.upsert(
            {userId: doc.toUserId, toUserId: userId},
            {
              $set: {
                userId: toUser.userId,
                userName: toUser.userName,
                userIcon: toUser.userIcon,
                toUserId: userId,
                toUserName: doc.userName,
                toUserIcon: doc.userIcon,
                text: doc.text || '[图片]',
                isRead: false,
                msgType: doc.msgType,
                sesType: doc.sesType,
                updateTime: new Date()
              },
              $inc: {
                waitRead: 1
              }
            }
          );
        }
      }

      return userId === doc.userId;
    }
  });
  MsgGroup.allow({
    insert: function (userId, doc) {
      return doc.create.userId === userId;
    },
    update: function(userId, doc, fieldNames, modifier){
      // 创建者
      if(userId === doc.create.userId)
        return true;

      // 群成员
      for(var i=0;i<doc.users.length;i++){
        if(doc.users[i].userId === userId){
          return true;
        }
      }
      
      return false;
    },
    remove: function (userId, doc) {
      // 解散群
      if(userId === doc.create.userId){
        MsgSession.remove({toGroupId: doc._id});
        return true;
      }
      
      return false;
    }
  });
  MsgSession.allow({
    remove: function (userId, doc) {
      console.log(userId === doc.userId);
      return userId === doc.userId; 
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
  Tracker.autorun(function () {
    if(Session.get("postContent")){
      Meteor.subscribe("comment",Session.get("postContent")._id);
      Meteor.subscribe("viewers",Session.get("postContent")._id);
    }
  });
  if(Meteor.isClient){
      var FOLLOWPOSTS_ITEMS_INCREMENT = 10;
      var FEEDS_ITEMS_INCREMENT = 20;
      Session.setDefault('followpostsitemsLimit', FOLLOWPOSTS_ITEMS_INCREMENT);
      Session.setDefault('feedsitemsLimit', FEEDS_ITEMS_INCREMENT);
      Session.setDefault('followPostsCollection','');
      Session.setDefault('feedsCollection','');
      window.refreshMainDataSource = function(){
          Meteor.subscribe('waitreadcount');
          if(!Session.equals('followPostsCollection'),'loading'){
              Session.set('followPostsCollection','loading');
              Meteor.subscribe('followposts', Session.get('followpostsitemsLimit'),{onStop:function(error){
                    Session.set('followPostsCollection','error');
                  },onReady:function(){
                    console.log('Got followPosts collection data');
                    Session.set('followPostsCollection','loaded');
              }});
          }
          if(!Session.equals('feedsCollection'),'loading') {
              Session.set('feedsCollection', 'loading');
              Meteor.subscribe('feeds', Session.get('feedsitemsLimit'), {
                  onStop: function (error) {
                      Session.set('feedsCollection', 'error');
                  }, onReady: function () {
                      console.log('Got feeds collection data');
                      Session.set('feedsCollection', 'loaded');
                  }
              });
          }
      };
      Deps.autorun(function() {
        if (Meteor.userId()) {
            console.log('Refresh Main Data Source when logon');
            window.refreshMainDataSource();
        }
      });
      Deps.autorun(function() {
        if (Meteor.user()) {
            Meteor.setTimeout( function() {
                Meteor.subscribe("posts");
                Meteor.subscribe("saveddrafts");
                Meteor.subscribe("topicposts");
                Meteor.subscribe("topics");
                Meteor.subscribe("follows");
                Meteor.subscribe("follower");
            },3000);
            var options = {
                keepHistory: 1000 * 60 * 5,
                localSearch: true
            };
            var fields = ['username', 'profile.fullname'];
            FollowUsersSearch = new SearchSource('followusers', fields, options);
            var topicsfields = ['text'];
            TopicsSearch = new SearchSource('topics', topicsfields, options);
          
          // 消息会话、最近联系人
          Meteor.subscribe("msgSession");
          //群信息
          Meteor.subscribe("msgGroup");
        }
      });
  }
}
