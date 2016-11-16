var async = require('async');
var assert = require('assert');
var savePostUser = require('./import-user-post-info');
var save_viewer_node = require('./import-viewer-info').save_viewer_node;
var MongoOplog = require('mongo-oplog');
var restify = require('restify');

var conn = {
  mongo: process.env.MONGO_URL,
  oplog: process.env.MONGO_OPLOG,

  mongo_opts: { server : { reconnectTries : 3000, reconnectInterval: 2000, autoReconnect : true }},
  oplog_opts_v: { ns: 'hotShare.viewers' , server : { reconnectTries : 3000, reconnectInterval: 2000, autoReconnect : true }},
  oplog_opts_p: { ns: 'hotShare.posts'   , server : { reconnectTries : 3000, reconnectInterval: 2000, autoReconnect : true }},
  oplog_opts_u: { ns: 'hotShare.users'   , server : { reconnectTries : 3000, reconnectInterval: 2000, autoReconnect : true }}
};
var MongoClient = require('mongodb').MongoClient;
var db = null;
var oplog_v = null;
var oplog_p = null;
var oplog_u = null;

process.addListener('uncaughtException', function (err) {
    var msg = err.message;
    if (err.stack) {
        msg += '\n' + err.stack;
    }
    if (!msg) {
        msg = JSON.stringify(err);
    }
    console.log(msg);
    console.trace();
});
MongoClient.connect(conn.mongo, conn.mongo_opts, function(err, tdb) {
    assert.equal(null, err);
    db=tdb
    console.log('db connected!')

    db.on('timeout',     function(){console.log('MongoClient.connect timeout')});
    db.on('error',       function(){console.log('MongoClient.connect error')});
    db.on('close',       function(){console.log('MongoClient.connect close')});
    db.on('reconnect',   function(){
        console.log('MongoClient.connect reconnect')
        oplog_connect();
    });

    oplog_connect();
});

function oplog_connect() {
  if(oplog_v) {
      oplog_v.destroy(function(){
          console.log('oplog_v destroyed');
          oplog_v = null;
      })
  }
  if(oplog_p) {
      oplog_p.destroy(function(){
          console.log('oplog_p destroyed');
          oplog_p = null;
      })
  }
  if(oplog_u) {
      oplog_u.destroy(function(){
          console.log('oplog_u destroyed');
          oplog_u = null;
      })
  }

  oplog_v = MongoOplog(conn.oplog, conn.oplog_opts_v).tail();
  oplog_v.on('op', function (data) {
    get_doc(data, function (ns, postDoc, userDoc, viewerDoc) {
      sync_to_neo4j(ns, postDoc, userDoc, viewerDoc);
    })
  });
  oplog_v.on('error', function (error) {
    console.log('>>> error: ' + error);
  });
  oplog_v.on('end', function () {
    console.log('>>> end: Stream ended');
  });
  oplog_v.stop(function () {
    console.log('>>> stop: server stopped');
  });

  oplog_p = MongoOplog(conn.oplog, conn.oplog_opts_p).tail();
  oplog_p.on('op', function (data) {
    get_doc(data, function (ns, postDoc, userDoc, viewerDoc) {
      sync_to_neo4j(ns, postDoc, userDoc, viewerDoc);
    })
  });
  oplog_p.on('error', function (error) {
    console.log('>>> error: ' + error);
  });
  oplog_p.on('end', function () {
    console.log('>>> end: Stream ended');
  });
  oplog_p.stop(function () {
    console.log('>>> stop: server stopped');
  });

  oplog_u = MongoOplog(conn.oplog, conn.oplog_opts_u).tail();
  oplog_u.on('op', function (data) {
    get_doc(data, function (ns, postDoc, userDoc, viewerDoc) {
      sync_to_neo4j(ns, postDoc, userDoc, viewerDoc);
    })
  });
  oplog_u.on('error', function (error) {
    console.log('>>> error: ' + error);
  });
  oplog_u.on('end', function () {
    console.log('>>> end: Stream ended');
  });
  oplog_u.stop(function () {
    console.log('>>> stop: server stopped');
  });
}

