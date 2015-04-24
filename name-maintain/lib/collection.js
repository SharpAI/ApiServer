RefNames = new Mongo.Collection("refnames");

if (Meteor.isServer){
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
    Users = new Meteor.Collection ('users');
    Meteor.publish('refnames',function(){
        return RefNames.find({})
    });
    RefNames.allow({
        insert: function (userId, doc) {
            check(doc.text,String);
            if(RefNames.find({text:doc.text}).count() > 0){
                return false;
            }
            return true;
        },
        update: function (userId, doc) {
            return true;
        },
        remove: function (userId, doc) {
            return true;
        }
    });
    Meteor.methods({
            'getStatics':function(){
                var total_posts = Posts.find().count();
                var total_users = Users.find().count();
                var total_meets = Meets.find().count()/2;
                var browser_users = Users.find({'profile.browser':true}).count();
                var app_users = Users.find({'profile.browser':{$ne:true}}).count();
                var named_users = Users.find({'profile.anonymous':{$ne:true}}).count();
                var total_views = Viewers.find().count();
                var total_comments = Comment.find().count();
                var total_saved_draft = SavedDrafts.find().count();
                var suggest_read = Feeds.find({'eventType':'recommand'}).count();
                var friends_request = Feeds.find({'eventType':'sendrequest'}).count();
                return {
                    total_posts:total_posts,
                    total_users:total_users,
                    browser_users:browser_users,
                    app_users:app_users,
                    named_users:named_users,
                    total_views:total_views,
                    total_meets:total_meets,
                    total_comments:total_comments,
                    total_saved_draft:total_saved_draft,
                    suggest_read:suggest_read,
                    friends_request:friends_request
                };
            }
        }
    )

}

