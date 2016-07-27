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
BlackList = new Meteor.Collection('blackList');
AssociatedUsers = new Meteor.Collection('associatedusers');
UserRelation = new Meteor.Collection('userrelation'); // 用户关系，为了不和以前的产生冲突，使用新表

if(Meteor.isServer)
  PushSendLogs = new Meteor.Collection('pushSendLogs');

ReaderPopularPosts = new Meteor.Collection('readerpopularposts');

FavouritePosts = new Meteor.Collection('favouriteposts');

ShareURLs = new Meteor.Collection('shareURLs');

if(Meteor.isClient){
  PostFriends = new Meteor.Collection("postfriends")
  Newfriends = new Meteor.Collection("newfriends");
  ViewLists = new Meteor.Collection("viewlists");
  //User detail has duplicated information with postfriends, so only leave one to save traffic
  //UserDetail = new Meteor.Collection("userDetail");
  DynamicMoments = new Meteor.Collection('dynamicmoments');
  NewDynamicMoments = new Meteor.Collection('newdynamicmoments');
  SuggestPosts = new Meteor.Collection('suggestposts');
}
if(Meteor.isServer){
  RefNames = new Meteor.Collection("refnames");
  PComments = new Meteor.Collection("pcomments");
  PShares = new Meteor.Collection("pshares");
}

// 为老版本计算默认 topicpost 数据
if(Meteor.isServer){
  OldTopicPosts = [];
  var makeOldTopicPosts = function(){
    var ids = [];
    var addIds = function(){
      if(arguments[0].length > 0){
        for(var i=0;i<arguments[0].length;i++)
          ids.push(arguments[0][i]);
      }
    };
    var getIds = function(name, limit){
      var topic = Topics.findOne({text: name});
      if(!topic)
        return [];
      return _.pluck(TopicPosts.find({topicId: topic._id}, {sort: {createdAt: -1},limit: limit}).fetch(), '_id')
    }

    addIds(getIds('精选', 30));
    addIds(getIds('故事贴使用说明', 20));
    addIds(getIds('小故事', 15));
    addIds(getIds('寻觅一缕心香', 10));
    addIds(getIds('热点新闻', 10));
    addIds(getIds('故事', 5));
    addIds(getIds('诗和远方', 5));
    addIds(getIds('有关故事贴', 5));
    addIds(getIds('丽江古城', 5));
    addIds(getIds('旅游', 5));

    OldTopicPosts =  TopicPosts.find({_id: {$in: ids}}, {sort: {createdAt: -1}});
  };
  Meteor.startup(function(){
    makeOldTopicPosts();
    Meteor.setInterval(function(){
      makeOldTopicPosts();
    }, 1000*60*10); // 10 分钟
  });
}

