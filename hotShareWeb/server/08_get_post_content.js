/**
 * Created by simba on 11/11/16.
 */

if(Meteor.isServer){
    Meteor.startup(function() {
        Meteor.methods({
            "getPostContent": function (postId) {
                if (!Match.test(postId, String)) {
                    return false;
                }
                this.unblock();
                var postItem = Posts.findOne({_id: postId});

                return postItem;
            }
        })
    })
}
