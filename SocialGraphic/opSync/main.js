var async = require('async');
var assert = require('assert');
var savePostUser = require('./import-user-post-info');
var save_viewer_node = require('./import-viewer-info').save_viewer_node;
var MongoOplog = require('mongo-oplog');
var conn = {
  mongo: 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare',
  oplog: 'mongodb://oplogger:PasswordForOplogger@host1.tiegushi.com:27017/local?authSource=admin',
  //FIXME: why not filter?  to much network traffic
  oplog_opts_v: { ns: 'hotShare.viewers' , server : { reconnectTries : 3000, reconnectInterval: 2000, autoReconnect : true }},
  oplog_opts_p: { ns: 'hotShare.posts'   , server : { reconnectTries : 3000, reconnectInterval: 2000, autoReconnect : true }},
  oplog_opts_u: { ns: 'hotShare.users'   , server : { reconnectTries : 3000, reconnectInterval: 2000, autoReconnect : true }},
};
var db = null
var MongoClient = require('mongodb').MongoClient;

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
MongoClient.connect(conn.mongo, function(err, tdb) {
    assert.equal(null, err);
    db=tdb
});
mongo_connect();

function mongo_connect() {
  var oplog_v = MongoOplog(conn.oplog, conn.oplog_opts_v).tail();
  oplog_v.on('op', function (data) {
    get_id(data);
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

  var oplog_p = MongoOplog(conn.oplog, conn.oplog_opts_p).tail();
  oplog_p.on('op', function (data) {
    get_id(data);
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

  var oplog_u = MongoOplog(conn.oplog, conn.oplog_opts_u).tail();
  oplog_u.on('op', function (data) {
    get_id(data);
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

function get_id(doc) {
  var postId = null;
  var userId = null;
  var viewerId = null;
  var postDoc = null;
  var userDoc = null;
  var viewerDoc = null;

  //console.log('>>> ' + JSON.stringify(doc))
  async.series({
    getid: function(callback){
      if(doc.op === 'i') {
        if(doc.ns === conn.oplog_opts_v.ns && (!!doc.o) && doc.o.postId && doc.o.userId) {
          postId = doc.o.postId
          userId = doc.o.userId
          viewerDoc = doc.o
          viewerId = doc.o._id
        }
        else if(doc.ns === conn.oplog_opts_u.ns && (!!doc.o) && doc.o._id)
          userId = doc.o._id
        else if(doc.ns === conn.oplog_opts_p.ns && (!!doc.o) && doc.o._id)
          postId = doc.o._id
        else
          console.log('!!! unknow insert op: ' + JSON.stringify(doc))

        callback(null, 'insert ' + doc.ns + ' pid=' + postId + ' uid=' + userId);
      }
      else if(doc.op === 'u') {
        if(doc.ns === conn.oplog_opts_v.ns && (!!doc.o2) && doc.o2._id) {
          get_doc(doc.ns, doc.o2._id, function(ns, result) {
            if(result) {
              postId = result.postId
              userId = result.userId
              viewerDoc = result
              viewerId = result._id
            }
            callback(null, 'update ' + doc.ns + ' pid=' + postId + ' uid=' + userId);
          })
        }
        else if(doc.ns === conn.oplog_opts_u.ns && (!!doc.o2) && doc.o2._id) {
          userId = doc.o2._id
          callback(null, 'update ' + doc.ns + ' pid=' + postId + ' uid=' + userId);
        }
        else if(doc.ns === conn.oplog_opts_p.ns && (!!doc.o2) && doc.o2._id) {
          postId = doc.o2._id
          callback(null, 'update ' + doc.ns + ' pid=' + postId + ' uid=' + userId);
        }
        else {
          console.log('!!! unknow update op: ' + JSON.stringify(doc))
          callback(null, 'update ' + doc.ns + ' pid=' + postId + ' uid=' + userId);
        }
      }
      else {
        callback(null, doc.ns + 'other op: ' + JSON.stringify(doc));
      }
    },
    getdoc: function(callback){
      if(doc.ns === conn.oplog_opts_v.ns) {
        get_doc('hotShare.users', userId, function(ns1, result1) {
          if(result1)
            userDoc = result1;
          get_doc('hotShare.posts', postId, function(ns2, result2) {
            if(result2)
              postDoc = result2;

            callback(null, doc.ns + ' get doc');
          })
        })
      }
      else if(doc.ns === conn.oplog_opts_u.ns) {
        get_doc('hotShare.users', userId, function(ns1, result1) {
          if(result1)
            userDoc = result1;

          callback(null, doc.ns + ' get doc');
        })
      }
      else if(doc.ns === conn.oplog_opts_p.ns) {
        get_doc('hotShare.posts', postId, function(ns2, result2) {
          if(result2)
            postDoc = result2;

          callback(null, doc.ns + ' get doc');
        })
      }
      else {
        callback(null, doc.ns + ' not get doc');
      }
    }
  },function(err, results) {
    console.log(results);
    //console.log('>>> ' + doc.ns + '   \t' + JSON.stringify(postDoc) + ' \t' + JSON.stringify(userDoc) + '\n\n')
    sync_to_neo4j(doc.ns, postDoc, userDoc, viewerDoc);
  });
}

function get_doc(ns, id, cb) {
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
  if(ns === conn.oplog_opts_v.ns) {
    if(postDoc && postDoc._id && userDoc && userDoc._id)
      savePostUser.save_user_node(userDoc,function(){
        savePostUser.save_post_node(postDoc,function(){
          save_viewer_node(viewerDoc, function(){
            console.log('postview saved: pid=' + postDoc._id + ' uid=' + userDoc._id)
          })
        })
      })
    else
      console.log(ns + ', failed with: id=' + postDoc._id + ' uid=' + userDoc._id)
  }
  else if(ns === conn.oplog_opts_u.ns) {
    if(userDoc && userDoc._id)
      savePostUser.save_user_node(userDoc,function(){
        console.log('User Info saved: uid=' + userDoc._id)
      })
    else
      console.log(ns + ', failed with: id=' + postDoc._id + ' uid=' + userDoc._id)
  }
  else if(ns === conn.oplog_opts_p.ns) {
    if(postDoc && postDoc._id)
      savePostUser.save_post_node(postDoc,function(){
        console.log('Post Info saved: pid=' + postDoc._id)
      })
    else
      console.log(ns + ', failed with: id=' + postDoc._id + ' uid=' + userDoc._id)
  }
}
