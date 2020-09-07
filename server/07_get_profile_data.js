/**
 * Created by simba on 11/10/16.
 */


if(Meteor.isServer){
    Meteor.startup(function() {
        Meteor.methods({
            "getMyProfileData": function () {
                if (this.userId === null) {
                    return false;
                }
                this.unblock();

                var myProfileData = {};

                myProfileData['myPostsCount'] = Posts.find({owner: this.userId,publish: {$ne: false}}).count();
                myProfileData['mySavedDraftsCount'] = SavedDrafts.find({owner: this.userId}).count();
                myProfileData['myFollowedByCount'] = Follower.find({followerId:this.userId}).count();
                myProfileData['myFollowedByCount-'+this.userId] = Follower.find({followerId:this.userId, userEmail: {$exists: false}}).count();
                myProfileData['myFollowToCount'] = Follower.find({userId:this.userId}).count();
                myProfileData['myEmailFollowerCount'] = Follower.find({followerId:this.userId, userEmail: {$exists: true}}).count();
                myProfileData['myEmailFollowerCount-'+this.userId] = Follower.find({followerId:this.userId, userEmail: {$exists: true}}).count();
                return myProfileData;
            }
        })
    })
}