function get_doc(doc, cb) {
  var postDoc = null;
  var userDoc = null;
  var viewerDoc = null;

  if(doc.op === 'i') {
    if(doc.ns === conn.oplog_opts_v.ns && (!!doc.o))
      viewerDoc = doc.o
    else if(doc.ns === conn.oplog_opts_u.ns && (!!doc.o))
      userDoc = doc.o
    else if(doc.ns === conn.oplog_opts_p.ns && (!!doc.o))
      postDoc = doc.o
    else
      console.log('!!! unknow insert op: ' + JSON.stringify(doc))

    return cb && cb(doc.ns, postDoc, userDoc, viewerDoc);
  }
  else if(doc.op === 'u') {
    if(doc.ns === conn.oplog_opts_v.ns && (!!doc.o2) && doc.o2._id) {
      get_doc_byId(doc.ns, doc.o2._id, function(ns, result) {
        if(result)
          viewerDoc = result
        return cb && cb(doc.ns, postDoc, userDoc, viewerDoc);
      })
    }
    else
      return cb && cb(doc.ns, postDoc, userDoc, viewerDoc);
  }
  else
    return cb && cb(doc.ns, postDoc, userDoc, viewerDoc);
}

function get_doc_byId(ns, id, cb) {
  if(!(!!ns && !!id)) {
    return cb(null, null);
  }

  if(ns === conn.oplog_opts_v.ns) {
    db.collection('viewers').findOne({_id:id},{fields:{
      postId: true,
      userId: true
    }},function(err, viewer) {
        if(err || (!viewer))
          return cb(null, null)
        else
          return cb(ns, viewer)
    });
  }
  else if(ns === conn.oplog_opts_u.ns) {
    db.collection('users').findOne({_id:id},{fields:{
      username: true,
      createdAt:true,
      'profile.fullname': true,
      type: true,
      'profile.sex':true,
      'profile.lastLogonIP':true,
      'profile.anonymous':true,
      'profile.browser':true,
      'profile.location':true
    }},function(err, user) {
        if(err || (!user))
          return cb(null, null)
        else
          return cb(ns, user)
    });
  }
  else if(ns === conn.oplog_opts_p.ns) {
    db.collection('posts').findOne({_id:id},{fields:{
      browse:true,
      title:true,
      addontitle:true,
      owner:true,
      _id:true,
      ownerName:true,
      createdAt:true,
      mainImage:true
    }},function(err, post) {
        if(err || (!post))
          return cb(null, null)
        else
          return cb(ns, post)
    });
  }
  else
    return cb(null, null);
}

function sync_to_neo4j(ns, postDoc, userDoc, viewerDoc) {
  if(ns === conn.oplog_opts_v.ns && (!!viewerDoc)) {
    if (!viewerDoc.createdAt)
      viewerDoc.createdAt = new Date();

    save_viewer_node(viewerDoc, function(err){
      if(err === null)
        console.log('postview saved: pid=' + viewerDoc.postId + ' uid=' + viewerDoc.userId)
      else
        resave_viewer_node(viewerDoc)
    })
  }
  else if(ns === conn.oplog_opts_u.ns && (!!userDoc)) {
    savePostUser.save_user_node(userDoc,function(err){
      if(err === null)
        console.log('User Info saved: uid=' + userDoc._id)
      else
        console.log('User Info saved: error:' + err)
    })
  }
  else if(ns === conn.oplog_opts_p.ns && (!!postDoc)) {
    savePostUser.save_post_node(postDoc,function(err){
      if(err === null)
        console.log('Post Info saved: pid=' + postDoc._id)
      else
        console.log('Post Info saved: error:' + err)
    })
  }
}

function resave_viewer_node(viewerDoc) {
  var postId = null
  var userId = null
  var postDoc = null
  var userDoc = null
  if((!!viewerDoc) && viewerDoc.postId && viewerDoc.userId) {
    postId = viewerDoc.postId
    userId = viewerDoc.userId

    get_doc_byId(conn.oplog_opts_p.ns, postId, function(ns, result1) {
      if(result1) {
        postDoc = result1
        get_doc_byId(conn.oplog_opts_u.ns, userId, function(ns, result2) {
          if(result2) {
            userDoc = result2
            savePostUser.save_user_node(userDoc,function(){
              savePostUser.save_post_node(postDoc,function(){
                save_viewer_node(viewerDoc, function(err){
                  if(err === null)
                    console.log('postview resaved: pid=' + viewerDoc.postId + ' uid=' + viewerDoc.userId)
                  else
                    console.log('postview Info resaved: error:' + err)
                })
              })
            })
          }
        })
      }
    })
  }
}
var server = restify.createServer({
  name: 'opSync Server',
  version: '0.3.0'
});
server.get('/', function (req, res, next) {
  res.send({status:'ok'});
  return next();
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
