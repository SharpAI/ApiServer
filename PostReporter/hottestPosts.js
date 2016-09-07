/**
 * Created by simba on 9/6/16.
 */
var neo4j = require('neo4j');
var url;

url = process.env.NEO4J_URL || process.env.GRAPHENEDB_URL || "http://neo4j:5MW-wU3-V9t-bF6@120.24.247.107:7474";

var Neo4j = new neo4j.GraphDatabase(url);

var caleHottestPosts = function(callback) {
    var latestPost, latestView, queryResult, queryString;
    latestPost = new Date();
    latestPost.setHours(latestPost.getHours() - 48);
    latestPost = latestPost.getTime();
    latestView = new Date();
    latestView.setHours(latestView.getHours() - 24);
    latestView = latestView.getTime();
    queryString = "MATCH (u:User)-[v:VIEWER]->(p:Post) WITH v,p,length(()--p) AS views WHERE v.by > " + latestView + " AND views > 50 AND p.createdAt > " + latestPost + "  RETURN DISTINCT p.postId,p,length(()--p) AS views  ORDER BY views DESC LIMIT 5";
    Neo4j.cypher({
        query: queryString
    }, function(err, queryResult){
        if ( !err && queryResult && queryResult.length > 0) {
            var hottestPosts = [];
            queryResult.forEach(function(item) {
                if(item && item.p && item.p.properties){
                    var postInfo = item.p.properties;
                    console.log(postInfo);
                    postInfo.url = 'http://cdn.tiegushi.com/posts/'+postInfo.postId;
                    postInfo.title = postInfo.name;
                    delete postInfo['mainImage'];
                    delete postInfo['postId'];
                    delete postInfo['ownerId'];
                    delete postInfo['name'];
                    delete postInfo['createdAt'];
                    hottestPosts.push(postInfo);
                }
            });
            //console.log(hottestPosts);
            if(callback){
                callback(hottestPosts)
            }
        }
    });
};

//caleHottestPosts();

module.exports = caleHottestPosts;