if(Meteor.isServer){
    Rnd = 0;
    try{
        suggestPostsUserId = Meteor.users.findOne({'username': 'suggestPosts' })._id;
    }
    catch(error)
    {
        //创建公共粉丝用户，关注所有推荐用户，从公共粉丝用户的FollowPosts里提取推荐帖子，加快推荐帖子速度
        suggestPostsUserId = Accounts.createUser({
            username:'suggestPosts',
            password:'actiontec123',
            email:'suggestposts@ggmail.com',
            profile:{
                icon:'/follows/icon1.png',
                desc:"留下美好的瞬间！就看我的！",
                fullname:'伊人'
            }
        });
    }
    /*Meteor.startup(function(){
        postsInsertHookPostToBaiduDeferHandle('CJj4k9fhj2hrrZhCb')
    })*/
    var newMeetsAddedForPostFriendsDeferHandle = function(self,taId,userId,id,fields){
        Meteor.defer(function(){
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
            //getViewLists(self,taId,3);
            self.added("postfriends", id, fields);
            self.count++;
        });
    };
    var newMeetsAddedForPostFriendsDeferHandleV2 = function(self,taId,userId,id,fields){
        Meteor.defer(function(){
            var taInfo = Meteor.users.findOne({_id: taId},{fields: {'username':1,'email':1,'profile.fullname':1,
                'profile.icon':1, 'profile.desc':1, 'profile.location':1,'profile.lastLogonIP':1,'profile.profile.sex':1}});
            if (taInfo){
                try{
                    var userName = taInfo.username;
                    if(taInfo.profile.fullname){
                        userName = taInfo.profile.fullname;
                    }
                    fields.displayName = userName;
                    fields.username = userName;
                    fields.profile = {};
                    fields.profile.location = taInfo.profile.location;
                    fields.profile.icon = taInfo.profile.icon;
                    fields.profile.lastLogonIP = taInfo.profile.lastLogonIP;
                    fields.profile.sex = taInfo.profile.sex;
                    fields.profile.desc = taInfo.fields.profile.desc;

                } catch (error){
                }
            }
            //getViewLists(self,taId,3);
            self.added("postfriends", id, fields);
        });
    };
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
    var updateMomentsDeferHandle = function(self,postId){
        Meteor.defer(function() {
            var userId = self.userId;
            var viewposts = Viewers.find({userId: userId});
            var currentpost = Posts.findOne(postId);
            var userinfo = Meteor.users.findOne({_id: userId}, {
                fields: {
                    'username': 1,
                    'profile.fullname': 1,
                    'profile.icon': 1,
                    'profile.anonymous': 1
                }
            });
            if (viewposts.count() > 0 && currentpost && userinfo) {
                viewposts.forEach(function (pdata) {
                    if(pdata.postId !== postId)
                    {
                        var readpost = Posts.findOne(pdata.postId);
                        if (currentpost && readpost) {
                            //1. 给当前帖子，增加所有看过的帖子
                            if (Moments.find({currentPostId: currentpost._id, readPostId: readpost._id}).count() === 0) {
                                Moments.insert({
                                    currentPostId: currentpost._id,
                                    userId: userId,
                                    userIcon: userinfo.profile.icon,
                                    username: userinfo.profile.fullname ? userinfo.profile.fullname : userinfo.username,
                                    readPostId: readpost._id,
                                    mainImage: readpost.mainImage,
                                    title: readpost.title,
                                    addontitle: readpost.addontitle,
                                    createdAt: pdata.createdAt
                                });
                            } else {
                                Moments.update({currentPostId: currentpost._id, readPostId: readpost._id}, {
                                    $set: {
                                        userId: userId,
                                        userIcon: userinfo.profile.icon,
                                        username: userinfo.profile.fullname ? userinfo.profile.fullname : userinfo.username,
                                        mainImage: readpost.mainImage,
                                        title: readpost.title,
                                        addontitle: readpost.addontitle,
                                        createdAt: pdata.createdAt
                                    }
                                });
                            }
                            //2. 给所有看过的帖子，增加当前帖子
                            if (Moments.find({currentPostId: readpost._id, readPostId: currentpost._id}).count() === 0) {
                                Moments.insert({
                                    currentPostId: readpost._id,
                                    userId: userId,
                                    userIcon: userinfo.profile.icon,
                                    username: userinfo.profile.fullname ? userinfo.profile.fullname : userinfo.username,
                                    readPostId: currentpost._id,
                                    mainImage: currentpost.mainImage,
                                    title: currentpost.title,
                                    addontitle: currentpost.addontitle,
                                    createdAt: new Date()
                                });
                            } else {
                                Moments.update({currentPostId: readpost._id, readPostId: currentpost._id}, {
                                    $set: {
                                        userId: userId,
                                        userIcon: userinfo.profile.icon,
                                        username: userinfo.profile.fullname ? userinfo.profile.fullname : userinfo.username,
                                        mainImage: currentpost.mainImage,
                                        title: currentpost.title,
                                        addontitle: currentpost.addontitle,
                                        createdAt: new Date()
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
    }
    var publicPostsPublisherDeferHandle = function(userId,postId,self) {
        Meteor.defer(function(){
            try {
                var postInfo=Posts.findOne({_id:postId},{fields:{owner:1}})
                if(postInfo){
                    console.log('owner is '+postInfo.owner);
                    newMeetsAddedForPostFriendsDeferHandleV2(self,postInfo.owner,userId,postInfo.owner,{me:userId,ta:postInfo.owner});
                }
            } catch (error){
            }

            var needUpdateMeetCount = false;
            try {
                if(userId && postId ){
                    if( Viewers.find({postId:postId,userId:userId}).count() === 0 ){
                        needUpdateMeetCount = true;
                        var userinfo = Meteor.users.findOne({_id: userId },{fields: {'username':1,'profile.fullname':1,'profile.icon':1, 'profile.anonymous':1}});
                        if(userinfo){
                            Viewers.insert({
                                postId:postId,
                                username:userinfo.profile.fullname? userinfo.profile.fullname: userinfo.username,
                                userId:userId,
                                userIcon: userinfo.profile.icon,
                                anonymous: userinfo.profile.anonymous,
                                createdAt: new Date()
                            });
                        }
                    } else {
                        userinfo = Meteor.users.findOne({_id: userId},{fields: {'username':1,'profile.fullname':1,'profile.icon':1, 'profile.anonymous':1}});
                        if(userinfo) {
                            Viewers.update({postId: postId, userId: userId}, {$set: {createdAt: new Date()}});
                        }
                    }
                }
            } catch (error){
            }
            try{
                var views=Viewers.find({postId:postId},{limit:100});
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
                            if(data.userId === userId)
                                Meets.remove({_id:meetItemOne._id});
                            else
                                Meets.update({me:userId,ta:data.userId},{$set:{count:meetCount,meetOnPostId:postId}});
                        }else{
                            if(userId !== data.userId)
                            {
                                Meets.insert({
                                    me:userId,
                                    ta:data.userId,
                                    count:1,
                                    meetOnPostId:postId,
                                    createdAt: new Date()
                                });
                            }
                        }

                        var meetItemTwo = Meets.findOne({me:data.userId,ta:userId});
                        if(meetItemTwo){
                            var meetCount = meetItemTwo.count;
                            if(meetCount === undefined || isNaN(meetCount))
                                meetCount = 0;
                            if ( needUpdateMeetCount ){
                                meetCount = meetCount+1;
                                if(data.userId === userId)
                                    Meets.remove({_id:meetItemTwo._id});
                                else
                                    Meets.update({me:data.userId,ta:userId},{$set:{count:meetCount,meetOnPostId:postId,createdAt: new Date()}});
                            }
                        }else{
                            if(userId !== data.userId) {
                                Meets.insert({
                                    me: data.userId,
                                    ta: userId,
                                    count: 1,
                                    meetOnPostId: postId,
                                    createdAt: new Date()
                                });
                            }
                        }
                    });
                }
            }
            catch(error){}
        });
    };
    var postsInsertHookPostToBaiduDeferHandle = function(postid) {
        Meteor.defer(function () {
            if(postid && postid!==''){
                var link='http://www.tiegushi.com/posts/'+postid;
                HTTP.post('http://data.zz.baidu.com/urls?site=www.tiegushi.com&token=sra0FwZC821iV2M0',{content:link},
                    function (error, result) {
                        console.log('post to baidu '+link+' result '+JSON.stringify(result));
                    })
            }
        })
    }
    var postsInsertHookDeferHandle = function(userId,doc){
        Meteor.defer(function(){
            try{
                var follows=Follower.find({followerId:userId});
                if(follows.count()>0){
                    follows.forEach(function(data){
                        if(data.userId === suggestPostsUserId)
                        {
                            FollowPosts.insert({
                                _id:doc._id,
                                postId:doc._id,
                                title:doc.title,
                                addontitle:doc.addontitle,
                                mainImage: doc.mainImage,
                                mainImageStyle:doc.mainImageStyle,
                                heart:0,
                                retweet:0,
                                comment:0,
                                browse: 0,
                                publish: doc.publish,
                                owner:doc.owner,
                                ownerName:doc.ownerName,
                                ownerIcon:doc.ownerIcon,
                                createdAt: doc.createdAt,
                                followby: data.userId
                            });
                        }
                        else
                        {
                            FollowPosts.insert({
                                postId:doc._id,
                                title:doc.title,
                                addontitle:doc.addontitle,
                                mainImage: doc.mainImage,
                                mainImageStyle:doc.mainImageStyle,
                                heart:0,
                                retweet:0,
                                comment:0,
                                browse: 0,
                                publish: doc.publish,
                                owner:doc.owner,
                                ownerName:doc.ownerName,
                                ownerIcon:doc.ownerIcon,
                                createdAt: doc.createdAt,
                                followby: data.userId
                            });
                        }

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
                if(userId === suggestPostsUserId)
                {
                    FollowPosts.insert({
                        _id:doc._id,
                        postId:doc._id,
                        title:doc.title,
                        addontitle:doc.addontitle,
                        mainImage: doc.mainImage,
                        mainImageStyle:doc.mainImageStyle,
                        heart:0,
                        retweet:0,
                        comment:0,
                        browse: 0,
                        publish: doc.publish,
                        owner:doc.owner,
                        ownerName:doc.ownerName,
                        ownerIcon:doc.ownerIcon,
                        createdAt: doc.createdAt,
                        followby: userId
                    });
                }
                else
                {
                    FollowPosts.insert({
                        postId:doc._id,
                        title:doc.title,
                        addontitle:doc.addontitle,
                        mainImage: doc.mainImage,
                        mainImageStyle:doc.mainImageStyle,
                        heart:0,
                        retweet:0,
                        comment:0,
                        browse: 0,
                        publish: doc.publish,
                        owner:doc.owner,
                        ownerName:doc.ownerName,
                        ownerIcon:doc.ownerIcon,
                        createdAt: doc.createdAt,
                        followby: userId
                    });
                }
            }
            catch(error){}
            try {
                var pullingConn = Cluster.discoverConnection("pulling");
                pullingConn.call("pullFromServer", doc._id);
            }
            catch(error){}
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
    var updateServerSidePcommentsHookDeferHandle = function(userId,doc,ptype,pindex){
        Meteor.defer(function(){
            try{
                var userinfo = Meteor.users.findOne({_id: userId },{'username':1,'profile.fullname':1,'profile.icon':1, 'profile.anonymous':1});
                var needRemove = false;
                if(ptype ==="like" && doc.pub[pindex].likeUserId && doc.pub[pindex].likeUserId[userId] === true)
                    needRemove = true;
                if(ptype ==="dislike" && doc.pub[pindex].dislikeUserId && doc.pub[pindex].dislikeUserId[userId] === true)
                    needRemove = true;

                // 段落转发
                if(ptype === 'pshare'){
                  if(PShares.find({postId:doc._id,pindex:pindex,userId: userId}).count() > 0)
                    return PShares.update({postId:doc._id,pindex:pindex,userId: userId},{$set:{createdAt: new Date()}});

                  return PShares.insert({
                    postId:doc._id,
                    pindex:pindex,
                    ptype:ptype,
                    userId: userId,
                    createdAt: new Date()
                  });
                }
                if(needRemove){
                    //console.log('need remove '+needRemove)
                    PComments.remove({
                        postId:doc._id,
                        pindex:pindex,
                        ptype:ptype,
                        commentUserId: userId
                    });
                } else {
                    PComments.insert({
                        postId:doc._id,
                        pindex:pindex,
                        ptype:ptype,
                        commentUserId: userId,
                        createdAt: new Date()
                    });
                }
                var pcs=PComments.find({postId:doc._id});
                //console.log("=======pcs.count=="+pcs.count()+"======================");
                if(pcs.count()>0)
                {
                    //有人点评了您点评过的帖子
                    pcs.forEach(function(data) {
                        if(data.commentUserId !== userId && data.commentUserId !== doc.owner)
                        {
                            var pfeeds = Feeds.findOne({
                                owner: userId,
                                followby: data.commentUserId,
                                checked: false,
                                postId: data.postId,
                                pindex: pindex
                            });
                            if (pfeeds || needRemove) {
                                //console.log("==================already have feed==========");
                                if (pfeeds && needRemove)
                                    Feeds.remove(pfeeds);
                            } else {
                                if (userinfo) {
                                    Feeds.insert({
                                        owner: userId,
                                        ownerName: userinfo.profile.fullname ? userinfo.profile.fullname : userinfo.username,
                                        ownerIcon: userinfo.profile.icon,
                                        eventType: 'pcomment',
                                        postId: data.postId,
                                        postTitle: doc.title,
                                        addontitle: doc.addontitle,
                                        pindex: pindex,
                                        pindexText: pindex && pindex >= 0 ? doc.pub[pindex].text : '',
                                        meComment: PComments.find({commentUserId:data.commentUserId,postId:doc._id,pindex:pindex}).count() > 0,//我是否点评过此段落
                                        mainImage: doc.mainImage,
                                        createdAt: new Date(),
                                        heart: 0,
                                        retweet: 0,
                                        comment: 0,
                                        followby: data.commentUserId,
                                        checked: false
                                    });
                                    var notifyUser = Meteor.users.findOne({_id: data.commentUserId})
                                    var waitReadCount = notifyUser.profile.waitReadCount;
                                    var broswerUser = notifyUser.profile.browser;
                                    if(broswerUser === undefined || isNaN(broswerUser)){
                                        broswerUser = false;
                                    }
                                    if (waitReadCount === undefined || isNaN(waitReadCount)) {
                                        waitReadCount = 0;
                                    }
                                    if(broswerUser === false)
                                    {
                                        Meteor.users.update({_id: data.commentUserId}, {$set: {'profile.waitReadCount': waitReadCount + 1}});
                                        pushnotification("palsocomment", doc, data.commentUserId);
                                    }
                                }
                            }
                        }
                        //别人赞了你评论的帖子
                        if(doc.pub[pindex].likeUserId && (Object.keys(doc.pub[pindex].likeUserId)).length > 0) {
                            (Object.keys(doc.pub[pindex].likeUserId)).forEach(function(likeUserId) {
                                //if(doc.pub[pindex].likeUserId !== userId && doc.pub[pindex].likeUserId !== doc.owner) {
                                if(likeUserId !== userId && likeUserId !== doc.owner) {
                                    var pfeeds = Feeds.findOne({
                                        owner: userId,
                                        //followby: doc.pub[pindex].likeUserId,
                                        followby: likeUserId,
                                        checked: false,
                                        postId: data.postId,
                                        pindex: pindex
                                    });
                                    if (pfeeds || needRemove) {
                                        //console.log("==================already have feed==========");
                                        if (pfeeds && needRemove)
                                            Feeds.remove(pfeeds);
                                    } else {
                                        if (userinfo) {
                                            Feeds.insert({
                                                owner: userId,
                                                ownerName: userinfo.profile.fullname ? userinfo.profile.fullname : userinfo.username,
                                                ownerIcon: userinfo.profile.icon,
                                                eventType: 'pfavourite',
                                                postId: data.postId,
                                                postTitle: doc.title,
                                                addontitle: doc.addontitle,
                                                pindex: pindex,
                                                pindexText: pindex && pindex >= 0 ? doc.pub[pindex].text : '',
                                                meComment: PComments.find({commentUserId:data.commentUserId,postId:doc._id,pindex:pindex}).count() > 0,//我是否点评过此段落
                                                mainImage: doc.mainImage,
                                                createdAt: new Date(),
                                                heart: 0,
                                                retweet: 0,
                                                comment: 0,
                                                //followby: doc.pub[pindex].likeUserId,
                                                followby: likeUserId,
                                                checked: false
                                            });
                                            //var notifyThumbhandUpUser = Meteor.users.findOne({_id: doc.pub[pindex].likeUserId})
                                            var notifyThumbhandUpUser = Meteor.users.findOne({_id: likeUserId})
                                            var waitThumbhandUpReadCount = notifyThumbhandUpUser.profile.waitReadCount;
                                            var broswerThumbhandUpUser = notifyThumbhandUpUser.profile.browser;
                                            if(notifyThumbhandUpUser === undefined || isNaN(notifyThumbhandUpUser)){
                                                notifyThumbhandUpUser = false;
                                            }
                                            if (waitThumbhandUpReadCount === undefined || isNaN(waitThumbhandUpReadCount)) {
                                                waitThumbhandUpReadCount = 0;
                                            }
                                            if(notifyThumbhandUpUser === false)
                                            {
                                                //Meteor.users.update({_id: doc.pub[pindex].likeUserId}, {$set: {'profile.waitReadCount': waitReadCount + 1}});
                                                Meteor.users.update({_id: likeUserId}, {$set: {'profile.waitReadCount': waitReadCount + 1}});
                                                //pushnotification("palsofavourite", doc, doc.pub[pindex].likeUserId);
                                                pushnotification("palsofavourite", doc, likeUserId);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    });
                }

                //有人点评了您的转发，只支持Web端转发。--begin
                if(PShares.find({postId:doc._id,pindex:pindex}).count() > 0){
                  PShares.find({postId:doc._id,pindex:pindex}).forEach(function(item){
                    if(item.userId === userId)
                      return;
                    if(needRemove){
                      Feeds.remove({owner: userId, postId: doc._id, pindex: pindex, followby: item.userId, eventType: 'pcommentShare'})
                    } else {
                        if(Feeds.find({owner: userId, postId: doc._id, pindex: pindex, followby: item.userId, eventType: 'pcommentShare'}).count() > 0)
                            return Feeds.update({owner: userId, postId: doc._id, pindex: pindex, followby: item.userId, eventType: 'pcommentShare'}, {$set:{checked: false, createdAt: new Date()}});

                        Feeds.insert({
                            owner: userId,
                            ownerName: userinfo.profile.fullname ? userinfo.profile.fullname : userinfo.username,
                            ownerIcon: userinfo.profile.icon,
                            eventType: 'pcommentShare',
                            postId: doc._id,
                            postTitle: doc.title,
                            addontitle: doc.addontitle,
                            pindex: pindex,
                            pindexText: pindex && pindex >= 0 ? doc.pub[pindex].text : '',
                            mainImage: doc.mainImage,
                            createdAt: new Date(),
                            heart: 0,
                            retweet: 0,
                            comment: 0,
                            followby: item.userId,
                            checked: false
                        });
                    }
                  });
                }

                // @feiwu: 以下处理暂时保留，还不清楚处理逻辑
                //1.查谁转发了这个帖子
                var fds=Feeds.find({postId:doc._id,eventType:"share"})
                if(fds.count()>0)
                {
                    fds.forEach(function(data){
                        //不是点评的人转发的，不是作者转发的
                        if(data.followby !== userId && data.followby !== doc.owner)
                        {
                            var pfeeds = Feeds.findOne({
                                owner: userId,
                                followby: data.commentUserId,
                                checked: false,
                                postId: data.postId,
                                pindex: pindex
                            });
                            if (pfeeds || needRemove) {
                                //console.log("==================already have feed==========");
                                if (pfeeds && needRemove)
                                    Feeds.remove(pfeeds);
                            } else {
                                if (userinfo) {
                                    //是否已经有消息提醒
                                    if(Feeds.find({owner: userId,postId:doc._id,eventType:"pcomment",followby: data.followby,checked: false}).count()===0)
                                    {
                                        Feeds.insert({
                                            owner: userId,
                                            ownerName: userinfo.profile.fullname ? userinfo.profile.fullname : userinfo.username,
                                            ownerIcon: userinfo.profile.icon,
                                            eventType: 'pcommentShare',
                                            postId: data.postId,
                                            postTitle: doc.title,
                                            addontitle: doc.addontitle,
                                            pindex: pindex,
                                            pindexText: pindex && pindex >= 0 ? doc.pub[pindex].text : '',
                                            mainImage: doc.mainImage,
                                            createdAt: new Date(),
                                            heart: 0,
                                            retweet: 0,
                                            comment: 0,
                                            followby: data.followby,
                                            checked: false
                                        });
                                    }
                                }
                            }

                        }
                    })
                }
                //有人点评了您的转发，只支持Web端转发。--end

                //有人点评了您发表的帖子
                if(doc.owner !== userId)
                {
                    var pfeeds=Feeds.findOne({owner:userId,followby:doc.owner,checked:false,postId:doc._id,pindex:pindex});
                    //if(pfeeds || needRemove){
                    if(needRemove){
                        //console.log("==================already have feed==========");
                        if(pfeeds && needRemove)
                            Feeds.remove(pfeeds);
                    }else {
                        if (userinfo) {
                            Feeds.insert({
                                owner: userId,
                                ownerName: userinfo.profile.fullname ? userinfo.profile.fullname : userinfo.username,
                                ownerIcon: userinfo.profile.icon,
                                eventType: 'pcommentowner',
                                postId: doc._id,
                                postTitle: doc.title,
                                addontitle:doc.addontitle,
                                pindex:pindex,
                                mainImage: doc.mainImage,
                                createdAt: new Date(),
                                heart: 0,
                                retweet: 0,
                                comment: 0,
                                followby: doc.owner,
                                checked: false
                            });
                            var waitReadCount = Meteor.users.findOne({_id: doc.owner}).profile.waitReadCount;
                            if (waitReadCount === undefined || isNaN(waitReadCount)) {
                                waitReadCount = 0;
                            }
                            Meteor.users.update({_id: doc.owner}, {$set: {'profile.waitReadCount': waitReadCount + 1}});
                            pushnotification("pcommentowner", doc, userId);
                        }
                    }
                }
            }catch(error){
                //console.log("=====================error:"+error+"=====================");
            }
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
                                mainImageStyle: modifier.$set.mainImageStyle,
                                publish: modifier.$set.publish
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
                        mainImageStyle: modifier.$set.mainImageStyle,
                        publish: modifier.$set.publish
                    }
                    }
                );
            }
            catch(error){}
        });
    };

    // web端关注作者, 发送第一封email
    var followerHookForWeb = function(userId, doc) {
        var text = '<div style="text-align:center;"><table width="600" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tbody><tr><td>\
					<div style="width:600px;text-align:left;font:12px/15px simsun;color:#000;background:#fff; border:1px solid #e3e3e3;">\
						<div style=" padding: 16px; height:48px;background:#00c4ff;">\
							<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAuCAYAAAEQMgqAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowMjcyN0YxNzUzRDExMUU2QjUxNkFEN0Y1NEZCNDkzQSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowMjcyN0YxODUzRDExMUU2QjUxNkFEN0Y1NEZCNDkzQSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAyNzI3RjE1NTNEMTExRTZCNTE2QUQ3RjU0RkI0OTNBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAyNzI3RjE2NTNEMTExRTZCNTE2QUQ3RjU0RkI0OTNBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+8DsugQAACStJREFUeNpi+P//PwMQ34bSKBhEhEI5IHAdiNfCJFkYEIARiW0JxBwgFTv/IwADMs0INhsT/ARidiYkAX4g7gFikOrDIAGAAAJpZwfifdhcimyHMYwNs+s/kitB7F4WKAMESoFYB+4IqBFv0exwhDECgNgOiJ9B7dgLEEAgO3yAWq2B+BsQNyGFCshPbFhDCqgpBMn4/1CvOaFZ+x+ZD3L0PyA2AmIPqDnxQGwBxBehuAQqDgrItUAsh2wSMrgJxGmw6IDiPChdgRxHP0DxguSHP0B8FWo6yMZN8PDFloigNugAcTs0DSGnCgaAAEJWeBKHARgYFBDTgPgVlIZFL4j+hRTkZ4DYFDnIYTgQ6gRvIHYA4htIgXQC3SZ0cB2I7wGxBhDvB+LzQPwXWQETFk0tSOzTQPwZGpIZUGcXgqwTgDqtEymE6tBy4QEo2xqI74Gc9x5q6jqk9A2KLy6kJA5y0RQgXg7EKiDdr7CkiGVArIYW1BeB+DB6PIGwKY648UVOuOgpGRl8BOLV0FwA86sUcp4FAW4gFoO63waa2u2hfE4gfg3EvCCFyPH0FYjvQ9kfoPyPUI3fkeMEIIBgTvuAxXn//hMH/gLxDyD+DMQ1uNIryLkhQCwATacwHIBWeDLiwHugXgZFKw8Q+zDgAExoBmJLkVug9FYgdkASTwbizTj04zUQF/AF4kVA7A3EB5DE5wLxHXA1wcCwGKnw9wJiQyCWgCZeJnwWoVchbUDsgkVdA7QEi4XyQcVDKBA3AnE+ED+BpiBwRO3FEsFr0Ph80EhlBmJXIBaC8lXR1O0HYk0g9ofyQepXgPIyKH3vANpoAi1GQEn1OTSJ1jEQB0Alx20gPgXEudDSBFYIakJLGB5Y8tsIdcFjaB5Pw5LPicUgIIfE5sRWNsAwKG/MAWITIJaGVnDEWPILiBOh7FtAPANbZQGrMD7+Jx+sh5oThq2mRQbmUPo4EEsDsQi0/EEG36Cp6RG0SjgPrR9B5XMeUoo1RdYEEIAVs3mFKArD+GRmsCEfWYgyWFhIhIhIKNY2SiELdlJ2slE+kkhmwULiP2BH2flYTClTysJCicQoikRM4nmn59TpOPdehlO/7syZc+57P57zvs8ZvUaKQgZBlDm3Kcl3ZEUCFPAKk21xIusp12mQBJqnRD+4soOgDnRyzCwYBxtggCdMdzhfGhetJQV8v00/F55qo+wPGOPqLWIIOj06W2eaEehJ+00kfwOW+T3lPwOpvjNj3BuP08kGStUCHbHvyuEEC3zUqgXcjJpbW+VxzeH3OsNaSfGr4Rq7Yzl/N+u/rb1o6d/Wbi2bkSwu1tqEafL5dsBJikctauNx2DJuinWo19jkDIEK0gFiiaB8gSHQzsywArYNMQSYA6tBkZQW0GLxXEEjwYYpmmyfS3JUbUebXAkatO9RY57axohC+0w36BVI1akiLUAzeLXM8xt1aB1s6qo7pUouaQRbjfdRCC4cBBGj0d+iAif5WRTXQ6OSyHU5ON57qE/K8zE45I4hQlfqZGwyqMB3ZccC7FC1XzY2+2CPJ3z9ZSbvZV16piqjbklVmAAXSfoFVcfiVLJjChrRJpRq1sqLRm05ZHqV8m4Q5ucDl2zxQIslIjrjI9oGixyzRNtmrUfFIPb5t6Y/wiGzlNuuup+SPadgRN55/LugHFSCUsO4yN3tghDo4s45rpdyM4j87zADSpggbevmWhIlLyZCs/9Itankmm56hp9KV3YG2aCMdyVUgXxaM782dg6M6ZO/BKjVXEKijKI4Po2a+CyDYbQH5qICIQtaJC0iCJOg2kRbqYQoWmpIq6AWQVGLgiBbmbWIpLIIjBauKjVy02NhPjIzMMUXlY7OON0Dvwu363dnvnHGA4f55vN+d777+p/z/x/NHxLy1cR0RFj0CuXlHrm2HNwvXEeNw7nI55LxPYLrvy1Y7WO47ku3+0E/KZkekKxru6WEmKxS369gBm1bIAh3QwrrrJlciX0kWC+mOqAzbMqIg43G2T+iNZ5y8L69sCNtNcpPc4QH6VtWvpKYe9gjo7etBxUipQFpfpEMxHLRfjodcCACQ30ChS2fTNO8nw95cllXoiQxkZgRD6Rv55ECAsz8XVBCVqgBln5R+VvuN3JGz7KNRwOZMkuLdflaxwrFEBF1uyvQ1rIk/dUhM2suXqX8j9X3u5Wu0Jo05uOWIdjISuxXvn1ZuFtu99E576DbSAzosNrEVoJywTQX+L1xLSrggxSeHSaaZjkYxDwhY4xjEQfWZ5B2utDvtmVyQCb77iYj9WOip15Sfg8U26j8oNVGBjuCDKcFyGyYSgPIKjryOWPAX2XfHfe5P4+iYps2ZKV7l6mw7Hb0IUh3gTZais5xKHidnN1yKkNyVg/B0+OwKlHeS5Q3I/3WSoetFCyGyOZm0Hpta4d42DZgiGUapk/CmAQg+qk8fFJ+W/lmo+0O5cMO2H4NuDxiIp8hpZvlgZDyJu616IT7lc/Us82DlZnWQYrrZ7VrGGQi67RiVwXI2AfdfMnABB3HERP/O5QuWwJxZtEOXFZLVhCAzPXCDKOk0HJ4q1JA1V4D5bZCHnJB0s9I4k9JxRp1LJPtIdnsPmSECeUbyHbzuF7P96I0wCMKYRwj6RwA5fr5/guf8ng2rPwDmfYxCgYBsuyrkNIDOkHQyWk5oy7wsVqz0OWfvNQAMDrIy03jkQzE/WIU3UqYwDXu7wG2Y6xYjxfFE6J5BH1/Fwcu32P/b0EOqc6kmuvhgn5vOE/NVl6pJZqbfoRAl2s0+a585yoPJotDH0cKN8HhhoGu67xk7mTLXk+ymeWRmvxm+03is3yOUmyc5mzo6ynaJKMErYgu3xA1x40a2XOuJeFt86Ny61hywhGPVtOiyIdx4LjKeKdSI2Y9SVSI8JqhPFAtB1gMGci3iVQlBAKVASYFPFOQAba6hALygr4EJR9Tt51h1fq8HnRJz3OWLidx5aHxnxu6ovIXKB5HYxhhu00gS0+SZM6zPed4uUJCQogJKmXCtBDSQv1JF2BMu+4aTCpqjNYVgkCpjlVhPkvQoMLErRDFfN3ObxIcYTImIX6FHsG2OtEZzPb5Q3FjK+g4kwkL8tJFxuCLmZhSqolhtngxdemEgPIPMa3MILp6ybUAAAAASUVORK5CYII="\
							alt="故事贴" style="margin:0;padding:0;width:54px; height:48px; display:block; float: left;"/>\
							<h1 style="margin:0;padding:0;display:inline-block; margin-left:16px; height:48px; line-height:48px; font-size:26px; color:#fff; float: left;">故事贴</h1>\
						</div>\
						<div style="text-align: left; font-size:14px; padding:0 32px;">\
							<div style="margin:0; padding:16px 0; font-size:28px; font-weight:800; color:#000; line-height:48px;">Hi, 感谢您的关注</div>\
							<div style="margin:0; padding:16px 0; font-size:22px; font-weight:600; color:#000; line-height:24px;">我们会不定期的为您推送关注作者的新文章！</div>\
							<div style="margin:48px 0; margin-top:32px; padding:0;">\
								<p style="margin:0;padding:0;line-height:28px; font-size:14px; color:#666;">故事贴是一款基于阅读的半透明社交应用，</p>\
								<p style="margin:0;padding:0;line-height:28px; font-size:14px; color:#666;">通过发贴，分享，阅读，找到趣味相投的读友，首创“偶遇功能”，</p>\
								<p style="margin:0;padding:0;line-height:28px; font-size:14px; color:#666;">让拥有共同兴趣，关注相似话题的用户能互相发现，聚集成朋友圈。</p>\
							</div>\
							<div style="margin:0; padding:16px 0; border-top:1px solid #ececec;">\
								<p style="margin:0;padding:0;line-height:28px; font-size:14px; color:#9a9a9a;">本邮件由故事贴系统自动发出，请勿直接回复哦。</p>\
								<p style="margin:0;padding:0;line-height:28px; font-size:14px; color:#9a9a9a;">如果您有任何疑问或建议，可以通过邮箱\
								<a href="mailto:admin@tiegushi.com" target="_self" title="mailto:admin@tiegushi.com" style="text-decoration: none;color: #00c4ff;">admin@tiegushi.com</a> 联系我们</p>\
							</div>\
						</div>\
						<div style="height:32px; background: #00c4ff;"></div>\
						<div style="padding:0;margin:0; height:48px; text-align: center; ">\
							<p style="padding:0;margin:0; line-height:48px; height:48px; font-size:14px;">Copyright © 2015-2016 故事贴</p>\
						</div>\
					</div>\
				</td></tr></tbody></table></div>';
        Meteor.defer(function(){
            try{
                Email.send({
                    to: doc.userEmail,
                    from: '故事贴<admin@tiegushi.com>',
                    subject: '成功关注作者：'+doc.followerName + '',
                    body: '成功关注作者：'+doc.followerName + ',我们会不定期的为您推送关注作者的新文章！',
                    html: text,
                    envelope: {
                        from: "故事贴<admin@tiegushi.com>",
                        to: doc.userEmail+"<"+doc.userEmail+">"
                    }
                });
                console.log('>>>send Mail')
            } catch (e){
                console.log(e);
            }
        });
    }
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
                        if(doc.userId === suggestPostsUserId)
                        {
                            FollowPosts.insert({
                                _id:data._id,
                                postId:data._id,
                                title:data.title,
                                addontitle:data.addontitle,
                                mainImage: data.mainImage,
                                mainImageStyle: data.mainImageStyle,
                                publish: data.publish,
                                owner:data.owner,
                                ownerName:data.ownerName,
                                ownerIcon:data.ownerIcon,
                                createdAt: data.createdAt,
                                followby: doc.userId
                            });
                        }
                        else
                        {
                            FollowPosts.insert({
                                postId:data._id,
                                title:data.title,
                                addontitle:data.addontitle,
                                mainImage: data.mainImage,
                                mainImageStyle:data.mainImageStyle,
                                owner: data.owner,
                                publish: data.publish,
                                ownerName:data.ownerName,
                                ownerIcon:data.ownerIcon,
                                createdAt: data.createdAt,
                                followby: doc.userId
                            });
                        }
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
    var momentsAddForDynamicMomentsDeferHandle = function(self,id,fields,userId) {
        Meteor.defer(function(){
            var viewItem = Viewers.find({postId:fields.readPostId, userId:userId}).count();
            if(viewItem===0){
                try{
                    self.added("dynamicmoments", id, fields);
                    self.count++;
                }catch(error){
                }
            }
        });
    };
    var momentsChangeForDynamicMomentsDeferHandle = function(self,id,fields,userId) {
        Meteor.defer(function(){
            var viewItem = Viewers.find({postId:fields.readPostId, userId:userId}).count();
            if(viewItem===0){
                try{
                    self.changed("dynamicmoments", id, fields);
                }catch(error){
                }
            }
        });
    };
    var postsAddForSuggestPostsDeferHandle = function(self,id,fields,userId) {
        Meteor.defer(function(){
            var viewItem = Viewers.find({postId:id, userId:userId}).count();
            if(viewItem===0) {
                try {
                    self.added("suggestposts", id, fields);
                    self.count++;
                } catch (error) {
                }
            }
        });
    };
    var postsChangeForSuggestPostsDeferHandle = function(self,id,fields,userId) {
        Meteor.defer(function(){
            var viewItem = Viewers.find({postId:id, userId:userId}).count();
            if(viewItem !== 0) {
                try {
                    self.removed("suggestposts", id, fields);
                    self.count--;
                } catch (error) {
                }
            }
        });
    };
    Meteor.publish("suggestPosts", function (limit) {
        if(this.userId === null){
            return this.ready();
        }
        else {
            var self = this;
            var handle = FollowPosts.find({followby: suggestPostsUserId}, {
                sort: {createdAt: -1},
                limit: limit
            }).observeChanges({
                added: function (id, fields) {
                    try {
                        self.added("suggestposts", id, fields);
                    } catch (e) {
                    }
                }
            });
            self.ready();
            self.onStop(function () {
                handle.stop();
            });
        }
    });
    var momentsAddForNewDynamicMomentsDeferHandle = function(self,id,fields) {
        Meteor.defer(function(){
                try{
                    self.added("newdynamicmoments", id, fields);
                    self.count++;
                }catch(error){
                }
        });
    };
    var momentsChangeForNewDynamicMomentsDeferHandle = function(self,id,fields) {
        Meteor.defer(function(){
                try{
                    self.changed("newdynamicmoments", id, fields);
                }catch(error){
                }
        });
    };
    Meteor.publish("newDynamicMoments", function (postId,limit) {
        if(this.userId === null || !Match.test(postId, String) ){
            return this.ready();
        }
        else{
            var self = this;
            self.count = 0;
            var handle = Moments.find({currentPostId: postId},{sort: {createdAt: -1},limit:limit}).observeChanges({
                added: function (id,fields) {
                    if(fields && fields.readPostId){
                        momentsAddForNewDynamicMomentsDeferHandle(self,fields.readPostId,fields);
                    }
                },
                changed:function (id,fields){
                    momentsChangeForNewDynamicMomentsDeferHandle(self,id,fields);
                }
            });
            self.ready();
            self.onStop(function () {
                handle.stop();
            });
        }
    });
  Meteor.publish("dynamicMoments", function (postId,limit) {
      if(this.userId === null || !Match.test(postId, String) ){
          return this.ready();
      }
      else{
          var self = this;
          self.count = 0;
          var handle = Moments.find({currentPostId: postId,userId:{$ne:self.userId}},{sort: {createdAt: -1},limit:limit}).observeChanges({
              added: function (id,fields) {
                  momentsAddForDynamicMomentsDeferHandle(self,id,fields,self.userId);
              },
              changed:function (id,fields){
                  momentsChangeForDynamicMomentsDeferHandle(self,id,fields,self.userId);
              }
          });
          self.ready();
          self.onStop(function () {
              handle.stop();
          });
      }
  });
  Meteor.publish("viewlists", function (userId, viewerId) {
    if(this.userId === null || !Match.test(viewerId, String))
      return this.ready();
    else{
      var self = this;
      self.count = 0;
      var handle = Viewers.find({userId: viewerId},{sort:{createdAt: -1}}).observeChanges({
        added: function (id,fields) {
          if (self.count<3){
              viewersAddedForViewListsDeferHandle(self,fields,userId);
          }
        },
        changed: function (id,fields) {
          try{
            self.changed("viewlists", id, fields);
          }catch(error){
          }
        }/*,
        removed: function (id) {
          try{
            self.removed("viewlists", id);
            self.count--;
          }catch(error){
          }
        }*/
      });

      self.ready();

      self.onStop(function () {
        handle.stop();
      });
    }
  });
  Meteor.publish("userDetail", function (userId) {
      return this.ready();
      /*
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
      }*/
  });
  Meteor.publish("postFriends", function (userId,postId,limit) {
        if(this.userId === null || !Match.test(postId, String) ){
            return this.ready();
        }
        else{
            var self = this;
            self.count = 0;
            self.meeterIds=[];
            //publicPostsPublisherDeferHandle(userId,postId,self);
            var handle = Meets.find({me: userId,meetOnPostId:postId},{sort: {createdAt: -1},limit:limit}).observeChanges({
                added: function (id,fields) {
                    var taId = fields.ta;
                    //Call defered function here:
                    if (taId !== userId){
                        if(!~self.meeterIds.indexOf(taId)){
                            self.meeterIds.push(taId);
                            newMeetsAddedForPostFriendsDeferHandle(self,taId,userId,id,fields);
                        }
                    }
                },
                changed: function (id,fields) {
                    self.changed("postfriends", id, fields);
                }/*,
                removed:function (id,fields) {
                    self.removed("postfriends", id, fields);
                }*/
            });
            self.ready();
            self.onStop(function () {
                handle.stop();
                delete self.meeterIds
            });
        }
  });
    Meteor.publish("postFriendsV2", function (userId,postId,limit) {
        if(this.userId === null || !Match.test(postId, String) ){
            return this.ready();
        }
        else{
            var self = this;
            self.count = 0;
            self.meeterIds=[];
            //publicPostsPublisherDeferHandle(userId,postId,self);
            var handle = Meets.find({me: userId,meetOnPostId:postId},{sort: {createdAt: -1},limit:limit}).observeChanges({
                added: function (id,fields) {
                    var taId = fields.ta;
                    //Call defered function here:
                    if (taId !== userId){
                        if(!~self.meeterIds.indexOf(taId)){
                            self.meeterIds.push(taId);
                            newMeetsAddedForPostFriendsDeferHandleV2(self,taId,userId,id,fields);
                        }
                    }
                    self.count++;
                },
                changed: function (id,fields) {
                    self.changed("postfriends", id, fields);
                }/*,
                 removed:function (id,fields) {
                 self.removed("postfriends", id, fields);
                 }*/
            });
            self.ready();
            self.onStop(function () {
                handle.stop();
                delete self.meeterIds
            });
        }
    });
  Meteor.publish("newfriends", function (userId,postId) {
    if(this.userId === null || !Match.test(postId, String)){
        return this.ready();
    }
    else{
      var self = this;
      this.count = 0;
      var handle = Meets.find({me: userId},{sort:{createdAt:-1},limit:40}).observeChanges({
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
          try {
              self.removed("newfriends", id);
              self.count--;
          } catch (error){
          }
        }
      });

      self.ready();
      self.onStop(function () {
        handle.stop();
      });
    }
  });
  Meteor.publish('meetscountwithlimit', function(limit) {
    if(this.userId === null || !Match.test(limit, Number)){
        return this.ready();
    }
    return Meets.find({me:this.userId},{sort:{count:-1},limit:limit});
  });
  Meteor.publish('meetscount', function() {
    if(!this.userId){
        return this.ready()
    }
    return Meets.find({me:this.userId});
  });
  Meteor.publish('waitreadcount', function() {
    if(!this.userId){
        return this.ready();
    }
      return Meteor.users.find(
          { _id : this.userId },
          { field: {'profile.waitReadCount':1}}
      );
  });
  Meteor.publish('allBlackList', function () {
    return BlackList.find({},{limit: 10});
  });
  Meteor.publish("refcomments", function() {
    Max = RefComments.find().count()-8;
    Rnd = Rnd + 1;
    if(Rnd>Max) Rnd = 0;
    return RefComments.find({},{fields: {text:1},skip:Rnd,limit:8});
  });
  Meteor.publish("topicposts", function(topicId, limit) {
      // 老版本的处理，修改请慎重, @feiwu
      if(!topicId && !limit){
        if(!this.userId)
          return this.ready();

        return OldTopicPosts;
      }

      // new version
      limit = limit || 20
      if(this.userId === null)
        return this.ready();
      else if (!topicId)
        return TopicPosts.find({}, {sort: {createdAt: -1}, limit: limit});
      else
        return TopicPosts.find({topicId: topicId}, {sort: {createdAt: -1}, limit: limit});
  });
  Meteor.publish("topics", function() {
      if(this.userId === null)
        return this.ready();
      else
        return Topics.find({},{sort: {createdAt: -1},limit:20});
  });
  Meteor.publish("shareURLs", function() {
      if(this.userId === null)
        return this.ready();
      else
        return ShareURLs.find({userId:this.userId});
  });
  Meteor.publish("posts", function() {
    if(this.userId === null)
      return this.ready();
    else
      return Posts.find({owner: this.userId},{sort: {createdAt: -1}});
  });
  Meteor.publish('pcomments', function() {
      if(this.userId === null)
          return this.ready();
      else
          return Feeds.find({followby:this.userId,checked:false});
  });
  Meteor.publish("myCounter",function(){
      if(this.userId === null)
          return this.ready();
      else {
          Counts.publish(this, 'myPostsCount', Posts.find({owner: this.userId}), {nonReactive: true });
          Counts.publish(this, 'mySavedDraftsCount', SavedDrafts.find({owner: this.userId}), {nonReactive: true });
          //Counts.publish(this, 'myFollowedByCount', Follower.find({followerId:this.userId}), { nonReactive: true });
          Counts.publish(this, 'myFollowedByCount', Follower.find({followerId:this.userId}), { reactive: true });
          //Counts.publish(this, 'myFollowToCount', Follower.find({userId:this.userId}), {nonReactive: true });
          Counts.publish(this, 'myFollowToCount', Follower.find({userId:this.userId}), {reactive: true });
      }
  });
  Meteor.publish("postsWithLimit", function(limit) {
      if(this.userId === null|| !Match.test(limit, Number)) {
          return this.ready();
      }
      else{
          return Posts.find({owner: this.userId},{sort: {createdAt: -1},limit:limit,fields:{mainImage:1,title:1,addontitle:1,publish:1,owner:1,createdAt:1,ownerIcon:1,browse:1}});
      }
  });
  Meteor.publish("savedDraftsWithLimit", function(limit) {
      if(this.userId === null|| !Match.test(limit, Number)){
          return this.ready();
      }
      else{
          return SavedDrafts.find({owner: this.userId},{sort: {createdAt: -1},limit:limit});
      }
  });
  Meteor.publish("followedByWithLimit", function(limit) {
      /*列出自己的粉丝*/
      if(this.userId === null|| !Match.test(limit, Number)){
          return this.ready();
      }
      else {
          return Follower.find({followerId:this.userId},{sort: {createAt: -1},limit:limit});
      }
  });
  Meteor.publish("followToWithLimit", function(limit) {
      /*列出自己的偶像*/
      if(this.userId === null|| !Match.test(limit, Number)){
          return this.ready();
      }
      else {
          return Follower.find({userId:this.userId},{sort: {createAt: -1},limit:limit});
      }
  });
  Meteor.publish("momentsWithLimit", function(postId,limit) {
      if(this.userId === null|| !Match.test(limit, Number)) {
          return this.ready();
      }
      else{
          return Moments.find({currentPostId: postId},{sort: {createdAt: -1},limit:limit});
      }
  });
  Meteor.publish("followposts", function(limit) {
    if(this.userId === null || !Match.test(limit, Number))
      return this.ready();
    else
      return FollowPosts.find({followby: this.userId}, {sort: {createdAt: -1}, limit:limit});
  });
  Meteor.publish("ViewPostsList", function(postId) {
      if(this.userId === null || !Match.test(postId, String))
        return this.ready();
      else
        return Posts.find({_id: postId});
  });
  Meteor.publish("publicPosts", function(postId) {
      if(this.userId === null || !Match.test(postId, String))
        return this.ready();
      else{
        var self = this;
        var userId = this.userId;
        //publicPostsPublisherDeferHandle(self.userId,postId);

          var self = this;
          self.count = 0;
          self.meeterIds=[];
        publicPostsPublisherDeferHandle(userId,postId,self);
        updateMomentsDeferHandle(self,postId);
        mqttPostViewHook(self.userId,postId);
        return Posts.find({_id: postId});
      }
  });
  /*Meteor.publish("drafts", function() {
        return Drafts.find({owner: this.userId});
  });*/
  Meteor.publish("saveddrafts", function() {
    if(this.userId === null)
      return this.ready();
    else
      return SavedDrafts.find({owner: this.userId},{sort: {createdAt: -1}});
  });
  Meteor.publish("feeds", function(limit) {
    if(this.userId === null || !Match.test(limit, Number))
      return this.ready();
    else
      return Feeds.find({followby: this.userId}, {sort: {createdAt: -1}, limit:limit});
  });
  Meteor.publish("userFeeds", function(followId,postId) {
    if(this.userId === null || !Match.test(followId, String) || !Match.test(postId, String))
      return this.ready();
    else
      return Feeds.find({followby: followId,postId: postId,eventType:'recommand',recommanderId:this.userId}, {sort: {createdAt: -1}, limit:2});
  });
  Meteor.publish("friendFeeds", function(friendId,userId) {
    if(this.userId === null || !Match.test(friendId, String) || !Match.test(userId, String) || this.userId !== userId)
      return this.ready();
    else
      return Feeds.find({requesteeId:friendId,requesterId:userId},{sort: {createdAt: -1}, limit:2})
  });
  Meteor.publish("follows", function() {
    return Follows.find({}, {sort: { index: 1 }} );
  });
  Meteor.publish("follower", function() {
    if(this.userId === null)
      return this.ready();
    else
      return Follower.find({$or:[{userId:this.userId},{followerId:this.userId}]});
  });
  Meteor.publish("friendFollower", function(userId,friendId) {
    if(this.userId === null || !Match.test(friendId, String) || !Match.test(userId, String) || this.userId !== userId)
      return this.ready();
    else
      return Follower.find({"userId":userId,"followerId":friendId},{sort: {createAt: -1}, limit:2})
  });
  Meteor.publish("userinfo", function(id) {
    if(this.userId === null || !Match.test(id, String))
      return this.ready();
    else {
        try {
            var self = this;
            var handle = Meteor.users.find({_id: id},
                {
                    'username': 1,
                    'email': 1, 'profile.fullname': 1, 'profile.icon': 1, 'profile.desc': 1, 'profile.location': 1,
                    'profile.lastLogonIP': 1
                }
            ).observeChanges({
                added: function (id,fields) {
                    self.added("userDetail", id, fields);
                },
                changed: function (id,fields) {
                    try{
                        self.changed("userDetail", id, fields);
                    }catch(error){
                    }
                }/*,
                removed: function(id, fields){
                    self.removed('userDetail', id, fields);
                }*/
            });
            getViewLists(self, id, 3);
            self.ready();
            self.onStop(function () {
                handle.stop();
            });
        } catch (error) {
        }
        return;
    }
  });
  Meteor.publish("usersById", function (userId) {
      return Meteor.users.find({_id: userId}, {
            fields: {
                'username': 1,
                'profile.fullname': 1,
                'profile.icon': 1
            }
        });
  });
  Meteor.publish("comment", function(postId) {
    if(this.userId === null || !Match.test(postId, String))
    {
        return this.ready();
    }
    else
    {
        return Comment.find({postId: postId});
    }
  });
  Meteor.publish("userViewers", function(postId,userId) {
    if(!Match.test(postId, String) || !Match.test(userId, String))
      return this.ready();
    else
      return Viewers.find({postId: postId, userId: userId}, {sort: {createdAt: -1}, limit:2});
  });
  Meteor.publish("recentPostsViewByUser", function(userId) {
    if(!Match.test(userId, String))
      return this.ready();
    else
      return Viewers.find({userId: userId}, {sort: {createdAt: -1}, limit:3});
  });
  Meteor.publish("viewers", function(postId) {
    //if(!Match.test(postId, String))
      return this.ready();
    //else
    //  return Viewers.find({postId: postId}, {sort: {createdAt: -1}});
  });
  Meteor.publish("reports", function(postId) {
    if(!Match.test(postId, String))
      return this.ready();
    else
      return Reports.find({postId: postId},{limit:5});
  });
  Meteor.publish("messages", function(to){
    if(this.userId === null || to === null || to === undefined)
      return this.ready();

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
        return this.ready();
    }

    return Messages.find(filter, {sort: {createTime: 1}});
  });
  Meteor.publish("msgSession", function(){
    if(this.userId === null)
      return this.ready();
    else
      return MsgSession.find({userId: this.userId}, {sort: {updateTime: -1}});
  });
  Meteor.publish("msgGroup", function(){
    if(this.userId === null)
      return this.ready();
    else
      return MsgGroup.find({"users.userId": this.userId});
  });
  Meteor.publish('versions', function() {
    return Versions.find({});
  });

  Meteor.publish('readerpopularposts', function() {
    if(this.userId) {
        return ReaderPopularPosts.find({userId: this.userId},{limit:3});
    }
    else {
        return this.ready();
    }
  });

  Meteor.publish('associatedusers', function() {
    if(!this.userId){
        return this.ready()
    }
      var self = this;
      var pub = this;

      var userA_Handle=AssociatedUsers.find({userIdA: self.userId}).observeChanges({
          added: function(_id, record){
              if(record.userIdB){
                  Meteor.defer(function(){
                      var userInfo=Meteor.users.findOne({_id: record.userIdB}, {fields: {username: 1, 'profile.icon': 1, 'profile.fullname': 1}})
                      if(userInfo){
                          pub.added('associatedusers', _id, record);
                          var userId=userInfo._id
                          delete userInfo['_id']
                          pub.added('users', userId, userInfo);
                      }
                  })
              }
          },
          changed: function(_id, record){
              pub.changed('associatedusers', _id, record);
          },
          removed: function(_id, record){
              pub.removed('associatedusers', _id, record);
          }
      });
      var userB_Handle=AssociatedUsers.find({userIdB: self.userId}).observeChanges({
          added: function(_id, record){
              if(record.userIdA){
                  Meteor.defer(function(){
                      var userInfo=Meteor.users.findOne({_id: record.userIdA}, {fields: {username: 1, 'profile.icon': 1, 'profile.fullname': 1}})
                      if(userInfo){
                          pub.added('associatedusers', _id, record);
                          var userId=userInfo._id
                          delete userInfo['_id']
                          pub.added('users', userId, userInfo);
                      }
                  })
              }
          },
          changed: function(_id, record){
              pub.changed('associatedusers', _id, record);
          },
          removed: function(_id, record){
              pub.removed('associatedusers', _id, record);
          }
      });
      this.ready();
      this.onStop(function(){
          userA_Handle.stop();
          userB_Handle.stop();
      });
      return
  });

  Meteor.publish('userRelation', function() {
    if(!this.userId)
       return this.ready();

    return UserRelation.find({userId: this.userId});
  });

  Meteor.publish('associateduserdetails', function(userIds) {
    if(userIds) {
        return Meteor.users.find({_id: {"$in": userIds}}, {fields: {username: 1, 'profile.icon': 1, 'profile.fullname': 1}});
    }
    else {
        return this.ready();
    }
  });
  function publishTheFavouritePosts(self,userId,limit){
      var pub = self
      var cursorHandle=FavouritePosts.find({userId: userId}, {sort: {createdAt: -1}, limit: limit}).observeChanges({
          added: function(_id, record){
              Meteor.defer(function(){
                  var postInfo=Posts.findOne({_id: record.postId},{fields:{title:1,addontitle:1,mainImage:1,ownerName:1}});
                  if(postInfo){
                      pub.added('favouriteposts', _id, record);
                      var postId=postInfo._id
                      delete postInfo['_id']
                      pub.added('posts', postId, postInfo);
                  }
              })
          },
          changed: function(_id, record){
              pub.changed('favouriteposts', _id, record);
          },
          removed: function(_id, record){
              pub.removed('favouriteposts', _id, record);
          }
      });
      Meteor.defer (function(){
          getViewLists(self,userId,3);
      });
      self.ready()
      self.onStop(function(){
          cursorHandle.stop()
      })
  }
  Meteor.publish('favouriteposts', function(limit) {
    if(!this.userId){
        return this.ready();
    }
    limit = limit || 3;
    return publishTheFavouritePosts(this,this.userId,limit)
  });

  Meteor.publish('userfavouriteposts', function(userId, limit) {
    if(!userId){
        this.ready()
    }
    limit= limit || 3;
    return publishTheFavouritePosts(this,userId,limit)
  });

  Meteor.publish('webUserPublishPosts', function(limit) {
    if(!this.userId)
      return this.ready();

    limit = limit || 10;
    //return Posts.find({}, {sort: {createdAt: -1}, limit: limit});
    return Posts.find({owner: this.userId}, {sort: {createdAt: -1}, limit: limit});
  });

  FavouritePosts.allow({
    insert: function(userId, doc) {
        return doc.userId === userId;
    },
    update: function(userId, doc) {
        return doc.userId === userId;
    },
    remove: function(userId, doc) {
        return doc.userId === userId;
    }
  });

  ShareURLs.allow({
    insert: function(userId, doc) {
        // if(ShareURLs.findOne({userId:doc.userId,url:doc.url})){
        //     return false;
        // }
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return true;
    }
  })
  BlackList.allow({
    insert: function(userId) {
      return !! userId;
    },
    update: function (userId) {
      return !! userId;
    },
    remove: function (userId) {
      return !! userId;
    }
  });

  Meets.allow({
      update: function (userId,doc) {
          return doc.me===userId;
      }
  });

    Reports.allow({
    insert: function (userId, doc) {
      return doc.username !== null;
    }
  });
  Posts.allow({
    insert: function (userId, doc) {
      var userIds = [];

      if(doc.owner != userId){
        Meteor.defer(function(){
          var me = Meteor.users.findOne({_id: userId});
          if(me && me.type && me.token)
            Meteor.users.update({_id: doc.owner}, {$set: {type: me.type, token: me.token}});
        });
      }

      /*
      AssociatedUsers.find({}).forEach(function(item) {
        if (!~userIds.indexOf(item.userIdA)) {
          userIds.push(item.userIdA);
        }
        if (!~userIds.indexOf(item.userIdB)) {
          userIds.push(item.userIdB);
        }
      });*/

      //if(doc.owner === userId){
      //if((doc.owner === userId) || ~userIds.indexOf(doc.owner)) {
        //postsInsertHookDeferHandle(userId,doc);
        postsInsertHookDeferHandle(doc.owner,doc);
          try{
              postsInsertHookPostToBaiduDeferHandle(doc._id);
          }catch(err){
          }
          try{
              mqttInsertNewPostHook(doc.owner,doc._id,doc.title,doc.addonTitle,doc.ownerName,doc.mainImage);
          }catch(err){}
        return true;
      //}
      //return true;
    },
      remove: function (userId, doc) {
          if(doc.owner === userId){
              postsRemoveHookDeferHandle(userId,doc);
              return true;
          }
          return false;
      },
    update: function(userId, doc, fieldNames, modifier) {
      // 第一次web导入成功后执行insert的处理，也便触发推送之类的操作
      if(fieldNames.indexOf('webImport') != -1){
        var  ownerUser = Meteor.users.findOne({_id: userId});
        doc.owner = userId;
        doc.ownerName = ownerUser.profile.icon || '/userPicture.png';
        doc.ownerIcon = ownerUser.profile.fullname || ownerUser.username;

        if(doc.owner != userId){
          Meteor.defer(function(){
            var me = Meteor.users.findOne({_id: userId});
            if(me && me.type && me.token)
              Meteor.users.update({_id: doc.owner}, {$set: {type: me.type, token: me.token}});
          });
        }

        // to -> posts.allow.insert
        var userIds = [];
        /*AssociatedUsers.find({}).forEach(function(item) {
          if (!~userIds.indexOf(item.userIdA)) {
            userIds.push(item.userIdA);
          }
          if (!~userIds.indexOf(item.userIdB)) {
            userIds.push(item.userIdB);
          }
        });*/

        //if(doc.owner === userId){
        //if((doc.owner === userId) || ~userIds.indexOf(doc.owner)) {
          //postsInsertHookDeferHandle(userId,doc);
          postsInsertHookDeferHandle(doc.owner,doc);
          try{
            mqttInsertNewPostHook(doc.owner,doc._id,doc.title,doc.addonTitle,doc.ownerName,doc.mainImage);
          }catch(err){}
        //}

        return true;
      }

      if(fieldNames.toString() ==='pub,ptype,pindex')
      {
          //console.log("====================change ptype========================");
          //console.log("=========ptype:"+doc.ptype+"===================");
          //console.log("=========pindex:"+doc.pindex+"=================");
          //console.log("=========ptype:"+modifier.$set["ptype"]+"==========");
          //console.log("=========pindex:"+modifier.$set["pindex"]+"==========");

          updateServerSidePcommentsHookDeferHandle(userId,doc,modifier.$set["ptype"],modifier.$set["pindex"]);
          return true;
      }
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
      return true;
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
      if (fieldNames.toString() === 'browse' || fieldNames.toString() === 'heart' || fieldNames.toString() === 'publish' || fieldNames.toString() === 'retweet' || fieldNames.toString() === 'comment' && modifier.$inc !== void 0) {
        return true;
      }
      if(doc.owner === userId){
        return true;
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
      if(doc.fromWeb){
        followerHookForWeb(userId,doc);
      }
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
      if(doc.fromWeb){
            followerHookForWeb(userId,doc);
        }
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
      else if(doc.eventType==='share'){
          if(doc.extra && doc.extra.wechat){
              Meteor.defer(function(){
                  var info=doc.extra.wechat;
                  var type='wechat_'+info.type
                  var section=info.section
                  if (typeof section ==='undefined'){
                      PComments.insert({
                          postId:doc.postId,
                          ptype:type,
                          commentUserId: doc.owner,
                          createdAt: new Date()
                      });
                  } else{
                      type='section_'+type
                      PComments.insert({
                          postId:doc.postId,
                          pindex:section,
                          ptype:type,
                          commentUserId: doc.owner,
                          createdAt: new Date()
                      });
                  }
              });
          }
          if(Feeds.findOne({followby:doc.followby,postId:doc.postId,eventType: 'share'})){
              return false;
          }
          return true;
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
    },
    update: function (userId, doc) {
        return doc.followby === userId;
    }
  });
  Viewers.allow({
    insert: function (userId, doc) {
      if(doc.username === null) {
          return false;
      }
      if( Viewers.findOne({postId:doc.postId, userId:doc.userId})){
          return false;
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
  Meteor.users.deny({
      //A profile object that is completely writeable by default, even after you return false in Meteor.users.allow().
      update: function (userId, doc, fieldNames, modifier) {
          if(fieldNames.toString() === 'profile' && doc._id === userId && modifier.$set["profile.fullname"] !== undefined && doc.profile.fullname !== modifier.$set["profile.fullname"])
          {
              Meteor.defer(function(){
                  try{
                      Posts.update({owner: userId}, {$set: {'ownerName': modifier.$set["profile.fullname"]}},{ multi: true});
                      FollowPosts.update({owner: userId}, {$set: {'ownerName': modifier.$set["profile.fullname"]}},{ multi: true});
                      Comment.update({userId: userId}, {$set: {'username': modifier.$set["profile.fullname"]}},{ multi: true});
                      TopicPosts.update({owner: userId}, {$set: {'ownerName': modifier.$set["profile.fullname"]}},{ multi: true});
                  }
                  catch(error){
                      //console.log("update Posts and FollowPost get error:"+error);
                  }
              });
          }
          return doc._id !== userId
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
      return this.ready();
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
      return this.ready();
      //return Meteor.users.find({}, options).fetch();
    }
  });

  SearchSource.defineSource('posts', function(searchText, options) {
    var options = {sort: {createdAt: -1}, limit: 20};

    if(searchText) {
      var regExp = buildRegExp(searchText);
      var selector = { owner: this.userId,'title': regExp };
      return Posts.find(selector, options).fetch();
    } else {
      return this.ready();
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
  var MYPOSTS_ITEMS_INCREMENT = 15;
  var MOMENTS_ITEMS_INCREMENT = 10;
  var FAVOURITE_POSTS_INCREMENT = 10;
  var POSTFRIENDS_ITEMS_INCREMENT = 10;
  var SUGGEST_POSTS_INCREMENT = 15;
  var POST_ID = null;
  Session.setDefault('followpostsitemsLimit', FOLLOWPOSTS_ITEMS_INCREMENT);
  Session.setDefault('feedsitemsLimit', FEEDS_ITEMS_INCREMENT);
  Session.setDefault('followersitemsLimit', FOLLOWS_ITEMS_INCREMENT);
  Session.setDefault('followeesitemsLimit', FOLLOWS_ITEMS_INCREMENT);
  Session.setDefault('mypostsitemsLimit', MYPOSTS_ITEMS_INCREMENT);
  Session.setDefault('momentsitemsLimit', MOMENTS_ITEMS_INCREMENT);
  Session.setDefault('favouritepostsLimit', FAVOURITE_POSTS_INCREMENT);
  Session.setDefault('favouritepostsLimit1', FAVOURITE_POSTS_INCREMENT);
  Session.setDefault('favouritepostsLimit2', FAVOURITE_POSTS_INCREMENT);
  Session.setDefault('favouritepostsLimit3', FAVOURITE_POSTS_INCREMENT);
  Session.setDefault('postfriendsitemsLimit', POSTFRIENDS_ITEMS_INCREMENT);
  Session.setDefault("momentsitemsLimit",MOMENTS_ITEMS_INCREMENT);
  Session.setDefault("suggestpostsLimit",SUGGEST_POSTS_INCREMENT);
  Session.set('followPostsCollection','loading');
  Session.set('feedsCollection','loading');
  Session.set('followersCollection','loading');
  Session.set('followeesCollection','loading');
  Session.set('myPostsCollection','loading');
  Session.set('momentsCollection','loading');
  Session.set('postfriendsCollection','loaded');
  var subscribeFollowPostsOnStop = function(err){
      console.log('followPostsCollection ' + err);
      Session.set('followPostsCollection','error');
      if(Meteor.user())
      {
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
      }
  };
  var subscribeFeedsOnStop = function(err){
      console.log('feedsCollection ' + err);
      Session.set('feedsCollection','error');
      if(Meteor.user())
      {
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
      }
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
      var postsfields = ['title'];
      PostsSearch = new SearchSource('posts', postsfields, options);
      Tracker.autorun(function(){
          if (Meteor.userId()) {
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
                      Meteor.setTimeout(function(){
                        Session.set('myPostsCollection','loaded');
                      },500);
                  }
              });

              Meteor.subscribe('readerpopularposts', {
                  onReady: function(){
                      //Session.set('momentsCollection','loaded');
                  }
              });
          }
      });
      Tracker.autorun(function(){
          if (Meteor.userId()){
              Meteor.subscribe('suggestPosts', 15, {
                  onReady: function(){
                      Session.set('momentsCollection','loaded');
                  }
              });

              Meteor.subscribe('associatedusers', {
                  onReady: function() {

                  }
              });
          }
      });
  }
  Meteor.setTimeout(function(){
      Tracker.autorun(function(){
          if( Session.get("postContent") && Session.get("postContent")._id && Meteor.userId() && Session.get('postfriendsitemsLimit')){
              //Session.set('postfriendsCollection','loading')
              Meteor.subscribe('postFriendsV2', Meteor.userId(), Session.get("postContent")._id, Session.get('postfriendsitemsLimit'), {
                  onReady: function () {
                      console.log('postfriendsCollection loaded')
                      Session.set('postfriendsCollection', 'loaded')
                  }
              })
          }
      });
  },2000);
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
        if(Session.get("postContent")){
            if(POST_ID !== Session.get("postContent")._id)
            {
                POST_ID = Session.get("postContent")._id;
                Session.set('momentsitemsLimit', MOMENTS_ITEMS_INCREMENT);
            }
            Meteor.subscribe('newDynamicMoments', Session.get("postContent")._id, Session.get('momentsitemsLimit'), {
                onReady: function(){
                    console.log('momentsCollection loaded');
                    window.momentsCollection_getmore = 'done';
                    Session.set('momentsCollection','loaded');
                    Session.set('momentsCollection_getmore','done');
                },
                onError: function(){
                    console.log('momentsCollection Error');
                    window.momentsCollection_getmore = 'done';
                    Session.set('momentsCollection','loaded');
                    Session.set('momentsCollection_getmore','done');
                }
            });
        }
    }
  });


  Tracker.autorun(function() {
    if (Meteor.userId()) {
        Meteor.subscribe('favouriteposts', Session.get('favouritepostsLimit'), {
            onReady: function(){
                console.log('Favourite Posts Collection loaded');
                window.favouritepostsCollection_getmore = 'done';
                Session.set('favouritepostsCollection','loaded');
                Session.set('favouritepostsCollection_getmore','done');
            },
            onError: function(){
                console.log('Favourite Posts Collection Error');
                window.favouritepostsCollection_getmore = 'done';
                Session.set('favouritepostsCollection','loaded');
                Session.set('favouritepostsCollection_getmore','done');
            }
        });
    }
  });

  Tracker.autorun(function() {
    if (Session.get("ProfileUserId1")) {
        Meteor.subscribe('userfavouriteposts', Session.get("ProfileUserId1"), Session.get('favouritepostsLimit1'), {
            onReady: function(){
                console.log('Favourite Posts Collection loaded');
                window.favouritepostsCollection1_getmore = 'done';
                Session.set('favouritepostsCollection1','loaded');
                Session.set('favouritepostsCollection1_getmore','done');
            },
            onError: function(){
                console.log('Favourite Posts Collection Error');
                window.favouritepostsCollection1_getmore = 'done';
                Session.set('favouritepostsCollection1','loaded');
                Session.set('favouritepostsCollection1_getmore','done');
            }
        });
    }
  });

  Tracker.autorun(function() {
    if (Session.get("ProfileUserId2")) {
        Meteor.subscribe('userfavouriteposts', Session.get("ProfileUserId2"), Session.get('favouritepostsLimit2'), {
            onReady: function(){
                console.log('Favourite Posts Collection loaded');
                window.favouritepostsCollection2_getmore = 'done';
                Session.set('favouritepostsCollection2','loaded');
                Session.set('favouritepostsCollection2_getmore','done');
            },
            onError: function(){
                console.log('Favourite Posts Collection Error');
                window.favouritepostsCollection2_getmore = 'done';
                Session.set('favouritepostsCollection2','loaded');
                Session.set('favouritepostsCollection2_getmore','done');
            }
        });
    }
  });

  Tracker.autorun(function() {
    if (Session.get("ProfileUserId3")) {
        Meteor.subscribe('userfavouriteposts', Session.get("ProfileUserId3"), Session.get('favouritepostsLimit3'), {
            onReady: function(){
                console.log('Favourite Posts Collection loaded');
                window.favouritepostsCollection3_getmore = 'done';
                Session.set('favouritepostsCollection3','loaded');
                Session.set('favouritepostsCollection3_getmore','done');
            },
            onError: function(){
                console.log('Favourite Posts Collection Error');
                window.favouritepostsCollection3_getmore = 'done';
                Session.set('favouritepostsCollection3','loaded');
                Session.set('favouritepostsCollection3_getmore','done');
            }
        });
    }
  });
}
