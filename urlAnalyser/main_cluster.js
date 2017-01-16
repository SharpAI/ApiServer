var Nightmare = require('nightmare');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path = require('path');
var mongoid = require('mongoid-js');
var filedownup = require('./file_downupload.js');
var drafts = require('./post_drafts.js');
var geoip = require('geoip-lite');
var http = require('http');
var Task = require('./task.js').Tasks;
var URL = require('url');
var THREAD_NUMBER = {
  download: 20,
  upload: 20,
  pub: 20 
}; // 同时下载/上传/pub分析的任务数

var showDebug = true;

var port = process.env.PORT || 8080;        // set our port
//var hotshare_web = process.env.HOTSHARE_WEB_HOST || 'http://host1test.tiegushi.com:8083';
var hotshare_web = process.env.HOTSHARE_WEB_HOST || 'http://cdn.tiegushi.com';
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = process.env.MONGO_URL || 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare';
var posts = null;
var users = null;
var Follower = null;
var FollowPosts = null;
var TopicPoss = null;
var Feeds = null;
var serverImportLog = null;
var lockedUsers = null;

var kue = require('kue'), 
    cluster = require('cluster'),
    clusterWorkerSize = require('os').cpus().length,
    kuequeue;/* = kue.createQueue({
         //prefix: redis_prefix,
         redis: {
             port: 6379,
             host: 'urlanalyser.tiegushi.com',
             auth: 'uwAL539mUJ'
         }});*/
var NIGHTMARE_DEBUG = false;
var QUEUE_SIZE = 100;
var nightmareQueue;
var prefix = process.env.PREFIX || '';
var redis_prefix = prefix+'import_task';
var redis_prefix_us = prefix+'import_task_us';
var restartKueServiceTimeout = null;

var origConsoleLog = console.log;
var origConsoleWarn = console.warn;
var origConsoleInfo = console.info;
var origConsoleError = console.error;
function getFormatedDateTime() {
    var dt = new Date();
    var yyyy = dt.getFullYear();
    var mm = dt.getMonth() + 1;
    var dd = dt.getDate();
    var hh = dt.getHours();
    var min = dt.getMinutes();
    var ss = dt.getSeconds();
    var SSS = dt.getMilliseconds();
    return '[' +
                [yyyy,
                 ((mm < 10) ? '0' : '') + mm,
                 ((dd < 10) ? '0' : '') + dd].join('-') + ' ' +
                [((hh < 10) ? '0' : '') + hh,
                 ((min < 10) ? '0' : '') + min,
                 ((ss < 10) ? '0' : '') + ss].join(':') + '.' +
                 ('000'+SSS).substr((''+ SSS).length) +
              ']:';
}

console.log = function (message) {
    var dateTime = getFormatedDateTime();
    Array.prototype.unshift.call(
        arguments,
        dateTime
    );
    origConsoleLog && origConsoleLog.apply(console, arguments);
};
console.warn = function (message) {
    var dateTime = getFormatedDateTime();
    Array.prototype.unshift.call(
        arguments,
        dateTime
    );
    origConsoleWarn && origConsoleWarn.apply(console, arguments);
};
console.info = function (message) {
    var dateTime = getFormatedDateTime();
    Array.prototype.unshift.call(
        arguments,
        dateTime
    );
    origConsoleInfo && origConsoleInfo.apply(console, arguments);
};
console.error = function (message) {
    var dateTime = getFormatedDateTime();
    Array.prototype.unshift.call(
        arguments,
        dateTime
    );
    origConsoleError && origConsoleError.apply(console, arguments);
};

var formatResult = function(data){
  if (data.resortedArticle && data.resortedArticle.length > 0 && data.format != true){
    for(var i=0;i<data.resortedArticle.length;i++){
      data.resortedArticle[i]._id = mongoid();
      if(data.resortedArticle[i].type === 'image'){
        data.resortedArticle[i].isImage = true;
        data.resortedArticle[i].data_sizey = 3;
      }else{
        data.resortedArticle[i].data_sizey = 1;
      }
      data.resortedArticle[i].data_row = 1;
      data.resortedArticle[i].data_col = 1;
      data.resortedArticle[i].data_sizex = 6;
    }
  
    // format
    for(var i=0;i<data.resortedArticle.length;i++){
      data.resortedArticle[i].index = i;
      data.resortedArticle[i].data_col = parseInt(data.resortedArticle[i].data_col);
      data.resortedArticle[i].data_row = parseInt(data.resortedArticle[i].data_row);
      data.resortedArticle[i].data_sizex = parseInt(data.resortedArticle[i].data_sizex);
      data.resortedArticle[i].data_sizey = parseInt(data.resortedArticle[i].data_sizey);
      data.resortedArticle[i].data_wait_init = true;
      data.resortedArticle[i].originImgUrl = data.resortedArticle[i].imageUrl;
      data.resortedArticle[i].imgUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
      if (i > 0) {
        data.resortedArticle[i].data_row = data.resortedArticle[i-1].data_row + data.resortedArticle[i-1].data_sizey;
      }
    }

    data.format = true;
  }
  return data;
}

var writeRes = function(res, str, end){
  if(!res || res.isEnd === true || res.isResErr === true)
    return;

  if(end === true){
    res.isEnd = true;
    res.end(str);
  }else{
    res.write(str);
  }
};

process.addListener('uncaughtException', function (err) {
  if (!err) {
    err = {};
  }
  var msg = err.message;
  if (err.stack) {
    msg += '\n' + err.stack;
  }
  if (!msg) {
    msg = JSON.stringify(err);
  }
  if (cluster.isMaster) {
    console.log("uncaughtException on Master");
  } else {
    console.log("uncaughtException on Slaver");
  }
  console.log("uncaughtException: err="+JSON.stringify(err));
  console.log(msg);
  console.trace();
  if (err.message && err.message.toLowerCase().startsWith("redis")) {
    restartKueService();
  }
});

function getUrl(url) {
    if (url) {
        var tmpUrl = url.trim().toUpperCase();
        if ((tmpUrl.indexOf("HTTP://") == 0) || (tmpUrl.indexOf("HTTPS://") == 0)) {
            return url.trim();
        } else {
            return 'http://'+url.trim();
        }
    }
    return '';
}

function checkIPAddr(ip) {
    if (!ip) {
        return 'CN';
    }
    var geo = geoip.lookup(ip);
    console.log("geo = "+JSON.stringify(geo));
    if (geo && geo.country == 'US') {
        return 'US';
    }
    return 'CN';
}


