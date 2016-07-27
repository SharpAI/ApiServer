var Nightmare = require('nightmare');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path = require('path');
var mongoid = require('mongoid-js');
var filedownup = require('./file_downupload.js');
var drafts = require('./post_drafts.js');
var geoip = require('geoip-lite');

var showDebug = true;
var redis_prefix = 'import_task';
var redis_prefix_us = 'import_task_us';

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

var kue = require('kue'), 
    cluster = require('cluster'),
    clusterWorkerSize = require('os').cpus().length,
    queue = kue.createQueue({
         //prefix: redis_prefix,
         redis: {
             port: 6379,
             host: 'urlanalyser.tiegushi.com',
             auth: 'uwAL539mUJ'
         }});

// var job = queue.create('email', {
//     title: 'welcome email for tj'
//     , to: 'tj@learnboost.com'
//     , template: 'welcome-email'
// }).save( function(err){
//     if( !err ) console.log( job.id );
// });

// queue.process('email', 5 ,function(job, done){
//     email(job.data.to, done);
// });

function email(address, done) {
    //if(!isValidEmail(address)) {
        //done('invalid to address') is possible but discouraged
    //    return done(new Error('invalid to address'));
    //}
    // email send stuff...
    done();
}
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port
var hotshare_web = process.env.HOTSHARE_WEB_HOST || 'http://cdn.tiegushi.com';
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = process.env.MONGO_URL || 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare';
var posts = null;
var users = null;

MongoClient.connect(DB_CONN_STR, function(err, db) {
    if (err) {
        console.log('Error:' + err);
        return;
    }
    posts = db.collection('posts');
    users = db.collection('users');
});
var insert_data = function(user, url, data, cb) {
    if (!user || !data || !url || !posts) {
      console.log('Error: null of id or data');
      if(cb){
          cb('error',null)
      }
      return;
    }

    if(data.resortedArticle.length > 0){
      for(var i=0;i<data.resortedArticle.length;i++){
        data.resortedArticle[i]._id = mongoid();
        if(data.resortedArticle[i].type === 'image')
          data.resortedArticle[i].isImage = true;
        data.resortedArticle[i].data_row = 1;
        data.resortedArticle[i].data_col = 1;
        data.resortedArticle[i].data_sizex = 6;
        data.resortedArticle[i].data_sizey = 1;
      }
    }
    
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
      'addontitle': [],
      'mainImage': data.imageArray.length > 0 ? data.imageArray[0] : 'http://data.tiegushi.com/res/defaultMainImage1.jpg',
      'mainImageStyle': [],
      'mainText': [],
      'fromUrl': url,
      'status':'importing',
      'owner':user._id,
      'ownerName':user.profile.fullname || user.username,
      'ownerIcon':user.profile.icon || '/userPicture.png',
      'publish': true
      }];

    posts.insert(data_insert, function(err, result) {
      if(err || !result.insertedCount || !result.insertedIds || !result.insertedIds[0]) {
        console.log('Error:'+ err);
        if(cb){
          cb(err,null)
        }
        return null;
      }
      showDebug && console.log("posts.insert: "+result.insertedIds[0]);
      if(cb){
          cb(null,result.insertedIds[0])
      }
    });
}

var updatePosts = function(postId, post, callback){
  post.status = 'imported';
  posts.update({_id: postId},{$set: post}, function(err, number){
    callback && callback(err, number);
  });
};

