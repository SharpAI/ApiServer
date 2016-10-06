/**
 * Created by simba on 10/5/16.
 */

if(Meteor.isServer){
    Meteor.startup(function(){
        Meteor.methods({
            "weshare": function (postId,type,section) {
                if (this.userId === null || !Match.test(postId, String) || !Match.test(type, String) ) {
                    return false;
                }
                this.unblock();

                var me, username;
                me = Meteor.users.findOne({_id:this.userId});
                var postSummery = Posts.findOne({_id:postId},{fields:{title:1,addontitle:1,mainImage:1}});
                if(me && postSummery){
                    username = me.username;
                    if (me.profile.fullname) {
                        username = me.profile.fullname;
                    }
                    Feeds.insert({
                        owner: this.userId,
                        ownerName: username,
                        ownerIcon: me.profile.icon,
                        eventType: 'share',
                        postId: postId,
                        postTitle: postSummery.title,
                        addontitle: postSummery.addontitle,
                        mainImage: postSummery.mainImage,
                        createdAt: new Date(),
                        ReadAfterShare: 0,
                        followby: this.userId,
                        checked: true,
                        extra: {wechat:{type:type,section:section}}
                    });

                    if ((favp = FavouritePosts.findOne({
                            postId: postId,
                            userId: this.userId
                        }))) {
                        return FavouritePosts.update({
                            _id: favp._id
                        }, {
                            $set: {
                                updateAt: new Date()
                            }
                        });
                    } else {
                        return FavouritePosts.insert({
                            postId: postId,
                            userId: this.userId,
                            createdAt: new Date(),
                            updateAt: new Date()
                        });
                    }
                    return true;
                }
                return false;
            }
        });
    });
}