/*Kue relative process*/
function restartKueService() {
    if (restartKueServiceTimeout) {
        clearTimeout(restartKueServiceTimeout);
        restartKueServiceTimeout = null;
    }

    console.log("restartKueService in");
    restartKueServiceTimeout = setTimeout(function(){
        if (cluster.isMaster) {
            for (var id in cluster.workers) {
                var msg = {type:'restartKueService'}
                console.log("Sending message restartKueService to work id: "+id);
                cluster.workers[id].send(JSON.parse(msg));
            }
        }
        if (kuequeue) {
            var timeout = 30000;
            kuequeue.shutdown(Number(timeout), function () {
                if (cluster.isMaster) {
                    console.log("!!!!!!!!!! restartKueService: Master, shutdown kue queue service! Start again...");
                    kuequeue = null;
                    startKueService();
                } else {
                    console.log("!!!!!!!!!! restartKueService: Slaver, shutdown kue queue service! Start again...");
                    process.exit(0);
                }
            });
        }
    }, 5000);
}
function createTaskToKueQueue(prefix, _id, url, fromserver, unique_id, isMobile, chunked) {
    var job = kuequeue.create(prefix, {
      id: _id,
      url: getUrl(url),
      fromserver: fromserver,
      unique_id: unique_id,
      isMobile: isMobile,
      chunked: chunked
    }).priority('critical').ttl(60*1000).removeOnComplete(true).save(function(err){
      if (!err) {
        console.log("   job.id = "+job.id+", unique_id="+unique_id);
      }
      showDebug && console.log(']');
    });
    return job;
}
function createTaskToKueQueue2(prefix, _id, url, fromserver, unique_id, isMobile, chunked, q_ver) {
    var job = kuequeue.create(prefix, {
      id: _id,
      url: getUrl(url),
      fromserver: fromserver,
      unique_id: unique_id,
      isMobile: isMobile,
      chunked: chunked,
      qVer: q_ver
    }).priority('critical').ttl(60*1000).removeOnComplete(true).save(function(err){
      if (!err) {
        console.log("   job.id = "+job.id+", unique_id="+unique_id);
      }
      showDebug && console.log(']');
    });
    return job;
}
function abornalDispose() {
    /*kuequeue.on('job enqueue', function(id, type){
      if (cluster.isMaster) {
        console.log('Master: Job %s got queued of type %s', id, type );
      } else {
        console.log('Slaver: Job %s got queued of type %s', id, type );
      }
    }).on('job complete', function(id, result){
        kue.Job.get(id, function(err, job){
        if (err) return;
            job.remove(function(err){
              if (err) throw err;
              if (cluster.isMaster) {
                console.log('Master: removed completed job #%d', job.id);
              } else {
                console.log('Slaver: removed completed job #%d', job.id);
              }
            });
        });
    });*/

    kuequeue.on('error', function(err) {
      if (cluster.isMaster) {
        console.log('Master: Oops... ', err);
      } else {
        console.log('Slaver: Oops... ', err);
      }
      //restartKueService();
    });

    kuequeue.watchStuckJobs(30*1000);

    kuequeue.inactiveCount(function(err, total){ // others are activeCount, completeCount, failedCount, delayedCount
      if (total > 100000) {
        console.log( 'We need some back pressure here' );
      }
    });
    kuequeue.failedCount('my-critical-job', function(err, total) {
      if (total > 10000) {
        console.log( 'This is tOoOo bad' );
      }
    });


    /*queue.process('my-error-prone-task', function(job, done){
      var domain = require('domain').create();
      domain.on('error', function(err){
        if (cluster.isMaster) {
          console.log('Master: domain on error');
        } else {
          console.log('Slaver: domain on error');
        }
        done(err);
      });
      domain.run(function(){ // your process function
        if (cluster.isMaster) {
          throw new Error('Master: bad things happen');
        } else {
          throw new Error('Slaver: bad things happen');
        }
        done();
      });
    });*/
}


/*nightmare queue relative process*/
function initQueueMember(queueMember) {
    queueMember.status = "NONE";
    queueMember.nightmare = Nightmare({ show: NIGHTMARE_DEBUG , openDevTools: NIGHTMARE_DEBUG, waitTimeout: 30000});
    showDebug && console.log("initQueueMember: init a nightmare. index="+queueMember.index);
}
function initNightmareQueue() {
    var queue = new Array(QUEUE_SIZE);
    for (var i=0; i<QUEUE_SIZE; i++) {
        queue[i] = {};
        queue[i].index = i;
        if (i < 10) {
            initQueueMember(queue[i]);
        }
    }
    showDebug && console.log("initNightmareQueue: inititalized "+QUEUE_SIZE+" nightmares.");
    return queue;
}
function getIdleNightmare(queue, callback, tryingCount) {
    var tryGetIdleNightmare = function () {
        for (var i=0; i<QUEUE_SIZE; i++) {
            if (!queue[i].nightmare) {
                queue[i].index = i;
                initQueueMember(queue[i]);
                return queue[i];
            } else if (queue[i].status == "NONE") {
                showDebug && console.log("getIdleNightmare: get one idle nightmare, i="+i);
                queue[i].status = "BUSY"
                return queue[i];
            }
        }
        return null;
    }

    if (tryingCount > 20) {
        console.log("Try too many times to open nightmare.");
        if (callback) {
            callback(queueMember);
        }
        return;
    }

    var queueMember = tryGetIdleNightmare();
    if (queueMember == null) {
        setTimeout(function(){
            getIdleNightmare(queue, callback, tryingCount+1);
        }, 1000);
    } else {
        if (callback) {
            console.log("Get one idle nightmare, call callback");
            callback(queueMember);
        }
    }
}
function finishNightmare(queueMember) {
    if (queueMember && queueMember.nightmare) {
        queueMember.status = "NONE";
        showDebug && console.log("finishNightmare: finish using nightmare. index="+queueMember.index);
    } else {
        showDebug && console.log("Error: finishNightmare no nightmare.");
    }
}


