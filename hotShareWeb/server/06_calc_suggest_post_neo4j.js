/**
 * Created by simba on 10/5/16.
 */

if(Meteor.isServer){
    Meteor.startup(function(){

        var suggestPostsUserId = Meteor.users.findOne({'username': 'suggestPosts'})._id;
        Meteor.methods({
            "getSuggestedPosts": function (postId,skip,limit) {
                if (this.userId === null || !Match.test(postId, String) || !Match.test(skip, Number)|| !Match.test(limit, Number)) {
                    return false;
                }
                this.unblock();
                var queryString = 'MATCH (u:User)-[v:VIEWER]->(p:Post),(u)-[v1:VIEWER]->(p1:Post) ' +
                    'WHERE p.postId="'+ postId +'" and ' +
                    'u.userId<>"'+this.userId+'" ' +
                    'return u,p1.postId ORDER BY v1.by DESC SKIP '+skip+' LIMIT '+limit;
                var e, queryResult;

                try {
                    queryResult = Neo4j.query(queryString);
                } catch (_error) {
                    e = _error;
                    console.log("Can't query hot post from neo4j server");
                    if (postMessageToGeneralChannel) {
                        if (process.env.PRODUCTION) {
                            postMessageToGeneralChannel("@everyone Can't query hot post from neo4j server, this is reporting from Production server.");
                        } else {
                            postMessageToGeneralChannel("@everyone Can't query hot post from neo4j server, this is reporting from Test/Local  server.");
                        }
                    }
                    return false;
                }

                console.log(queryString);
                var response = [];
                if (queryResult && queryResult.length > 0) {
                    queryResult.forEach(function(item) {
                        var viewer = item[0];
                        var postId = item[1];
                        var userfullname = viewer.fullname ? viewer.fullname : viewer.username;
                        console.log(userfullname + '--- > postId: ' + postId);
                        var postInfo = Posts.findOne({_id:postId},{fields:{mainImage:1,title:1,addontitle:1}});
                        if(postInfo){
                            response.push({
                                postId:postId,
                                mainImage:postInfo.mainImage,
                                title:postInfo.title,
                                addontitle:postInfo.addontitle,
                                reader:userfullname
                            })
                        }
                    });
                } else {
                    if(typeof this.start_to_use_suggest_publisher === 'undefined'){
                        this.start_to_use_suggest_publisher = skip;
                    }
                    skip -= this.start_to_use_suggest_publisher;
                    var suggestPosts = FollowPosts.find({followby: suggestPostsUserId}, {sort: {createdAt: -1}, skip: skip, limit: limit},{fields:{mainImage:1,title:1,addontitle:1,ownerName:1,postId:1}}).fetch();
                    if(suggestPosts.length > 0){
                        console.log(suggestPosts)
                        suggestPosts.forEach(function(item) {
                            if(item){
                                response.push({
                                    postId:item.postId,
                                    mainImage:item.mainImage,
                                    title:item.title,
                                    addontitle:item.addontitle,
                                    ownerName:item.ownerName
                                })
                            }
                        });
                    }
                }
                return response;
            }
        });
    });
}

