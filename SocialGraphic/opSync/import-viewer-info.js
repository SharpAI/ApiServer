/**
 * Created by simba on 5/6/16.
 */

module.exports.save_viewer_node=save_viewer_node

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = process.env.MONGO_URL;

var dbGraph = require("seraph")({ server: process.env.NEO4J_SERVER,
    endpoint: process.env.NEO4J_ENDPOINT,
    user: process.env.NEO4J_USER,
    pass: process.env.NEO4J_PASSWORD });

function save_viewer_node(doc,cb){
    if (doc !== null) {
        var createstr = 'MATCH (u:User {userId:"'+doc.userId+'"}),(p:Post {postId:"'+
            doc.postId+'"}) MERGE  (u)-[v:VIEWER{by:'+doc.createdAt.getTime()+'}]->(p) RETURN v;';
        dbGraph.query(createstr, function(err1, result) {
            //console.log(result)
            if (err1 || !result || result.length===0){
                cb('MERGE failed')
            }
            else
                cb(null)
        })
    }
}
function grab_viewerInfo_in_hotshare(db){
    var cursor =db.collection('viewers').find({});//.limit(3000).sort({createdAt:-1});

    function eachViewersInfo(err,doc){
        if(doc ===null){
            return
        }
        if(!err){
            console.dir(doc)
            save_viewer_node(doc,function(){
                setTimeout(function(){
                    cursor.next(eachViewersInfo)
                },0)
            })
        } else{
            console.log('Got error in db find '+err)
            setTimeout(function(){
                cursor.next(eachViewersInfo)
            },0)
        }
    }
    cursor.next(eachViewersInfo)
}


if(process.env.RUN_IMPORT_VIEWER) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        grab_viewerInfo_in_hotshare(db)
    });
}