/*database relative process*/
MongoClient.connect(DB_CONN_STR, function(err, db) {
    if (err) {
        console.log('Error:' + err);
        return;
    }
    posts = db.collection('posts');
    users = db.collection('users');
    //Follower = db.collection('follower');
    FollowPosts = db.collection('followposts');
    TopicPoss = db.collection('topicposs');
    lockedUsers = db.collection('lockedUsers');
    //Feeds = db.collection('feeds');
    serverImportLog = db.collection('serverImportLog');
    Task.setCollection({posts: posts, serverImportLog: serverImportLog, followPosts: FollowPosts, TopicPosts: TopicPoss, FavouritePosts: db.collection('favouriteposts')});
});
var postsInsertHookDeferHandle = function(userId,doc){
    var suggestPostsUserId;
    try{
        suggestPostsUserId = users.findOne({'username': 'suggestPosts' })._id;
    } catch(error) {
    }
    try{
        Follower.find({followerId:userId}).toArray(function(err, follows) {
            var follows_length = follows.length;
            console.log("userId="+userId+", follows.length="+follows.length);
            if(follows_length>0){                  
                follows.forEach(function(data){
                    if(data.userId === suggestPostsUserId)
                    {
                        // FollowPosts.insert({
                        //     _id:doc._id,
                        //     postId:doc._id,
                        //     title:doc.title,
                        //     addontitle:doc.addontitle,
                        //     mainImage: doc.mainImage,
                        //     mainImageStyle:doc.mainImageStyle,
                        //     heart:0,
                        //     retweet:0,
                        //     comment:0,
                        //     browse: 0,
                        //     publish: doc.publish,
                        //     owner:doc.owner,
                        //     ownerName:doc.ownerName,
                        //     ownerIcon:doc.ownerIcon,
                        //     createdAt: doc.createdAt,
                        //     followby: data.userId
                        // });
                    }
                    else
                    {
                        // FollowPosts.insert({
                        //     postId:doc._id,
                        //     title:doc.title,
                        //     addontitle:doc.addontitle,
                        //     mainImage: doc.mainImage,
                        //     mainImageStyle:doc.mainImageStyle,
                        //     heart:0,
                        //     retweet:0,
                        //     comment:0,
                        //     browse: 0,
                        //     publish: doc.publish,
                        //     owner:doc.owner,
                        //     ownerName:doc.ownerName,
                        //     ownerIcon:doc.ownerIcon,
                        //     createdAt: doc.createdAt,
                        //     followby: data.userId
                        // });
                    }

                    Feeds.insert({
                        owner:doc.owner,
                        ownerName:doc.ownerName,
                        ownerIcon:doc.ownerIcon,
                        eventType:'SelfPosted',
                        postId:doc._id,
                        postTitle:doc.title,
                        mainImage:doc.mainImage,
                        createdAt:doc.createdAt,
                        heart:0,
                        retweet:0,
                        comment:0,
                        followby: data.userId
                    });
                    //pushnotification("newpost",doc,data.userId);
                    dataUser = users.findOne({_id:data.userId})
                    waitReadCount = dataUser && dataUser.profile && dataUser.waitReadCount ? dataUser.profile.waitReadCount : 0;
                    if(waitReadCount === undefined || isNaN(waitReadCount))
                    {
                        waitReadCount = 0;
                    }
                    users.update({_id: data.userId}, {$set: {'profile.waitReadCount': waitReadCount+1}});
                });
            }
            if(userId === suggestPostsUserId)
            {    
                console.log("22222");               
                // FollowPosts.insert({
                //     _id:doc._id,
                //     postId:doc._id,
                //     title:doc.title,
                //     addontitle:doc.addontitle,
                //     mainImage: doc.mainImage,
                //     mainImageStyle:doc.mainImageStyle,
                //     heart:0,
                //     retweet:0,
                //     comment:0,
                //     browse: 0,
                //     publish: doc.publish,
                //     owner:doc.owner,
                //     ownerName:doc.ownerName,
                //     ownerIcon:doc.ownerIcon,
                //     createdAt: doc.createdAt,
                //     followby: userId
                // });
            }
            else
            {         
                // FollowPosts.insert({
                //     postId:doc._id,
                //     title:doc.title,
                //     addontitle:doc.addontitle,
                //     mainImage: doc.mainImage,
                //     mainImageStyle:doc.mainImageStyle,
                //     heart:0,
                //     retweet:0,
                //     comment:0,
                //     browse: 0,
                //     publish: doc.publish,
                //     owner:doc.owner,
                //     ownerName:doc.ownerName,
                //     ownerIcon:doc.ownerIcon,
                //     createdAt: doc.createdAt,
                //     followby: userId
                // });
            }
        });
    }
    catch(error){}
    /*try {
        var pullingConn = Cluster.discoverConnection("pulling");
        pullingConn.call("pullFromServer", doc._id);
    }
    catch(error){}*/
};
var update_mainImage = function(userId, postId, mainImageUrl, style){
  console.log("mainImageUrl="+mainImageUrl);
  /*posts.update({_id: postId},{$set: {mainImage: mainImageUrl}}, function(err, number){
    console.log("update_mainImage: err="+err+", number="+number)
  });*/
   FollowPosts.update({followby:userId, postId:postId}, {$set: {mainImage: mainImageUrl, mainImageStyle:style}}, function(err, number){
     console.log("update_mainImage2: err="+err+", number="+number)
   });
  
  TopicPoss.update({owner:userId, postId:postId}, {$set: {mainImage: mainImageUrl, mainImageStyle:style}});
}

