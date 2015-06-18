Posts = new Meteor.Collection('posts');
FollowPosts = new Meteor.Collection('followposts');
Feeds = new Meteor.Collection('feeds');
Drafts = new Meteor.Collection(null);
TempDrafts = new Meteor.Collection(null);
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
Versions = new Meteor.Collection('versions');
Moments = new Meteor.Collection('moments');
if(Meteor.isClient){
  Newfriends = new Meteor.Collection("newfriends");
  ViewLists = new Meteor.Collection("viewlists");
  UserDetail = new Meteor.Collection("userDetail");
}
if(Meteor.isServer){
  RefNames = new Meteor.Collection("refnames");
}

if(Meteor.isServer){
    Rnd = 0;
    var newMeetsAddedForNewFriendsDeferHandle = function(self,taId,userId,id,fields){
        Meteor.defer(function(){
            // Double check the couter for defer operation(Meteor's implemetation for setTimeout(func,0))
            if(self.count >= 20){
                return;
            }
            var fcount = Follower.find({"userId":userId,"followerId":taId}).count();
            if(fcount === 0)
            {
                var taInfo = Meteor.users.findOne({_id: taId},{fields: {'username':1,'email':1,'profile.fullname':1,
                    'profile.icon':1, 'profile.desc':1, 'profile.location':1,'profile.lastLogonIP':1}});
                if (taInfo){
                    try{
                        fields.location = taInfo.profile.location;
                        var userName = taInfo.username;
                        if(taInfo.profile.fullname){
                            userName = taInfo.profile.fullname;
                        }
                        fields.displayName = userName;
                        fields.userIcon = taInfo.profile.icon;
                        try {
                            self.added("userDetail", taInfo._id, taInfo);
                        } catch (error){
                        }
                    } catch (error){
                    }
                }
                self.added("newfriends", id, fields);
                getViewLists(self,taId,3);
                self.count++;
            }
        });
    };
    var newMeetsChangedForNewFriendsDeferHandle = function(id, self,fields,userId,postId) {
        if(fields.isFriend === false)
        {
            try{
                if(self.count<20)
                {
                    var meetItem = Meets.findOne({_id:id});
                    if(meetItem.me === userId && meetItem.ta !== userId && postId === meetItem.meetOnPostId)
                    {
                        fields.me = meetItem.me;
                        fields.ta = meetItem.ta;
                        fields.count = meetItem.count;
                        fields.meetOnPostId = meetItem.meetOnPostId;
                        var taInfo = Meteor.users.findOne({_id: fields.ta},{fields: {'username':1,'email':1,
                            'profile.fullname':1,'profile.icon':1, 'profile.desc':1, 'profile.location':1,
                            'profile.lastLogonIP':1}});
                        if (taInfo){
                            try{
                                fields.location = taInfo.profile.location;
                                var userName = taInfo.username;
                                if(taInfo.profile.fullname){
                                    userName = taInfo.profile.fullname;
                                }
                                fields.displayName = userName;
                                fields.userIcon = taInfo.profile.icon;
                                self.added("userDetail",taInfo._id,taInfo);
                            } catch (error){
                            }
                        }
                        self.added("newfriends", id, fields);
                        getViewLists(self,meetItem.ta,3);
                        self.count++;
                    }
                }
            }catch(error){
            }
        }
        if(fields.meetOnPostId && postId === fields.meetOnPostId)
        {
            try{
                self.changed("newfriends", id, fields);
            }catch(error){
                if(self.count<20)
                {
                    var meetItem = Meets.findOne({_id:id});
                    if(meetItem.me === userId && meetItem.ta !== userId)
                    {
                        var fcount = Follower.find({"userId":meetItem.me,"followerId":meetItem.ta}).count();
                        if(fcount === 0)
                        {
                            fields.me = meetItem.me;
                            fields.ta = meetItem.ta;
                            fields.count = meetItem.count;
                            var taInfo = Meteor.users.findOne({_id: fields.ta},{fields: {'username':1,'email':1,
                                'profile.fullname':1,'profile.icon':1, 'profile.desc':1, 'profile.location':1,
                                'profile.lastLogonIP':1}});
                            if (taInfo){
                                try{
                                    fields.location = taInfo.profile.location;
                                    var userName = taInfo.username;
                                    if(taInfo.profile.fullname){
                                        userName = taInfo.profile.fullname;
                                    }
                                    fields.displayName = userName;
                                    fields.userIcon = taInfo.profile.icon;
                                    self.added("userDetail",taInfo._id,taInfo);
                                } catch (error){
                                }
                            }
                            self.added("newfriends", id, fields);
                            getViewLists(self,meetItem.ta,3);
                            self.count++;
                        }
                    }
                }
            }
        }
    };
    var getViewLists = function(obj,userId,limit){
        var views = Viewers.find({userId: userId},{sort:{createdAt: -1},limit:limit});
        if (views.count()>0){
            views.forEach(function(fields){
                var viewItem = Posts.findOne({"_id":fields.postId});
                if(viewItem)
                {
                    fields.mainImage = viewItem.mainImage;
                    fields.title = viewItem.title;
                    try{
                        obj.added("viewlists", fields._id, fields);
                    }catch(error){
                    }
                }
            });
        }
    };
    var viewersAddedForViewListsDeferHandle = function(self,fields,userId) {
        Meteor.defer(function(){
            var viewItem = Posts.findOne({"_id":fields.postId});
            if(viewItem){
                fields.mainImage = viewItem.mainImage;
                fields.title = viewItem.title;
                try{
                    self.added("viewlists", id, fields);
                    self.count++;
                }catch(error){
                }
            }
        });
    };
    var followerChangedForUserDetailDeferHandle = function(self,fields,userId) {
        Meteor.defer(function(){
            var info = Meteor.users.findOne({_id: fields.followerId}, {fields: {'username': 1,
                'email': 1, 'profile.fullname': 1, 'profile.icon': 1, 'profile.desc': 1, 'profile.location': 1,
                'profile.lastLogonIP':1}});
            if (info) {
                self.added("userDetail", info._id, info);
                getViewLists(self,info._id,3);
            }
        });
    };
    var publicPostsPublisherDeferHandle = function(self,postId) {
        Meteor.defer(function(){
            var needUpdateMeetCount = false;
            try {
                if(self.userId && postId ){
                    if( Viewers.find({postId:postId,userId:self.userId}).count() === 0 ){
                        needUpdateMeetCount = true;
                        var userinfo = Meteor.users.findOne({_id: self.userId },{fields: {'username':1,'profile.fullname':1,'profile.icon':1, 'profile.anonymous':1}});
                        if(userinfo){
                            Viewers.insert({
                                postId:postId,
                                username:userinfo.profile.fullname? userinfo.profile.fullname: userinfo.username,
                                userId:self.userId,
                                userIcon: userinfo.profile.icon,
                                anonymous: userinfo.profile.anonymous,
                                createdAt: new Date()
                            });
                        }
                    } else {
                        userinfo = Meteor.users.findOne({_id: self.userId},{fields: {'username':1,'profile.fullname':1,'profile.icon':1, 'profile.anonymous':1}});
                        if(userinfo) {
                            Viewers.update({userId: self.userId, postId: postId}, {$set: {createdAt: new Date()}});
                        }
                    }
                }
            } catch (error){
            }
            try{
                var userId = self.userId;
                var views=Viewers.find({postId:postId});
                if(views.count()>0){
                    views.forEach(function(data){
                        var meetItemOne = Meets.findOne({me:userId,ta:data.userId});
                        if(meetItemOne){
                            var meetCount = meetItemOne.count;
                            if(meetCount === undefined || isNaN(meetCount))
                                meetCount = 0;
                            if ( needUpdateMeetCount ){
                                meetCount = meetCount+1;
                            }
                            Meets.update({me:userId,ta:data.userId},{$set:{count:meetCount,meetOnPostId:postId}});
                        }else{
                            Meets.insert({
                                me:userId,
                                ta:data.userId,
                                count:1,
                                meetOnPostId:postId,
                                createdAt: new Date()
                            });
                        }

                        var meetItemTwo = Meets.findOne({me:data.userId,ta:userId});
                        if(meetItemTwo){
                            var meetCount = meetItemTwo.count;
                            if(meetCount === undefined || isNaN(meetCount))
                                meetCount = 0;
                            if ( needUpdateMeetCount ){
                                meetCount = meetCount+1;
                                Meets.update({me:data.userId,ta:userId},{$set:{count:meetCount,meetOnPostId:postId,createdAt: new Date()}});
                            }
                        }else{
                            Meets.insert({
                                me:data.userId,
                                ta:userId,
                                count:1,
                                meetOnPostId:postId,
                                createdAt: new Date()
                            });
                        }
                        //根据看过帖子的人的userId，找到看过的帖子
                        var viewposts=Viewers.find({userId:userId,postId:{$ne:postId}});
                        var currentpost = Posts.findOne(postId);
                        var userinfo = Meteor.users.findOne({_id: userId},{fields: {'username':1,'profile.fullname':1,'profile.icon':1, 'profile.anonymous':1}});
                        if(viewposts.count()>0 && currentpost && userinfo){
                            viewposts.forEach(function(pdata){
                                var readpost = Posts.findOne(pdata.postId);
                                if(currentpost && readpost){
		                        //1. 给当前帖子，增加所有看过的帖子
		                        if(Moments.findOne({currentPostId:currentpost._id, readPostId:readpost._id})){
		                          Moments.update(
		                            {currentPostId:currentpost._id, readPostId:readpost._id},
		                            {$set:{
		                                    currentPostId:currentpost._id,
		                                    userId:userId,
		                                    userIcon:userinfo.profile.icon,
		                                    username:userinfo.profile.fullname? userinfo.profile.fullname: userinfo.username,
		                                    readPostId:readpost._id,
		                                    mainImage:readpost.mainImage,
		                                    title:readpost.title,
		                                    addontitle:readpost.addontitle,
		                                    createdAt:pdata.createdAt
		                                  }
		                            }
		                          );
		                        }else{
		                          Moments.insert({
		                            currentPostId:currentpost._id,
		                            userId:userId,
		                            userIcon:userinfo.profile.icon,
		                            username:userinfo.profile.fullname? userinfo.profile.fullname: userinfo.username,
		                            readPostId:readpost._id,
		                            mainImage:readpost.mainImage,
		                            title:readpost.title,
		                            addontitle:readpost.addontitle,
		                            createdAt:pdata.createdAt
		                          });
		                        }
		                        //2. 给所有看过的帖子，增加当前帖子
		                        if(Moments.findOne({currentPostId:readpost._id, readPostId:currentpost._id})){
		                          Moments.update(
		                            {currentPostId:readpost._id, readPostId:currentpost._id},
		                            {$set:{
		                                    currentPostId:readpost._id,
		                                    userId:userId,
		                                    userIcon:userinfo.profile.icon,
		                                    username:userinfo.profile.fullname? userinfo.profile.fullname: userinfo.username,
		                                    readPostId:currentpost._id,
		                                    mainImage:currentpost.mainImage,
		                                    title:currentpost.title,
		                                    addontitle:currentpost.addontitle,
		                                    createdAt:new Date()
		                                  }
		                            }
		                          );
		                        }else{
		                          Moments.insert({
		                            currentPostId:readpost._id,
		                            userId:userId,
		                            userIcon:userinfo.profile.icon,
		                            username:userinfo.profile.fullname? userinfo.profile.fullname: userinfo.username,
		                            readPostId:currentpost._id,
		                            mainImage:currentpost.mainImage,
		                            title:currentpost.title,
		                            addontitle:currentpost.addontitle,
		                            createdAt:new Date()
		                          });
		                        }
	                        }
                            });
                        }
                    });
                }
            }
            catch(error){}
        });
    };
    var postsInsertHookDeferHandle = function(userId,doc){
        Meteor.defer(function(){
            try{
                var follows=Follower.find({followerId:userId});
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
            var pullingConn = Cluster.discoverConnection("pulling");
            pullingConn.call("pullFromServer", doc._id);
        });
    };
    var postsRemoveHookDeferHandle = function(userId,doc){
        Meteor.defer(function(){
            try{
                Moments.remove({$or:[{currentPostId:doc._id},{readPostId:doc._id}]});
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
        });
    };
    var postsUpdateHookDeferHandle = function(userId,doc,fieldNames, modifier){
        Meteor.defer(function(){
            try{
                var follows=Follower.find({followerId:userId});
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
        });
    };
    var followerInsertHookDeferHook=function(userId,doc){
        Meteor.defer(function(){
            try{
                Meets.update({me:doc.userId,ta:doc.followerId},{$set:{isFriend:true}});
            }
            catch(error){}
            try{
                var posts=Posts.find({owner: doc.followerId});
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
            catch(error){}
        });
    };
    var followerRemoveHookDeferHook=function(userId,doc){
        Meteor.defer(function(){
            try{
                Meets.update({me:doc.userId,ta:doc.followerId},{$set:{isFriend:false}});
            }
            catch(error){}
            try{
                FollowPosts.remove({owner:doc.followerId,followby:userId});
            }
            catch(error){}
        });
    };
    var commentInsertHookDeferHandle = function(userId,doc) {
        Meteor.defer(function () {
            try {
                var post = Posts.findOne({_id: doc.postId});
                var commentsCount = post.commentsCount;
                if (commentsCount === undefined || isNaN(commentsCount)) {
                    commentsCount = 0;
                }
                commentsCount = commentsCount + 1;
                Posts.update({_id: doc.postId}, {$set: {'commentsCount': commentsCount}});
                if (post.owner != userId) {
                    if (ReComment.find({"postId": doc.postId, "commentUserId": userId}).count() === 0) {
                        ReComment.insert({
                            postId: doc.postId,
                            commentUserId: userId
                        });
                    }
                    Feeds.insert({
                        owner: userId,
                        ownerName: doc.username,
                        ownerIcon: doc.userIcon,
                        eventType: 'comment',
                        postId: doc.postId,
                        postTitle: post.title,
                        mainImage: post.mainImage,
                        createdAt: doc.createdAt,
                        heart: 0,
                        retweet: 0,
                        comment: 0,
                        followby: post.owner
                    });
                    var waitReadCount = Meteor.users.findOne({_id: post.owner}).profile.waitReadCount;
                    if (waitReadCount === undefined || isNaN(waitReadCount)) {
                        waitReadCount = 0;
                    }
                    Meteor.users.update({_id: post.owner}, {$set: {'profile.waitReadCount': waitReadCount + 1}});
                    pushnotification("comment", doc, userId);
                    var recomments = ReComment.find({"postId": doc.postId}).fetch();
                    var item;
                    for (item in recomments) {
                        if (recomments[item].commentUserId !== undefined && recomments[item].commentUserId !== userId && recomments[item].commentUserId !== post.owner) {
                            Feeds.insert({
                                owner: userId,
                                ownerName: doc.username,
                                ownerIcon: doc.userIcon,
                                eventType: 'recomment',
                                postId: doc.postId,
                                postTitle: post.title,
                                mainImage: post.mainImage,
                                createdAt: doc.createdAt,
                                heart: 0,
                                retweet: 0,
                                comment: 0,
                                followby: recomments[item].commentUserId
                            });
                            waitReadCount = Meteor.users.findOne({_id: recomments[item].commentUserId}).profile.waitReadCount;
                            if (waitReadCount === undefined || isNaN(waitReadCount)) {
                                waitReadCount = 0;
                            }
                            Meteor.users.update({_id: recomments[item].commentUserId}, {$set: {'profile.waitReadCount': waitReadCount + 1}});
                            pushnotification("recomment", doc, recomments[item].commentUserId);
                        }
                    }
                }
            }
            catch (error) {
            }
        });
    };
    var viewersInsertHookDeferHook = function(userId,doc){
        Meteor.defer(function(){
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
        });
    };
  Meteor.publish("viewlists", function (userId, viewerId) {
    if(this.userId === null || !Match.test(viewerId, String))
      return [];
    else{
      var self = this;
      this.count = 0;
      var handle = Viewers.find({userId: viewerId},{sort:{createdAt: -1}}).observeChanges({
        added: function (id,fields) {
          if (count<3){
              viewersAddedForViewListsDeferHandle(self,fields,userId);
          }
        },
        changed: function (id,fields) {
          try{
            self.changed("viewlists", id, fields);
          }catch(error){
          }
        },
        removed: function (id) {
          try{
            self.removed("viewlists", id);
            self.count--;
          }catch(error){
          }
        }
      });

      self.ready();

      self.onStop(function () {
        handle.stop();
      });
    }
  });
  Meteor.publish("userDetail", function (userId) {
      if(!Match.test(userId, String)){
          return [];
      }
      else{
          var self = this;
          var handle = Follower.find({userId:userId}).observeChanges({
              added: function (id,fields) {
                  if(fields.userId === userId && fields.followerId && fields.followerId !=='') {
                      followerChangedForUserDetailDeferHandle(self,fields,userId);
                  }
              }
          });
          self.ready();
          self.onStop(function () {
              handle.stop();
          });
      }
    });
  Meteor.publish("newfriends", function (userId,postId) {
    if(this.userId === null || !Match.test(postId, String))
      return [];
    else{
      var self = this;
      this.count = 0;
      var handle = Meets.find({me: userId},{sort:{count:-1,createdAt:-1}}).observeChanges({
        added: function (id,fields) {
          if (self.count<20)
          {
            var taId = fields.ta;
            if(taId !== userId && postId === fields.meetOnPostId){
                //Call defered function here:
                newMeetsAddedForNewFriendsDeferHandle(self,taId,userId,id,fields);
            }
          }
        },
        changed: function (id,fields) {
           if(fields.isFriend === true)
           {
             try{
               self.removed("newfriends", id);
               self.count--;
             }catch(error){
             }
           }
            //Call defered function here:
            newMeetsChangedForNewFriendsDeferHandle(id,self,fields,userId,postId);
        },
        removed: function (id) {
          self.removed("newfriends", id);
          self.count--;
        }
      });

      self.ready();
      self.onStop(function () {
        handle.stop();
      });
    }
  });
  Meteor.publish('meetscountwithlimit', function(limit) {
    if(this.userId === null || !Match.test(limit, Number))
      return [];
    else
      return Meets.find({me:this.userId},{sort:{count:-1},limit:limit});
  });
  Meteor.publish('meetscount', function() {
    if(this.userId === null)
      return [];
    else
      return Meets.find({me:this.userId});
  });
  Meteor.publish('waitreadcount', function() {
    if(this.userId === null)
      return [];
    else
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
    if(this.userId === null)
      return [];
    else
      return Posts.find({owner: this.userId},{sort: {createdAt: -1}});
  });
  Meteor.publish("myCounter",function(){
      Counts.publish(this, 'myPostsCount', Posts.find({owner: this.userId}), {nonReactive: true });
      Counts.publish(this, 'mySavedDraftsCount', SavedDrafts.find({owner: this.userId}), {nonReactive: true });
      Counts.publish(this, 'myFollowedByCount', Follower.find({followerId:this.userId}), { nonReactive: true });
      Counts.publish(this, 'myFollowToCount', Follower.find({userId:this.userId}), {nonReactive: true });
  });
  Meteor.publish("postsWithLimit", function(limit) {
      if(this.userId === null|| !Match.test(limit, Number)) {
          return [];
      }
      else{
          return Posts.find({owner: this.userId},{sort: {createdAt: -1},limit:limit});
      }
  });
  Meteor.publish("savedDraftsWithLimit", function(limit) {
      if(this.userId === null|| !Match.test(limit, Number)){
          return [];
      }
      else{
          return SavedDrafts.find({owner: this.userId},{sort: {createdAt: -1},limit:limit});
      }
  });
  Meteor.publish("followedByWithLimit", function(limit) {
      /*列出自己的粉丝*/
      if(this.userId === null|| !Match.test(limit, Number)){
          return [];
      }
      else {
          return Follower.find({followerId:this.userId},{limit:limit});
      }
  });
  Meteor.publish("followToWithLimit", function(limit) {
      /*列出自己的偶像*/
      if(this.userId === null|| !Match.test(limit, Number)){
          return [];
      }
      else {
          return Follower.find({userId:this.userId},{limit:limit});
      }
  });
  Meteor.publish("momentsWithLimit", function(postId,limit) {
      if(this.userId === null|| !Match.test(limit, Number)) {
          return [];
      }
      else{
          return Moments.find({currentPostId: postId},{sort: {createdAt: -1},limit:limit});
      }
  });
  Meteor.publish("followposts", function(limit) {
    if(this.userId === null || !Match.test(limit, Number))
      return [];
    else
      return FollowPosts.find({followby: this.userId}, {sort: {createdAt: -1}, limit:limit});
  });
  Meteor.publish("ViewPostsList", function(postId) {
      if(this.userId === null || !Match.test(postId, String))
        return [];
      else
        return Posts.find({_id: postId});
  });
  Meteor.publish("publicPosts", function(postId) {
      if(this.userId === null || !Match.test(postId, String))
        return [];
      else{
        var self = this;
        publicPostsPublisherDeferHandle(self,postId);
        return Posts.find({_id: postId});
      }
  });
  /*Meteor.publish("drafts", function() {
        return Drafts.find({owner: this.userId});
  });*/
  Meteor.publish("saveddrafts", function() {
    if(this.userId === null)
      return [];
    else
      return SavedDrafts.find({owner: this.userId},{sort: {createdAt: -1}});
  });
  Meteor.publish("feeds", function(limit) {
    if(this.userId === null || !Match.test(limit, Number))
      return [];
    else
      return Feeds.find({followby: this.userId}, {sort: {createdAt: -1}, limit:limit});
  });
  Meteor.publish("userFeeds", function(followId,postId) {
    if(this.userId === null || !Match.test(followId, String) || !Match.test(postId, String))
      return [];
    else
      return Feeds.find({followby: followId,postId: postId,eventType:'recommand',recommanderId:this.userId}, {sort: {createdAt: -1}, limit:2});
  });
  Meteor.publish("friendFeeds", function(friendId,userId) {
    if(this.userId === null || !Match.test(friendId, String) || !Match.test(userId, String) || this.userId !== userId)
      return [];
    else
      return Feeds.find({requesteeId:friendId,requesterId:userId},{sort: {createdAt: -1}, limit:2})
  });
  Meteor.publish("follows", function() {
    return Follows.find({}, {sort: { index: 1 }} );
  });
  Meteor.publish("follower", function() {
    if(this.userId === null)
      return [];
    else
      return Follower.find({$or:[{userId:this.userId},{followerId:this.userId}]});
  });
  Meteor.publish("friendFollower", function(userId,friendId) {
    if(this.userId === null || !Match.test(friendId, String) || !Match.test(userId, String) || this.userId !== userId)
      return [];
    else
      return Follower.find({"userId":userId,"followerId":friendId},{sort: {createdAt: -1}, limit:2})
  });
  Meteor.publish("userinfo", function(id) {
    if(!Match.test(id, String))
      return [];
    else
      return Meteor.users.find({_id: id},{fields: {'username':1,'email':1,'profile.fullname':1,'profile.icon':1, 'profile.desc':1, 'profile.location':1}});
  });
  Meteor.publish("comment", function(postId) {
    if(!Match.test(postId, String))
      return [];
    else
      return Comment.find({postId: postId});
  });
  Meteor.publish("userViewers", function(postId,userId) {
    if(!Match.test(postId, String) || !Match.test(userId, String))
      return [];
    else
      return Viewers.find({postId: postId,userId: userId}, {sort: {createdAt: -1}, limit:2});
  });
  Meteor.publish("recentPostsViewByUser", function(userId) {
    if(!Match.test(userId, String))
      return [];
    else
      return Viewers.find({userId: userId}, {sort: {createdAt: -1}, limit:3});
  });
  Meteor.publish("viewers", function(postId) {
    if(!Match.test(postId, String))
      return [];
    else
      return Viewers.find({postId: postId}, {sort: {createdAt: -1}});
  });
  Meteor.publish("reports", function(postId) {
    if(!Match.test(postId, String))
      return [];
    else
      return Reports.find({postId: postId});
  });
  Meteor.publish("messages", function(to){
    if(this.userId === null || to === null || to === undefined)
      return [];
    
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
    if(this.userId === null)
      return [];
    else
      return MsgSession.find({userId: this.userId}, {sort: {updateTime: -1}});
  });
  Meteor.publish("msgGroup", function(){
    if(this.userId === null)
      return [];
    else
      return MsgGroup.find({"users.userId": this.userId});
  });
  Meteor.publish("allUsers", function () {
    return Meteor.users.find({});
  });
  Meteor.publish('versions', function() {
    return Versions.find({});
  });
  Reports.allow({
    insert: function (userId, doc) {
      return doc.username !== null;
    }
  });
  Posts.allow({
    insert: function (userId, doc) {
      if(doc.owner === userId){
        postsInsertHookDeferHandle(userId,doc);
        return true;
      }
      return false;
    },
      remove: function (userId, doc) {
          if(doc.owner === userId){
              postsRemoveHookDeferHandle(userId,doc);
              return true;
          }
          return false;
      },
    update: function(userId, doc, fieldNames, modifier) {
      if (fieldNames.toString() === 'pub' || fieldNames.toString() === 'heart' || fieldNames.toString() === 'retweet' && modifier.$set !== void 0) {
        return true;
      }
      if (fieldNames.toString() === 'browse' && modifier.$set !== void 0) {
          Meteor.defer(function(){
              pushnotification("read",doc,userId);
          });
          return true;
      }

      if(doc.owner === userId){
        postsUpdateHookDeferHandle(userId,doc,fieldNames, modifier);
        return true;
      }
      return false;
    }
  });
  TopicPosts.allow({
    insert: function (userId, doc) {
      if(doc.owner === userId)
      {
        Meteor.defer(function(){
            try{
              Topics.update({_id: doc.topicId},{$inc: {posts: 1}});
            }
            catch(error){}
        });
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
  TempDrafts.allow({
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
      if(Follower.findOne({userId:doc.userId,followerId:doc.followerId})){
        return false;
      }
      if(doc.userId === userId || doc.followerId === userId){
        followerInsertHookDeferHook(userId,doc);
        return true;
      }
      return false;
    },
    remove: function (userId, doc) {
      if(doc.userId === userId){
        followerRemoveHookDeferHook(userId,doc);
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
      var userData = Meteor.users.findOne({_id:userId});
      if(!userData){
          return false;
      }
      var userName = userData.username;
      if(userData.profile && userData.profile.fullname !== null && userData.profile.fullname !== '') {
          userName = userData.profile.fullname;
      }
      if(doc.eventType==='recommand'){
        if(Feeds.findOne({recommanderId:userId,recommander:userName,postId:doc.postId,followby:doc.followby})){
          return false;
        }
        if(userName !== doc.recommander){
          return false;
        }
        if(doc.postId !== null && doc.followby !== null && doc.recommander !== null){
            Meteor.defer(function(){
                pushnotification("recommand",doc,doc.followby);
            });
        }
        return (doc.postId !== null && doc.followby !== null && doc.recommander !== null)
      }
      else{  /*eventType === 'sendrequest' || eventType === 'getrequest'*/
        if(doc.requesterId !== userId) {
            return false;
        }
        if(Feeds.findOne({requesteeId:doc.requesteeId,requesterId:doc.requesterId,followby:doc.followby})){
            return false;
        }
        if(doc.eventType === 'getrequest')
        {
            Meteor.defer(function(){
                pushnotification("getrequest",doc,doc.followby);
            });
        }
        return true;
      }
    }
  });
  Viewers.allow({
    insert: function (userId, doc) {
      if(doc.username === null) {
          return false;
      }
      if( Viewers.findOne({postId:doc.postId,userId:doc.userId})){
          return false;
      }
      if(doc.username !== null) {
        viewersInsertHookDeferHook(userId,doc);
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
      if(doc.username===null)
          return false;
      else {
          commentInsertHookDeferHandle(userId, doc);
          return true;
      }
    },
    remove: function (userId, doc) {
      if(doc.userId !== userId)
          return false;
      Meteor.defer(function(){
          try {
              var post = Posts.findOne({_id: doc.postId});
              var commentsCount = post.commentsCount;
              if(commentsCount === undefined || isNaN(commentsCount)){
                  commentsCount = 1;
              }
              commentsCount=commentsCount-1;
              Posts.update({_id: doc.postId}, {$set: {'commentsCount': commentsCount}});
          }
          catch(error){}
      });
      return doc.userId === userId;
    },
    update: function (userId, doc) {
      return doc.userId === userId;
    }
  });
  Meteor.users.allow({
    update: function (userId, doc, fieldNames, modifier) {
      return doc._id === userId
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
  var FOLLOWPOSTS_ITEMS_INCREMENT = 10;
  var FEEDS_ITEMS_INCREMENT = 20;
  var FOLLOWS_ITEMS_INCREMENT = 10;
  var MYPOSTS_ITEMS_INCREMENT = 4;
  var MOMENTS_ITEMS_INCREMENT = 10;
  var POST_ID = null;
  Session.setDefault('followpostsitemsLimit', FOLLOWPOSTS_ITEMS_INCREMENT);
  Session.setDefault('feedsitemsLimit', FEEDS_ITEMS_INCREMENT);
  Session.setDefault('followersitemsLimit', FOLLOWS_ITEMS_INCREMENT);
  Session.setDefault('followeesitemsLimit', FOLLOWS_ITEMS_INCREMENT);
  Session.setDefault('mypostsitemsLimit', MYPOSTS_ITEMS_INCREMENT);
  Session.setDefault('momentsitemsLimit', MOMENTS_ITEMS_INCREMENT);
  Session.set('followPostsCollection','loading');
  Session.set('feedsCollection','loading');
  Session.set('followersCollection','loading');
  Session.set('followeesCollection','loading');
  Session.set('myPostsCollection','loading');
  Session.set('momentsCollection','loading');
  var subscribeFollowPostsOnStop = function(err){
      console.log('followPostsCollection ' + err);
      Session.set('followPostsCollection','error');
      Meteor.setTimeout(function(){
          Session.set('followPostsCollection','loading');
          Meteor.subscribe('followposts', Session.get('followpostsitemsLimit'), {
              onStop: subscribeFollowPostsOnStop,
              onReady: function(){
                  console.log('followPostsCollection loaded');
                  Session.set('followPostsCollection','loaded');
              }
          });
      },2000);
  };
  var subscribeFeedsOnStop = function(err){
      console.log('feedsCollection ' + err);
      Session.set('feedsCollection','error');
      Meteor.setTimeout(function(){
          Session.set('feedsCollection','loading');
          Meteor.subscribe('feeds', Session.get('feedsitemsLimit'), {
              onStop: subscribeFeedsOnStop,
              onReady: function(){
                  console.log('feedsCollection loaded');
                  Session.set('feedsCollection','loaded');
              }
          });
      },2000);
  };
  window.refreshMainDataSource = function(){
      Meteor.subscribe('waitreadcount');
  };
  if(Meteor.isCordova){
      var options = {
          keepHistory: 1000 * 60 * 5,
          localSearch: true
      };
      var fields = ['username', 'profile.fullname'];
      FollowUsersSearch = new SearchSource('followusers', fields, options);
      var topicsfields = ['text'];
      TopicsSearch = new SearchSource('topics', topicsfields, options);
      Tracker.autorun(function(){
          if (Meteor.user()) {
              Meteor.subscribe('followposts', Session.get('followpostsitemsLimit'), {
                  onStop: subscribeFollowPostsOnStop,
                  onReady: function () {
                      console.log('followPostsCollection loaded');
                      Session.set('followPostsCollection', 'loaded');
                  }
              });
              Meteor.subscribe('feeds', Session.get('feedsitemsLimit'), {
                  onStop: subscribeFeedsOnStop,
                  onReady: function () {
                      console.log('feedsCollection loaded');
                      Session.set('feedsCollection', 'loaded');
                  }
              });
              Meteor.subscribe('followToWithLimit', Session.get('followersitemsLimit'), {
                  onReady: function () {
                      console.log('followersCollection loaded');
                      Session.set('followersCollection', 'loaded');
                  }
              });
              Meteor.subscribe('followedByWithLimit', Session.get('followeesitemsLimit'), {
                  onReady: function () {
                      console.log('followeesCollection loaded');
                      Session.set('followeesCollection', 'loaded');
                  }
              });
              Meteor.subscribe('postsWithLimit', Session.get('mypostsitemsLimit'), {
                  onReady: function(){
                      console.log('myPostsCollection loaded');
                      Session.set('myPostsCollection','loaded');
                  }
              });
              if(Session.get("postContent")){
                if(POST_ID !== Session.get("postContent")._id)
                {
                  POST_ID = Session.get("postContent")._id;
                  Session.set('momentsitemsLimit', MOMENTS_ITEMS_INCREMENT);
                }
                Meteor.subscribe('momentsWithLimit', Session.get("postContent")._id, Session.get('momentsitemsLimit'), {
                    onReady: function(){
                        console.log('momentsCollection loaded');
                        Session.set('momentsCollection','loaded');
                    }
                });
              }
          }
      });
  }
  Tracker.autorun(function() {
    if (Meteor.userId()) {
        if (Meteor.isCordova){
            console.log('Refresh Main Data Source when logon');
            window.refreshMainDataSource();
        }/*
        if(withChat) {
            // 消息会话、最近联系人
            Meteor.subscribe("msgSession");
            //群信息
            Meteor.subscribe("msgGroup");
        }*/
    }
  });
}
