var Nightmare = require('nightmare');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path = require('path');
var mongoid = require('mongoid-js');
var filedownup = require('./file_downupload.js');
var drafts = require('./post_drafts.js');

var showDebug = true;

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

// var kue = require('kue')
//     , queue = kue.createQueue({
//         prefix: 'q',
//         redis: {
//             port: 6379,
//             host: '192.168.99.100',
//             auth: 'mypass'
//         }});

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
var hotshare_web = process.env.HOTSHARE_WEB_HOST || 'http://cdcdn.tiegushi.com';
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
      showDebug && console.log(result.insertedIds[0]);
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

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here
router.route('/:_id/:url')
    .get(function(req, res) {
      showDebug && console.log('_id=' + req.params._id + ' url=' + req.params.url);
      var nightmare = Nightmare({ show: true , openDevTools: true});
      nightmare
          .goto(req.params.url)
          .inject('js','bundle.js')
          .wait('#detected_json_from_gushitie')
          .evaluate(function () {
            return window.detected_json_from_gushitie
          })
          .end()
          .then(function (result) {
            //console.log(result)
            if(!req.state){
              req.state = true

              users.findOne({_id: req.params._id}, function (err, user) {
                if(err || !user)
                  return res.json({status:'failed'});

                insert_data(user, req.params.url, result, function(err,postId){
                  if (err) {
                    console.log('Error: insert_data failed');
                    res.json({status:'failed'});
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
                  draftsObj.seekOneUsableMainImage(result, req.params.url);
      
                  // send response
                  //res.json({status:'succ',json:'http://192.168.1.73:9000/posts/'+postId});
                  res.json({status:'succ',json:hotshare_web+'/posts/'+postId});
                  // var job = queue.create('email', {
                  //     title: 'welcome email for tj'
                  //     , to: 'tj@learnboost.com'
                  //     , template: 'welcome-email'
                  // }).save( function(err){
                  //     if( !err ) console.log( job.id );
                  // });
                });
              });
            }
          })
          .catch(function (error) {
            res.json({status:'failed'});
            console.error('Search failed:', error);
          })
    });
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/import', router);

// START THE SERVER
// =============================================================================
app.listen(port);

console.log('Magic happens on port ' + port);