function get_insertData(user, url, data, draftsObj, callback) {
    if (!data) {
        console.log('Error: null of id or data');
        if (callback){
            callback('error', null)
        }
        return null;
    }

    if(data.format != true){
      if (data.resortedArticle && data.resortedArticle.length > 0){
          for(var i=0;i<data.resortedArticle.length;i++){
              data.resortedArticle[i]._id = mongoid();
              if(data.resortedArticle[i].type === 'image'){
                data.resortedArticle[i].isImage = true;
                data.resortedArticle[i].data_sizey = 3;
              }else{
                data.resortedArticle[i].data_sizey = 1;
              }
              data.resortedArticle[i].data_row = 1;
              data.resortedArticle[i].data_col = 1;
              data.resortedArticle[i].data_sizex = 6;
          }
        
          // format
          for(var i=0;i<data.resortedArticle.length;i++){
              data.resortedArticle[i].index = i;
              data.resortedArticle[i].data_col = parseInt(data.resortedArticle[i].data_col);
              data.resortedArticle[i].data_row = parseInt(data.resortedArticle[i].data_row);
              data.resortedArticle[i].data_sizex = parseInt(data.resortedArticle[i].data_sizex);
              data.resortedArticle[i].data_sizey = parseInt(data.resortedArticle[i].data_sizey);
              data.resortedArticle[i].data_wait_init = true;
              data.resortedArticle[i].originImgUrl = data.resortedArticle[i].imageUrl;
              data.resortedArticle[i].imgUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
              if (i > 0) {
                  data.resortedArticle[i].data_row = data.resortedArticle[i-1].data_row + data.resortedArticle[i-1].data_sizey;
              }
          }
      }
    }

    /*filedownup.EalyMainImage(data, function (mainImageURL) {*/
    draftsObj.EalyMainImage(data, url, function (mainImageURL) {
        var _post_id = mongoid();
        var data_insert = [{
            '_id': _post_id,
            'ownerId': user ? user._id: '',
            'pub': data.resortedArticle,
            'title': data.title,
            'browse': 0,
            'heart': [],
            'retweet': [],
            'comment': [],
            'commentsCount': 0,
            'addontitle': '',
            'mainImage': mainImageURL,
            'mainImageStyle': '',
            'mainText': [],
            'fromUrl': url,
            'import_status':'importing',
            'owner':user ? user._id: '',
            'ownerName':user ? (user.profile.fullname || user.username) : '',
            'ownerIcon':user ? (user.profile.icon || '/userPicture.png') : '',
            'createdAt': new Date(),
            'publish': true,
            "isReview": true
        }];

        if (callback) {
            callback(null, data_insert[0], mainImageURL)
        }
    })
}
var insert_data = function(user, url, data, draftsObj, cb) {
    if (!user || !data || !url || !posts) {
      console.log('Error: null of id or data');
      if(cb){
          cb('error',null)
      }
      return;
    }

    if (data.resortedArticle && data.resortedArticle.length > 0){
      for(var i=0;i<data.resortedArticle.length;i++){
        data.resortedArticle[i]._id = mongoid();
        if(data.resortedArticle[i].type === 'image'){
          data.resortedArticle[i].isImage = true;
          data.resortedArticle[i].data_sizey = 3;
        }else{
          data.resortedArticle[i].data_sizey = 1;
        }
        data.resortedArticle[i].data_row = 1;
        data.resortedArticle[i].data_col = 1;
        data.resortedArticle[i].data_sizex = 6;
      }
      
      // format
      for(var i=0;i<data.resortedArticle.length;i++){
        data.resortedArticle[i].index = i;
        data.resortedArticle[i].data_col = parseInt(data.resortedArticle[i].data_col);
        data.resortedArticle[i].data_row = parseInt(data.resortedArticle[i].data_row);
        data.resortedArticle[i].data_sizex = parseInt(data.resortedArticle[i].data_sizex);
        data.resortedArticle[i].data_sizey = parseInt(data.resortedArticle[i].data_sizey);
        data.resortedArticle[i].data_wait_init = true;
        data.resortedArticle[i].originImgUrl = data.resortedArticle[i].imageUrl;
        data.resortedArticle[i].imgUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
        if(i > 0){data.resortedArticle[i].data_row = data.resortedArticle[i-1].data_row + data.resortedArticle[i-1].data_sizey;}
      }
    }

    /*filedownup.EalyMainImage(data, function (mainImageURL) {*/
    draftsObj.EalyMainImage(data, url, function (mainImageURL) {
      var _post_id = mongoid();
      var data_insert = [{
        '_id': _post_id,
        'ownerId': user._id,
        'pub': data.resortedArticle,
        'title': data.title,
        'browse': 0,
        'heart': [],
        'retweet': [],
        'comment': [],
        'commentsCount': 0,
        'addontitle': '',
        'mainImage': mainImageURL,
        'mainImageStyle': '',
        'mainText': [],
        'fromUrl': url,
        'import_status':'importing',
        'owner':user._id,
        'ownerName':user.profile.fullname || user.username,
        'ownerIcon':user.profile.icon || '/userPicture.png',
        'createdAt': new Date(),
        'publish': true,
        "isReview": true
        }];

      posts.insert(data_insert, function(err, result) {
        if(err || !result.insertedCount || !result.insertedIds || !result.insertedIds[0]) {
          console.log('Error:'+ err);
          if(cb){
            cb(err,null)
          }

          return null;
        }
        console.log("data_insert[0]._id="+data_insert[0]._id);
        showDebug && console.log("posts.insert: "+result.insertedIds[0]);
        //postsInsertHookDeferHandle(user._id, data_insert[0]);
        if(cb){
            cb(null,result.insertedIds[0], mainImageURL)
        }
      });

      var doc = data_insert[0];
      var data_insert2 = {
        _id: mongoid(),
        postId:doc._id,
        title:doc.title,
        addontitle:doc.addontitle,
        mainImage: doc.mainImage,
        mainImageStyle:doc.mainImageStyle,
        heart:0,
        retweet:0,
        comment:0,
        browse: 0,
        publish: doc.publish,
        owner:doc.owner,
        ownerName:doc.ownerName,
        ownerIcon:doc.ownerIcon,
        createdAt: doc.createdAt,
        followby: user._id
      };

      users.findOne({'username': 'suggestPosts'}, function (err, suggestPostsUser) {
          if(!err || suggestPostsUser) {
            if (user._id == suggestPostsUser._id) {
              data_insert2._id = doc._id;
            }
          }
          // FollowPosts.insert(data_insert2, function(err, result) {
          //   if(err || !result.insertedCount || !result.insertedIds || !result.insertedIds[0]) {
          //     console.log("Warning: FollowPosts.insert failed, postId="+doc._id+", followby="+user._id);
          //   } else {
          //     console.log("Warning: FollowPosts.insert suc, postId="+doc._id+", followby="+user._id);
          //   }
          // });
      });
   });
}
var updateMyPost = function(userId, doc, cb) {
    // FollowPosts.insert({
    //     postId:doc._id,
    //     title:doc.title,
    //     addontitle:doc.addontitle,
    //     mainImage: doc.mainImage,
    //     mainImageStyle:doc.mainImageStyle,
    //     heart:0,
    //     retweet:0,
    //     comment:0,
    //     browse: 0,
    //     publish: doc.publish,
    //     owner:doc.owner,
    //     ownerName:doc.ownerName,
    //     ownerIcon:doc.ownerIcon,
    //     createdAt: doc.createdAt,
    //     followby: userId
    // }, function(err, result) {
    //     if(cb){
    //         cb(null,result.insertedIds[0]);
    //     }
    // });
    cb && cb(new Error('error'));
}
var updatePosts = function(postId, post, taskId, callback){
  post._id = postId;
  post.import_status = 'imported';

  // 原处理流程
    posts.update({_id: postId},{$set: post}, function(err, number){
        callback && callback(err, number);
    });
  
  var task = Task.get(taskId);
  if(task){
    console.log('task img upload: ' + taskId);
    try{
    serverImportLog.update({taskId: taskId}, {$set: {
      postId: postId,
      endImgTime: new Date(),
      execImgTime: ((new Date()) - task.startTime)/1000
    }});
    }catch (ex){
      console.log(ex);
    }
  }
};
var updatePosts2 = function(postId, post, taskId, callback){
  var dataObj;
  post._id = postId;
  post.import_status = 'imported';

  var url = hotshare_web+'/restapi/importPost/update/NOUSERID';
  console.log("updateURL="+url+", postId="+postId);
  httppost(url, post, function(err, data){
    try {
        dataObj = JSON.parse(data);
    } catch (error) {
        console.log("updatePosts2: JSON.parse exception! error="+error);
        return callback('err', -1);;
    }
    if(err || !dataObj || dataObj.result != "success") {
        console.log("httppost update DB failed! Let's try to update DB directly! data="+data);
        posts.update({_id: postId},{$set: post}, function(err, number){
            if (err || number <= 0) {
                console.log("Update DB failed!");
                return callback && callback(err, number);
            }
            console.log("update DB directly success!");
            return callback && callback(null, 2);
        });
        return;
    }
    console.log("httppost update DB success!");
    if(dataObj.result === 'success') {
        return callback(null, 1);
    }
    console.log("dataObj="+JSON.stringify(dataObj));
    return callback('err', -1);
  });

  // 原处理流程
  // posts.update({_id: postId},{$set: post}, function(err, number){
  //   callback && callback(err, number);
  // });
  
  var task = Task.get(taskId);
  if(task){
    console.log('task img upload: ' + taskId);
    try{
    serverImportLog.update({taskId: taskId}, {$set: {
      postId: postId,
      endImgTime: new Date(),
      execImgTime: ((new Date()) - task.startTime)/1000
    }});
    }catch (ex){
      console.log(ex);
    }
  }
};
var updatePosts3 = function(postId, post, taskId, callback, qVer){
  var dataObj;
  post._id = postId;
  post.import_status = 'imported';
  // post.req_ver = qVer || '1';

  var url = hotshare_web+'/restapi/importPost/image/NOUSERID?v='+qVer;
  // console.log("updateURL="+url+", postId="+postId);
  httppost(url, post, function(err, data){
    try {
        dataObj = JSON.parse(data);
    } catch (error) {
        console.log("updatePosts3: JSON.parse exception! error="+error);
        return callback('err', -1);;
    }
    if(err || !dataObj || dataObj.result != "success") {
        console.log("httppost update DB failed! Let's try to update DB directly! data="+data);
        posts.findOne({_id: postId}, function (err, old_post) {
          if(err)
            return callback && callback(err, 0);

          var new_post = {import_status: 'imported', publish: true};

          // 用户没有修改标题图片
          if (post.mainImage && old_post.mainImage === 'http://data.tiegushi.com/res/defaultMainImage1.jpg')
            new_post.mainImage = post.mainImage;
          if (post.createdAt)
            new_post.createdAt = new Date(post.createdAt);
          if (post.fromUrl)
            new_post.fromUrl = post.fromUrl;

          for(var i=0;i<old_post.pub.length;i++){
            if(old_post.pub[i].type === 'image'){
              for(var ii=0;ii<post.pub.length;ii++){
                if(post.pub[ii]._id === old_post.pub[i]._id){
                  // 用户没有修改图片
                  if(old_post.pub[i].imgUrl.startsWith('data:image/')){
                    new_post['pub.'+i+'.imgUrl'] = post.pub[ii].imgUrl;
                    new_post['pub.'+i+'.souImgUrl'] = old_post.pub[i].originImgUrl;
                    new_post['pub.'+i+'.data_sizey'] = post.pub[ii].data_sizey;
                  }
                  break;
                } 
              }               
            }
          }

          posts.update({_id: postId},{$set: new_post}, function(err, number){
              if (err || number <= 0) {
                  console.log("Update DB failed!");
                  return callback && callback(err, number);
              }
              console.log("update DB directly success!");
              return callback && callback(null, 2);
          });
        });
        return;
    }
    console.log("httppost update DB success!");
    if(dataObj.result === 'success') {
        return callback(null, 1);
    }
    console.log("dataObj="+JSON.stringify(dataObj));
    return callback('err', -1);
  });

  // 原处理流程
  // posts.update({_id: postId},{$set: post}, function(err, number){
  //   callback && callback(err, number);
  // });
  
  var task = Task.get(taskId);
  if(task){
    console.log('task img upload: ' + taskId);
    try{
    serverImportLog.update({taskId: taskId}, {$set: {
      postId: postId,
      endImgTime: new Date(),
      execImgTime: ((new Date()) - task.startTime)/1000
    }});
    }catch (ex){
      console.log(ex);
    }
  }
};
var updateFollowPosts = function(userId, postId, post, callback){
  //console.log("userId="+userId+", postId="+postId+", post="+JSON.stringify(post));
  // FollowPosts.update({followby:userId, postId:postId}, {$set: {
  //                   mainImage: post.mainImage,
  //                   mainImageStyle:post.mainImageStyle,
  //                   publish: post.publish,
  //                   owner:post.owner,
  //                   ownerName:post.ownerName,
  //                   ownerIcon:post.ownerIcon,
  //               }
  //           }, function(err, number){
  //   callback && callback(err, number);
  // });
  callback && callback(new Error(''));
};


