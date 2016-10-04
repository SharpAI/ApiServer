/**
 * Created by simba on 10/3/16.
 */
if (Meteor.isServer){
    var socialDataOfSection = function (section,userId){
        var item={};
        var hasSocialData=false;
        var socialKeywords = ['likeSum','dislikeSum','likeUserId','dislikeUserId','pcomments'];

        for (var prop in section) {
            if (section.hasOwnProperty(prop)) {

                if(socialKeywords.indexOf(prop.toString()) > -1){
                    hasSocialData = true;
                    console.log(JSON.stringify(section[prop]));
                    if(prop.toString().indexOf('UserId')>-1){
                        console.log( 'User Like/Dislike ID' + section[prop][userId]);
                        for(var userid in section[prop]){
                            if(userid.toString() === userId){
                                console.log('Posted comment on the same post:'+userId)
                            } else {
                                console.log('Posted comment NOT on the same post:'+userid+'!=='+userId);
                                delete section[prop][userid];
                            }
                        }
                        if(section[prop].length > 0){
                            console.log('We need return this user id back:'+ JSON.stringify(section[prop]));
                            section[prop]['userId'] = true;
                            item[prop.toString()] = section[prop];
                        }
                    } else {
                        item[prop.toString()] = section[prop];
                    }
                }
            }
        }

        if(hasSocialData){
            return item;
        } else{
            return false;
        }
    };
    getSocialDataFromPostId = function(postId,userId){
        var post = Posts.findOne({_id: postId});
        if(!post){
            return [];
        }
        var socialData=[];
        var pub = post.pub;

        pub.forEach(function(item,index){
            if(item && item.type && item.type === 'text'){
                var data=socialDataOfSection(item,userId);
                if(data){
                    data.index = index;
                    socialData.push(data);
                }
            }
        });
        console.log(socialData);
        return socialData;
    };
    updateServerSidePcommentsHookDeferHandle = function(userId,doc,ptype,pindex){
        Meteor.defer(function(){
            try{
                var set_notifiedUsersId = [];
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
                            if (['pcomments', 'like', 'dislike'].indexOf(ptype) > -1 && needRemove === false && set_notifiedUsersId.indexOf(data.commentUserId) === -1) {
                                set_notifiedUsersId.push(data.commentUserId);
                                sendEmailToSubscriber(ptype, pindex, doc._id, userId, data.commentUserId);
                            }

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
                            var dataUser = Meteor.users.findOne({_id:doc.owner});
                            var waitReadCount = dataUser && dataUser.profile && dataUser.profile.waitReadCount ? dataUser.profile.waitReadCount : 0;
                            // var waitReadCount = Meteor.users.findOne({_id: doc.owner}).profile.waitReadCount;
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
}