function importUrl(_id, url, chunked, callback) {
  switch (arguments.length) {
    case 2:
      chunked = false;
      break;
    case 3:
      callback = chunked;
      chunked = false;
      break;
  }

  var userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12D508 (5752533504)';   //iPhone 8.2 Safari UA
  //var userAgent = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 8_2 like Mac OS X; en) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3'; //Chrome UA on iPhone
  //var userAgent = 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Electron/1.2.5 Safari/537.36'; //Chrome on Macbook
  
  var chunked_result = {};
  if(chunked){
    chunked_result.status = 'importing';
    chunked_result.json = {
      title: url,
      mainImg: 'http://data.tiegushi.com/res/defaultMainImage1.jpg',
      remark: '[内容分析中...]'
    };
    callback(chunked_result);
    
    var nightmare_header = Nightmare({ show: true , openDevTools: true});
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
          chunked_result.status = 'importing';
          chunked_result.json.title = result.title || '[暂无标题]';
          chunked_result.json.mainImg = result.mainImg || 'http://data.tiegushi.com/res/defaultMainImage1.jpg';
          chunked_result.json.remark = result.remark || '[暂无介绍]';
          callback(chunked_result);
        }
      });
  }
  
  var nightmare = Nightmare({ show: false , openDevTools: false, waitTimeout: 60000});
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
            //console.log(result)
              users.findOne({_id: _id}, function (err, user) {
                if(err || !user)
                  if (callback) {
                    console.log("user not found, err="+err);
                    chunked_result.status = 'failed';
                    callback({status:'failed'});
                    return;
                  }

                insert_data(user, url, result, function(err,postId){
                  if (err) {
                    console.log('Error: insert_data failed');
                    chunked_result.status = 'failed';
                    callback({status:'failed'});
                    return;
                  }
                  showDebug && console.log('Post id is: '+postId);
                  
                  // 图片的下载及排版计算
                  var draftsObj = new drafts.createDrafts(postId, user);
                  draftsObj.onSuccess(function(){
                    draftsObj.uploadFiles(function (err) {
                      if(err)
                        return console.log('upload file error.');
                        
                      var postObj = draftsObj.getPubObject();
                      // console.log('post:', JSON.stringify(postObj));
                      // draftsObj.destroy();
                      updatePosts(postId, postObj, function(err, number){
                        if(err || number <= 0)
                          console.log('import error.');
                      });
                    });
                  });
                  draftsObj.seekOneUsableMainImage(result, url);
      
                  // send response
                  if (callback) {
                    chunked_result.status = 'succ';
                    chunked_result.json = hotshare_web+'/posts/'+postId;
                    callback({status:'succ',json:hotshare_web+'/posts/'+postId});
                  }
                });
              });
          })
          .catch(function (error) {
            if (callback) {
              chunked_result.status = 'failed';
              callback({status:'failed'});
            }
            console.error('Search failed:', error);
          })
}

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

if (cluster.isMaster) {
  console.log("clusterWorkerSize="+clusterWorkerSize);
  for (var i = 0; i < clusterWorkerSize; i++) {
    cluster.fork();
    console.log("cluster master fork: i="+i);
  }
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
      var chunked = req.query['chunked'] && req.query['chunked'] === 'true' ? true : false;;
      
      showDebug && console.log('_id=' + req.params._id + ', url=' + req.params.url);
      showDebug && console.log('req.query=' + JSON.stringify(req.query));
      //importUrl(req.params._id, req.params.url, res.json);
      var job;
      var ip = req.query.ip;
      if (checkIPAddr(ip) == 'CN') {
        console.log("create task for CN");
        job = queue.create(redis_prefix, {
          id: req.params._id,
          url: getUrl(req.params.url),
          chunked: chunked
        }).save(function(err){
          if( !err ) console.log("job.id = "+job.id );
        });
      } else {
        console.log("create task for US");
        job = queue.create(redis_prefix_us, {
          id: req.params._id,
          url: getUrl(req.params.url),
          chunked: chunked
        }).save(function(err){
          if( !err ) console.log("job.id = "+job.id );
        });
      }

      job.on('complete', function(result){
        console.log('Job completed with data', result);
      }).on('failed attempt', function(errorMessage, doneAttempts){
        console.log('Job attempt failed');
        res.end(JSON.stringify({status:'failed'}));
      }).on('failed', function(errorMessage){
        console.log('Job failed');
        res.end(JSON.stringify({status:'failed'}));
      // }).on('importing', function(result){
      //   console.log('Job result');
      //   res.write(JSON.stringify(result));
      }).on('progress', function(progress, data){
        console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data);
        if (progress == 100) {
          res.end(data);
        }else {
          res.write(data);
        }
      });
    });
  app.use('/import', router);
  app.listen(port);
  console.log('Magic happens on port ' + port);
} else {
  function process_callback(job, done){
    console.log('worker', cluster.worker.id, 'queue.process', job.data);
    var data = job.data;
    var _id = data.id;
    var url = data.url;
    var chunked = data.chunked;

    importUrl(_id, url, chunked, function(result) {
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
  }
  if (!process.env.SERVER_IN_US) {
    console.log("cluster Slaver: CN");
    queue.process(redis_prefix, 100, process_callback);
  } else {
    console.log("cluster Slaver: US");
    queue.process(redis_prefix_us, 100, process_callback);
  }
}