var httpget = function(url) {
    http.get(url, function(res) {
        showDebug && console.log('httpget suc: url='+url+', response: ${res.statusCode}');
        showDebug && console.log('------- End --------');
        // consume response body
        res.resume();
    }).on('error', function(err) {
        showDebug && console.log('httpget failed: url='+url+', error: ${e.message}');
        showDebug && console.log('------- End --------');
    });
}

var httppost = function(url, data, callback){
  var uri = URL.parse(url);
  var req = http.request({
    hostname: uri.hostname,
    port: uri.port,
    method: 'POST',
    path: uri.pathname,
    // handers: {}
  }, function(res){
    res.setEncoding('utf8');
    res.on('data', function(result){
      callback && callback(null, result);
      showDebug && console.log('httppost suc: url='+url+', data:', result);
      showDebug && console.log('------- End --------');
    });
  });
  req.on('error',function(e){
    callback && callback(e, null);
    showDebug && console.log('httppost failed: url='+url+', error: '+JSON.stringify(e));
    showDebug && console.log('------- End --------');
  });
  req.write(JSON.stringify(data));
  req.end();
};

function importUrl(_id, url, server, unique_id, isMobile, chunked, callback, qVer) {
  switch (arguments.length) {
    case 2:
      chunked = false;
      break;
    case 3:
      //callback = chunked;
      chunked = false;
      break;
  }

  var chunked_result = {};
  var userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12D508 (5752533504)';   //iPhone 8.2 Safari UA
  qVer = qVer || '1';

  console.log("isMobile="+isMobile);
  if (isMobile == '') {
      //var userAgent = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 8_2 like Mac OS X; en) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3'; //Chrome UA on iPhone
      //var userAgent = 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Electron/1.2.5 Safari/537.36'; //Chrome on Macbook
      if(chunked){
        chunked_result.status = 'importing';
        chunked_result.json = {
          title: url,
          mainImg: 'http://data.tiegushi.com/res/defaultMainImage1.jpg',
          remark: '[内容分析中...]'
        };
        callback(chunked_result);
        
        var nightmare_header = Nightmare({ show: false , openDevTools: false});
        nightmare_header
          .useragent(userAgent + ' (GetHeader)')
          .goto(url)
          .inject('js','bundle.js')
          .wait('#detected_json_from_header')
          .evaluate(function () {
            return window.detected_json_from_header;
          })
          .end()
          .then(function (result) {
            if(chunked_result.status != 'failed' && chunked_result.status != 'succ'){
              console.log('find main info end.');
              chunked_result.status = 'importing';
              chunked_result.json.title = result.title || '[暂无标题]';
              chunked_result.json.mainImg = result.mainImg || 'http://data.tiegushi.com/res/defaultMainImage1.jpg';
              chunked_result.json.remark = result.remark || '[暂无介绍]';
              callback(chunked_result);
            }
          });
      }
  }
  
  //var nightmare = Nightmare({ show: false , openDevTools: false, waitTimeout: 30000});
  function startNavigation(queueMember) {
      if (!queueMember) {
        if (callback) {
          console.log("    !!!!!!Error: can't get nightmare from queue!");
          chunked_result.status = 'failed';
          callback({status: 'failed'});
        }
        return;
      }
      var index = queueMember.index;
      var nightmare = queueMember.nightmare;
      nightmare
          .useragent(userAgent)
          .goto(url)
          .inject('js','bundle.js')
          .wait('#detected_json_from_gushitie')
          .evaluate(function () {
            return window.detected_json_from_gushitie
          })
          //.end()
          .then(function (result) {
              function cleanUp() {
                /*nightmare.goto("about:blank").then(function (result) {
                  console.log("Open blank page.");
                  finishNightmare(queueMember);
                });*/
                nightmare.end(function() {
                    console.log("cleanUp: end nightmare, index="+index);
                });
                console.log("cleanUp: index="+index);
                initQueueMember(queueMember);
                console.error('cleanUp: restart nightmare. queueMember.index='+queueMember.index);
              }
              console.log("unique_id="+unique_id);
              if (Task.isCancel(unique_id, true)) {
                console.log("importUrl: cancel - 1.");
                cleanUp();
                return callback && callback({status:'failed'});
              }
            
              //console.log("result="+JSON.stringify(result));
              console.log("nightmare finished, insert data and parse it...");
              users.findOne({_id: _id}, function (err, user) {
                if(err || !user) {
                  if (callback) {
                    console.log("user not found, err="+err);
                    chunked_result.status = 'failed';
                    callback({status:'failed'});
                    return;
                  }
                }

                var draftsObj = new drafts.createDrafts(null, user, THREAD_NUMBER);
                insert_data(user, url, result, draftsObj, function(err, postId, mainUrl){
                  // 先保存postid
                  // Task.setPost(unique_id, postId);
                  // send message to master
                  var msg = {
                    status: 'setPostId',
                    json: {
                      taskId: unique_id,
                      postId: postId
                    }
                  };
                  cluster.worker.send(msg);
                  callback(msg);

                  if (Task.isCancel(unique_id, true)) {
                    console.log("importUrl: cancel - 2.");
                    return callback && callback({status:'failed'});
                  }
                    
                  if (err) {
                    console.log('Error: insert_data failed');
                    chunked_result.status = 'failed';
                    callback({status:'failed'});
                    return;
                  }
                  showDebug && console.log('Post id is: '+postId);
                  
                  console.log('insert posts.');
                  if(!Task.get(unique_id))
                    Task.add(unique_id, _id, url);
                  Task.update(unique_id, 'importing', postId);
                  
                  // setTimeout(function(){ // test code
                  // 图片的下载及排版计算
                  draftsObj.setPostId(postId);
                  draftsObj.onSuccess(function(){
                    if (Task.isCancel(unique_id, true)) {
                      console.log("importUrl: cancel - 3.");
                      return callback && callback({status:'failed'});
                    }
                
                    draftsObj.uploadFiles(function (err) {
                      if (Task.isCancel(unique_id, true)) {
                        console.log("importUrl: cancel - 4.");
                        return callback && callback({status:'failed'});
                      }
                
                      if(err) {
                        return console.log('upload file error.');
                      }
                        
                      var postObj = draftsObj.getPubObject();
                      // console.log('post:', JSON.stringify(postObj));
                      // draftsObj.destroy();
                      
                      //update_mainImage(user._id, postId, postObj.mainImage, postObj.mainImageStyle);
                      // update pub
                      updatePosts(postId, postObj, unique_id, function(err, number){
                        if (Task.isCancel(unique_id, true)) {
                          console.log("importUrl: cancel - 5.");
                          return callback && callback({status:'failed'});
                        }
                
                        if(err || number <= 0) {
                          return console.log('import error.');
                        }
                          
                          var tmpServer = hotshare_web;
                          if (server && (server != '')) {
                            if (server.charAt(server.length - 1) == '/')
                              tmpServer = server.substring(0, server.length - 1);
                          }
                          var url = tmpServer+'/restapi/postInsertHook/'+user._id+'/'+postId;
                          console.log("httpget url="+url);

                          // 原处理流程
                          httpget(url);

                          console.log('==============================');
                          console.log('http://host1.tiegushi.com/slack/sendMsg?type=sendPostNew&id=' + postId);
                          httpget('http://host1.tiegushi.com/slack/sendMsg?type=sendPostNew&id=' + postId);
                          console.log('==============================');
                      });                 
                      
                      // updatePosts(postId, postObj, function(err, number){
                      //   if(err || number <= 0) {
                      //     showDebug && console.log('database update error!');
                      //     showDebug && console.log('------- End --------');
                      //   } else {
                      //       var tmpServer = hotshare_web;
                      //       if (server && (server != '')) {
                      //           if (server.charAt(server.length - 1) == '/') {
                      //               tmpServer = server.substring(0, server.length - 1);
                      //           }
                      //       }
                      //       var url = tmpServer+'/restapi/postInsertHook/'+user._id+'/'+postId;
                      //       console.log("httpget url="+url);
                      //       httpget(url);
                      //   }
                      // });
                      
                      
                      /*updateFollowPosts(user._id, postId, postObj, function(err, number){
                        if(err || number <= 0)
                          console.log('import error.');
                      });*/
                    });
                  });
                  draftsObj.seekOneUsableMainImage(result, url);
                  //draftsObj.seekOneUsableMainImageWithOutMainImage(result, url, mainUrl);
      
                  // send response
                  if (callback) {
                    chunked_result.status = 'succ';
                    if (hotshare_web)
                        chunked_result.json = hotshare_web+'/posts/'+postId;
                    callback({status:'succ',json:hotshare_web+'/posts/'+postId, title:result.title, addontitle:'', mainImage:mainUrl});
                  }
                  // }, 5000); // test code
                });
              });

              cleanUp();
              //console.log("nightmare.then: index="+index);
              //initQueueMember(queueMember);
          })
          .catch(function (error) {
            if (callback) {
              chunked_result.status = 'failed';
              callback({status:'failed'});
            }
            nightmare.end(function() {
                console.log("end nightmare, index="+index);
            });
            console.log("nightmare.catch: index="+index);
            initQueueMember(queueMember);
            console.error('Search failed:', error);

          })
  }

  //var nightmare = Nightmare({ show: false , openDevTools: false, waitTimeout: 30000});
  function startNavigation2(queueMember) {
    function ReadWriteDatabase(insertURL, dataJson, cb) {
        httppost(insertURL, dataJson, function(error, data){
            var dataObj;
            try {
                dataObj = JSON.parse(data);
            } catch (error) {
                console.log("ReadWriteDatabase: JSON.parse exception! error="+error);
                return cb && cb("failed", {result: 'failed', reason:'JSON parse failed!'});
            }
            if (error || !dataObj || dataObj.result != 'success' || !dataObj.user) {
                console.log('ReadWriteDatabase: httppost failed! error='+error+', dataObj='+JSON.stringify(dataObj));
                console.log("Let's try to write DB directly.");
                users.findOne({_id: _id}, function (error1, user) {
                    if(error1 || !user) {
                        console.log("user not found, error1="+error1);
                        chunked_result.status = 'failed';
                        return cb && cb("failed", {result: 'failed', reason:'No such user ID!'});
                    }
                    dataJson.ownerId = user._id;
                    dataJson.ownerName = user.profile.fullname || user.username;
                    dataJson.ownerIcon = user.profile.icon || '/userPicture.png';
                    console.log("ReadWriteDatabase: importPost insert 1, dataJson._id="+dataJson._id);
                    posts.insert(dataJson, function(error2, result) {
                        if(error2 || !result.insertedCount || !result.insertedIds || !result.insertedIds[0]) {
                            console.log("importPost insert failed");
                            return cb && cb("failed", {result: 'failed', reason:'Insert post failed!'})
                        }
                        console.log("ReadWriteDatabase: importPost insert 2, error2="+error2+", id="+result.insertedIds[0]);
                        var userObj = {_id:user._id, profile:user.profile};
                        console.log("userObj="+JSON.stringify(userObj));
                        return cb && cb(null, {result: 'success', user: userObj});
                    });
                });
            } else {
                console.log("ReadWriteDatabase: httppost success.");
                return cb && cb(null, dataObj);
            }
        });
    }
    if (!queueMember) {
        if (callback) {
            console.log("    !!!!!!Error: can't get nightmare from queue!");
            chunked_result.status = 'failed';
            callback({status: 'failed'});
        }
        return;
    }
    var index = queueMember.index;
    var nightmare = queueMember.nightmare;
    nightmare
        .useragent(userAgent)
        .goto(url)
        .inject('js','bundle.js')
        .wait('#detected_json_from_gushitie')
        .evaluate(function () {
            return window.detected_json_from_gushitie
        })
        .end()
        .then(function (result) {
            function cleanUp() {
                initQueueMember(queueMember);
                console.log('cleanUp: restart nightmare. queueMember.index='+queueMember.index);
            }
            cleanUp();
            console.log("unique_id="+unique_id);
            if (Task.isCancel(unique_id, true)) {
                console.log("importUrl: cancel - 1.");
                cleanUp();
                return callback && callback({status:'failed'});
            }

            // format pub
            formatResult(result);

            var draftsObj = new drafts.createDrafts(null, null, THREAD_NUMBER);
            get_insertData(null, url, result, draftsObj, function(err, dataJson, mainUrl) {
                if(err) {
                    console.log('get_insertData failed! err='+err);
                    chunked_result.status = 'failed';
                    return callback && callback({status:'failed'});
                }

                var insertURL = hotshare_web+'/restapi/importPost/insert/'+_id;
                console.log("insertURL = "+insertURL);
                ReadWriteDatabase(insertURL, dataJson, function(err2, dataObj){
                    var postId = dataJson._id;
                    var user;

                    console.log("dataObj="+JSON.stringify(dataObj));
                    if(err2 || !dataObj || dataObj.result != 'success' || !dataObj.user) {
                        console.log('httppost failed! err2='+err2+', dataObj='+JSON.stringify(dataObj));
                        chunked_result.status = 'failed';
                        return callback && callback({status:'failed'});
                    }
                    user = dataObj.user;

                    console.log('Insert suc: dataObj='+JSON.stringify(dataObj));
                    if (Task.isCancel(unique_id, true)) {
                        console.log("importUrl: cancel - 2.");
                        return callback && callback({status:'failed'});
                    }
                    console.log('Post id is: '+postId);
                    if(!Task.get(unique_id)) {
                        Task.add(unique_id, _id, url);
                    }
                    Task.update(unique_id, 'importing', postId);

                    /*Insert data success, notify kue Master*/
                    if (callback) {
                        chunked_result.status = 'succ';
                        if (hotshare_web)
                            chunked_result.json = hotshare_web+'/posts/'+postId;
                        callback({status:'succ',json:hotshare_web+'/posts/'+postId, title:result.title, addontitle:'', mainImage:mainUrl});
                    }

                    // setTimeout(function(){ // test code
                    // 图片的下载及排版计算
                    draftsObj.setUser(dataObj.user);
                    draftsObj.setPostId(postId);
                    draftsObj.onSuccess(function(){
                        if (Task.isCancel(unique_id, true)) {
                            console.log("importUrl: cancel - 3.");
                            return callback && callback({status:'failed'});
                        }

                        draftsObj.uploadFiles(function (err) {
                            if (Task.isCancel(unique_id, true)) {
                                console.log("importUrl: cancel - 4.");
                                return callback && callback({status:'failed'});
                            }

                            if(err) {
                                return console.log('upload file error.');
                            }
                            
                            var postObj = draftsObj.getPubObject(result);
                            updatePosts3(postId, postObj, unique_id, function(err3, number){
                                if (Task.isCancel(unique_id, true)) {
                                    console.log("importUrl: cancel - 5.");
                                    return callback && callback({status:'failed'});
                                }

                                if(err3 || number <= 0) {
                                    return console.log('import error.');
                                }
                                  
                                var tmpServer = hotshare_web;
                                if (server && (server != '')) {
                                    if (server.charAt(server.length - 1) == '/')
                                        tmpServer = server.substring(0, server.length - 1);
                                }
                                var url = tmpServer+'/restapi/postInsertHook/'+user._id+'/'+postId;
                                // console.log("httpget url="+url);
                                if (number == 2 && qVer != '2') {
                                    httpget(url);
                                }

                                // console.log('==============================');
                                // console.log('http://host1.tiegushi.com/slack/sendMsg?type=sendPostNew&id=' + postId);
                                httpget('http://host1.tiegushi.com/slack/sendMsg?type=sendPostNew&id=' + postId);
                                // console.log('==============================');
                            }, qVer);                 
                        });
                    });
                    draftsObj.seekOneUsableMainImage(result, url);
                });
            });         
        })
        .catch(function (error) {
            if (callback) {
              chunked_result.status = 'failed';
              callback({status:'failed'});
            }
            console.log("nightmare.catch: index="+index);
            initQueueMember(queueMember);
            console.error('Search failed:', error);
        })
    }
    getIdleNightmare(nightmareQueue, startNavigation2, 0);
}

