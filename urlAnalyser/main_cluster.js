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

var showDebug = true;

var port = process.env.PORT || 8080;        // set our port
var hotshare_web = process.env.HOTSHARE_WEB_HOST || 'http://cdn.tiegushi.com';
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = process.env.MONGO_URL || 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare';
var posts = null;
var users = null;
var Follower = null;
var FollowPosts = null;
var Feeds = null;
var serverImportLog = null;

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
        return 'US'
    }
    return 'CN';
}


/*Kue relative process*/
function startKueService() {
    kuequeue = kue.createQueue({
             //prefix: redis_prefix,
             redis: {
                 port: 6379,
                 host: 'urlanalyser.tiegushi.com',
                 auth: 'uwAL539mUJ'
             }});
    if (cluster.isMaster) {
        console.log("!!!!!!!!!! startKueService: Master...");
    } else {
        console.log("!!!!!!!!!! startKueService: Slaver...");
        setKueProcessCallback();
    }
}
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
            var timeout = 5000;
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
function createTaskToKueQueue(prefix, _id, url, server, unique_id, isMobile, chunked) {
    var job = kuequeue.create(prefix, {
      id: _id,
      url: getUrl(url),
      server: server,
      unique_id: unique_id,
      isMobile: isMobile,
      chunked: chunked
    }).priority('critical').removeOnComplete(true).save(function(err){
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
      restartKueService();
    });

    kuequeue.watchStuckJobs(10*1000);

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
              } else {
                done(new Error('failed'));
              }
            });
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
    //Feeds = db.collection('feeds');
    serverImportLog = db.collection('serverImportLog');
    Task.setCollection({posts: posts, serverImportLog: serverImportLog, followPosts: FollowPosts});
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
                        FollowPosts.insert({
                            _id:doc._id,
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
                            followby: data.userId
                        });
                    }
                    else
                    {
                        FollowPosts.insert({
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
                            followby: data.userId
                        });
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
                FollowPosts.insert({
                    _id:doc._id,
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
                    followby: userId
                });
            }
            else
            {         
                FollowPosts.insert({
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
                    followby: userId
                });
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
        if(i > 0){data.resortedArticle[i].data_row = data.resortedArticle[i-1].data_row + data.resortedArticle[i-1].data_sizey;}
      }
    }
    
    /*filedownup.EalyMainImage(data, function (mainImageURL) {*/
    draftsObj.EalyMainImage(data, url, function (mainImageURL) {
      var data_insert = [{
        '_id':mongoid(),
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
          FollowPosts.insert(data_insert2, function(err, result) {
            if(err || !result.insertedCount || !result.insertedIds || !result.insertedIds[0]) {
              console.log("Warning: FollowPosts.insert failed, postId="+doc._id+", followby="+user._id);
            } else {
              console.log("Warning: FollowPosts.insert suc, postId="+doc._id+", followby="+user._id);
            }
          });
      });
   });
}
var updateMyPost = function(userId, doc, cb) {
    FollowPosts.insert({
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
        followby: userId
    }, function(err, result) {
        if(cb){
            cb(null,result.insertedIds[0]);
        }
    });
}
var updatePosts = function(postId, post, taskId, callback){
  post.import_status = 'imported';
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
var updateFollowPosts = function(userId, postId, post, callback){
  //console.log("userId="+userId+", postId="+postId+", post="+JSON.stringify(post));
  FollowPosts.update({followby:userId, postId:postId}, {$set: {
                    mainImage: post.mainImage,
                    mainImageStyle:post.mainImageStyle,
                    publish: post.publish,
                    owner:post.owner,
                    ownerName:post.ownerName,
                    ownerIcon:post.ownerIcon,
                }
            }, function(err, number){
    callback && callback(err, number);
  });
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

function importUrl(_id, url, server, unique_id, isMobile, chunked, callback) {
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
                nightmare.goto("about:blank").then(function (result) {
                  console.log("Open blank page.");
                  finishNightmare(queueMember);
                });
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

                var draftsObj = new drafts.createDrafts(null, user);
                insert_data(user, url, result, draftsObj, function(err, postId, mainUrl){
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
                      
                      update_mainImage(user._id, postId, postObj.mainImage, postObj.mainImageStyle);
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
                          httpget(url);
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
  getIdleNightmare(nightmareQueue, startNavigation, 0);
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
  if (process.env.isClient) {
    console.log("Master: work only for slaver mode.");
    return;
  } else {
    console.log("cluster work both for Master and slaver mode.");
  }

  var router = express.Router();
  router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
  });

  router.route('/:_id/:url')
    .get(function(req, res) {
        routerCallback(req, res);
    });
  router.route('/:_id/:url/:unique_id')
    .get(function(req, res) {
        routerCallback(req, res);
    });
  function routerCallback(req, res) {
      var chunked = req.query['chunked'] && req.query['chunked'] === 'true' ? true : false;;
      var job;
      var ip = req.query.ip;
      var server = req.query.server || '';
      var unique_id = req.query.task_id || mongoid();
      var isMobile = req.query.isMobile || '';
      showDebug && console.log('[');
      showDebug && console.log('   req.params=' + JSON.stringify(req.params));
      showDebug && console.log('   req.query=' + JSON.stringify(req.query));
      if (checkIPAddr(ip) == 'CN') {
        console.log("   create task for CN");
        job = createTaskToKueQueue(redis_prefix, req.params._id, req.params.url, server, unique_id, isMobile, chunked);
        
      } else {
        console.log("   create task for US");
        job = createTaskToKueQueue(redis_prefix_us, req.params._id, req.params.url, server, unique_id, isMobile, chunked);
      }
      
      if (unique_id != '') {
        Task.add(unique_id, req.params._id, req.params.url);
      }

      job.on('complete', function(result){
        console.log('Job completed with data', result);
      }).on('failed attempt', function(errorMessage, doneAttempts){
        console.log('Job attempt failed');
        // cancel
        if(Task.isCancel(unique_id, true)) {
          console.log("Master: import cancel - 1.");
        }
        res.end(JSON.stringify({status:'failed'}));
        Task.update(unique_id, 'failed');
      }).on('failed', function(errorMessage){
        console.log('Job failed');
        // cancel
        if(Task.isCancel(unique_id, true)) {
          console.log("Master: import cancel - 2.");
        }
        res.end(JSON.stringify({status:'failed'}));
        Task.update(unique_id, 'failed');
      // }).on('importing', function(result){
      //   console.log('Job result');
      //   res.write(JSON.stringify(result));
      }).on('progress', function(progress, data){
        console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data);
        // cancel
        if(Task.isCancel(unique_id, true)) {
          console.log("Master: import cancel - 3.");
        }
          
        if (progress == 100) {
          res.end(data);
          Task.update(unique_id, 'done');
        }else {
          res.write(data);
          Task.update(unique_id, 'importing');
        }
      });
    }

  startKueService();
  abornalDispose();
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use('/import', router);
  app.get('/import-cancel/:id', function(req, res) {
    console.log('import-cancel: ' + req.params.id);
    Task.cancel(req.params.id);
    for (var id in cluster.workers) {
        var msg = {type:'abortImport', unique_id:req.params.id};
        console.log("Sending message abortImport to work id: "+id);
        cluster.workers[id].send(JSON.stringify(msg));
    }
    res.end(JSON.stringify({status:'cancelled'}));
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
    }
  });
  nightmareQueue = initNightmareQueue();
  startKueService();
  abornalDispose();
}