function setKueProcessCallback() {
  function process_callback(job, done){
    showDebug && console.log('------- Start --------');
    console.log('worker', cluster.worker.id, 'queue.process', job.data);
    var data = job.data;
    var _id = data.id;
    var url = data.url;
    var server = data.server;
    var unique_id = data.unique_id;
    var isMobile = data.isMobile;
    var chunked = data.chunked;
    var q_ver = data.qVer;
    
    if(isMobile)
      job.progress(50, 100, JSON.stringify({status: 'importing'}));
      
    setTimeout(function() {
        try {
            importUrl(_id, url, server, unique_id, isMobile, chunked, function(result) {
              //setTimeout(function() { done(); }, jobDelay);
              console.log('result='+JSON.stringify(result));
              if (result.status == 'succ') {
                job.progress(100, 100, JSON.stringify(result));
                done();
              } else if (result.status == 'importing') {
                job.progress(50, 100, JSON.stringify(result));
              } else if (result.status == 'setPostId') {
                job.progress(60, 100, JSON.stringify(result));
              } else {
                done(new Error('failed'));
              }
            }, q_ver);
        } catch (error) {
            done(new Error('failed'));
            console.log("Exception: in importUrl: error="+error);
            console.log("Exception: in importUrl. job.data="+JSON.stringify(job.data));
        }
    }, 0);
  }

  if (!process.env.SERVER_IN_US) {
    console.log("cluster Slaver: CN");
    kuequeue.process(redis_prefix, QUEUE_SIZE, process_callback);
  } else {
    console.log("cluster Slaver: US");
    kuequeue.process(redis_prefix_us, QUEUE_SIZE, process_callback);
  }
}

function startKueService() {
    var redis_server_url;
    if (process.env.SERVER_IN_US) {
        redis_server_url = 'usurlanalyser.tiegushi.com';
    } else {
        redis_server_url = 'urlanalyser.tiegushi.com';
    }
    kuequeue = kue.createQueue({
             //prefix: redis_prefix,
             redis: {
                 port: 6379,
                 host: redis_server_url,
                 auth: 'uwAL539mUJ'
             }});
    if (cluster.isMaster) {
        console.log("!!!!!!!!!! startKueService: Master...");
    } else {
        console.log("!!!!!!!!!! startKueService: Slaver...");
        setKueProcessCallback();
    }
}

if (cluster.isMaster) {
  console.log("clusterWorkerSize="+clusterWorkerSize);
  for (var i = 0; i < clusterWorkerSize; i++) {
    cluster.fork();
    console.log("cluster master fork: i="+i);
  }
  cluster.on('exit', function(worker, code, signal) {
    console.log('Worker ' + worker.id + ' died..');
    cluster.fork();
  });
  cluster.on('disconnect', function() {
    console.log('Frank Worker disconnect..');
  });
  cluster.on('message', function(message) {
    console.log('master message form worker:', message);
    if(message && message.status && message.status === 'setPostId')
      Task.setPost(message.json.taskId, message.json.postId);
  });
  if (process.env.isClient) {
    console.log("Master: work only for slaver mode.");
    //return;
  } else {
    console.log("cluster work both for Master and slaver mode.");
  }

  var router = express.Router();
  router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
  });

  router.route('/:_id/:url')
    .get(function(req, res) {
      res.on('error', function(err){
        res.isResErr = true;
      });

      //users.findOne({_id: req.params._id}, function(err, user){
      //  if(err || !user)
      //    return writeRes(res, JSON.stringify({status:'failed'}), true);
      //  if(!user.token)
          return routerCallback(req, res);

        /*lockedUsers.findOne({token: user.token}, function(error, lock){
          if(error || !lock)
            return routerCallback(req, res);
          writeRes(res, JSON.stringify({status:'failed'}), true);
        })
      });*/
    });
  router.route('/:_id/:url/:unique_id')
    .get(function(req, res) {
        res.on('error', function(err){
          res.isResErr = true;
        });

        //users.findOne({_id: req.params._id}, function(err, user){
        //  if(err || !user)
        //    return writeRes(res, JSON.stringify({status:'failed'}), true);
        //  if(!user.token)
            return routerCallback(req, res);

        /*  lockedUsers.findOne({token: user.token}, function(error, lock){
            if(error || !lock)
              return routerCallback(req, res);
            writeRes(res, JSON.stringify({status:'failed'}), true);
          })
        });*/
    });
  function routerCallback(req, res) {
      var chunked = req.query['chunked'] && req.query['chunked'] === 'true' ? true : false;;
      var job;
      var ip = req.query.ip;
      var fromserver = req.query.fromserver || '';
      var unique_id = req.query.task_id || mongoid();
      var isMobile = req.query.isMobile || '';
      var q_ver = req.query.v || '1';

      showDebug && console.log('[');
      showDebug && console.log('   req.params=' + JSON.stringify(req.params));
      showDebug && console.log('   req.query=' + JSON.stringify(req.query));

      /*if (checkIPAddr(ip) == 'CN') {
        console.log("   create task for CN");
        job = createTaskToKueQueue(redis_prefix, req.params._id, req.params.url, fromserver, unique_id, isMobile, chunked);
        
      } else {
        console.log("   create task for US");
        job = createTaskToKueQueue(redis_prefix_us, req.params._id, req.params.url, fromserver, unique_id, isMobile, chunked);
      }*/
      if (process.env.SERVER_IN_US) {
        console.log("   create task for US");
        job = createTaskToKueQueue2(redis_prefix_us, req.params._id, req.params.url, fromserver, unique_id, isMobile, chunked, q_ver);
      } else {
        if (checkIPAddr(ip) == 'CN') {
          console.log("   create task for CN");
          job = createTaskToKueQueue2(redis_prefix, req.params._id, req.params.url, fromserver, unique_id, isMobile, chunked, q_ver);
        } else {
          var req_url = 'http://usurlanalyser.tiegushi.com:8080'+req.originalUrl;
          console.log("   redirect task to US: "+req_url+"   ]");
          return res.redirect(req_url);
        }
      }
      
      if (unique_id != '') {
        Task.add(unique_id, req.params._id, req.params.url);
      }

      job.on('enqueue', function(id, type) {
        console.log('Job %s got queued of type %s', id, type); 
      }).on('complete', function(result){
        console.log('Job completed with data', result);
      }).on('failed attempt', function(errorMessage, doneAttempts){
        console.log('Job attempt failed');
        // cancel
        if(Task.isCancel(unique_id, true)) {
          console.log("Master: import cancel - 1.");
        }
        writeRes(res, JSON.stringify({status:'failed'}), true);
        // Task.failed(unique_id, errorMessage);
        // Task.update(unique_id, 'failed');
      }).on('failed', function(errorMessage){
        console.log('Job failed');
        // cancel
        if(Task.isCancel(unique_id, true)) {
          console.log("Master: import cancel - 2.");
        }
        writeRes(res, JSON.stringify({status:'failed'}), true);
        // Task.failed(unique_id, errorMessage);
        // Task.update(unique_id, 'failed');
      // }).on('importing', function(result){
      //   console.log('Job result');
      //   res.write(JSON.stringify(result));
      }).on('progress', function(progress, data){
        console.log('job #' + job.id + ' ' + progress + '% complete with data ', data);
        var dataObj = JSON.parse(data);

        if(res.isResErr === true)
          return Task.cancel(unique_id);

        if (progress == 100) {
          writeRes(res, data, true);
          if (dataObj && dataObj.status == 'succ' && dataObj.json) {
            var postId = dataObj.json.replace(/^.*[\\\/]/, '');
            console.log("postId = "+postId);
            Task.update(unique_id, 'done', postId);
          } else {
              Task.update(unique_id, 'done');
          }
        }else if(progress === 60){
          // TODO: set postId
        }else {
          writeRes(res, data);
          Task.update(unique_id, 'importing');
        }

        // cancel
        if(Task.isCancel(unique_id, true)) {
          console.log("Master: import cancel - 3.");
          writeRes(res, JSON.stringify({status:'failed'}), true);
          return;
        }
      });
    }

  startKueService();
  abornalDispose();
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use('/import', router);
  app.get('/import-cancel/:id', function(req, res) {
    res.on('error', function(err){
      res.isResErr = true;
    });

    // 检查1分钟内取消的任务状态
    setTimeout(function(){
      Task.removeHisCancel(1000*60);
    }, 1000*60);

    console.log('import-cancel: ' + req.params.id);
    var ret = Task.cancel(req.params.id);
    if (ret == -1) {
        if (!process.env.SERVER_IN_US) {
            var req_url = 'http://usurlanalyser.tiegushi.com:8080'+req.originalUrl;
            console.log("   redirect cancel task to US: "+req_url);
            console.log("   ]");
            res.redirect(req_url);
        }
    }
    for (var id in cluster.workers) {
        var msg = {type:'abortImport', unique_id:req.params.id};
        console.log("Sending message abortImport to work id: "+id);
        cluster.workers[id].send(JSON.stringify(msg));
    }
    writeRes(res, JSON.stringify({status:'cancelled'}), true);
  });
  app.listen(port);
  console.log('Magic happens on port ' + port);
} else {
  //process.on('message', (msg) => {
  process.on('message', function(obj) {
    //process.send(msg);
    var msg = JSON.parse(obj);
    console.log("msg = "+JSON.stringify(msg));
    if (msg.type === 'restartKueService') {
      console.log("Received restartKueService message from Master.");
      //restartKueService();
      process.exit(0);
    } else if (msg.type === 'abortImport') {
      console.log("Received abortImport message from Master.");
      Task.add(msg.unique_id, '', '');
      Task.update(msg.unique_id, 'cancel');
      Task.cancel(msg.unique_id);
    }
  });
  nightmareQueue = initNightmareQueue();
  startKueService();
  abornalDispose();
}