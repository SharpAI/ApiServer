// code to run on server at startup
var MongoClient = require('mongodb').MongoClient;
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var kue        = require('kue');
var cluster    = require('cluster');
var clusterWorkerSize = require('os').cpus().length;
//var pushnotification = 
require('./3_pushnotification_trigger.js');
//var initPushServer = 
require('./pushserver_init.js');//.initPushServer;
//var getJSONObj = 
require('./utils.js');//.getJSONObj;
//var isArray = 
require('./utils.js');//.isArray;
require('./formatLog.js');

var SERVER_PORT = process.env.SERVER_PORT || 80;
var kuequeue;
var QUEUE_SIZE = 20;
var prefix = process.env.PREFIX || '';
var redis_prefix = prefix+'pushnotification_task';
var redis_prefix_us = prefix+'pushnotification_task_us';
var DB_CONN_STR = process.env.MONGO_URL || 'mongodb://hotShareAdmin:aei_19056@db1.tiegushi.com:27017,db2.tiegushi.com:27017/hotShare?replicaSet=hotShare&readPreference=primaryPreferred&connectTimeoutMS=30000&socketTimeoutMS=30000&poolSize=20';

var pushServer = initPushServer();
//pushServer.sendIOS('me', '9ce162f4beb26d45f4e91c7c83d57324a776a3fc3eaa81111e360ad0ae5e834c', 'aaa', 'aaa', 1);
//pushnotification(pushServer, {_id:'aaa'});

var totalRequestCount = 0;
var totalRedisTaskCount = 0;

MongoClient.connect(DB_CONN_STR, {poolSize:20, reconnectTries:Infinity}, function(err, db) {
    if (err) {
        console.log('Error:' + err);
        return;
    }

    PushMessages = db.collection('pushmessages');
    setInterval(function(){
        var dbCount = PushMessages.find({}).count();
        if (dbCount > 0) {
            console.log("dbCount("+dbCount+") > 0, create tasks from DB...");
            var dbRecords = PushMessages.find({}).fetch();
            dbRecords.forEach(function(dbRecord, index) {
                var item;
                try {
                    item = JSON.parse(dbRecord.pushMessage);
                } catch (error) {
                    console.log("Exception for JSON.parse: dbRecord.pushMessage="+dbRecord.pushMessage+", error="+error);
                    return;
                }
                if (!item.eventType || !item.doc || !item.userId) {
                    console.log("   Push information from DB error: item="+JSON.stringify(item));
                    return;
                }
                var fromserver = item.fromserver || '';
                var eventType = item.eventType || '';
                var doc = item.doc || '';
                var userId = item.userId || '';
                if (process.env.SERVER_IN_US) {
                    console.log("   create task for US: "+index);
                    //job = createTaskToKueQueue(redis_prefix_us, dbRecord._id, fromserver, eventType, doc, userId);
                    job = createTaskToKueQueue(redis_prefix_us, dbRecord._id, item);
                } else {
                    console.log("   create task for CN: "+index);
                    //job = createTaskToKueQueue(redis_prefix, dbRecord._id, fromserver, eventType, doc, userId);
                    job = createTaskToKueQueue(redis_prefix, dbRecord._id, item);
                }
            });
        }
    }, 10*1000);
});

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

function setKueProcessCallback() {
    function process_callback(job, done){
        function isObject(obj){ 
            return (typeof obj=='object')&&obj.constructor==Object; 
        } 
        console.log('------- Start --------');
        console.log('worker', cluster.worker.id, 'queue.process', job.data);
        var data = job.data;
        var _id = data._id;
        var itemObj = data.itemObj;
        /*var fromserver = itemObj.fromserver;
        var eventType = itemObj.eventType;
        var doc = itemObj.doc;
        var userId = itemObj.userId;
        var content = itemObj.content; 
        var extras = itemObj.extras;
        var toUserId = itemObj.toUserId;
        var toUserToken = itemObj.toUserToken;
        try {
            doc = JSON.parse(doc);
        } catch (error) {
            console.log("JSON.parse(doc) failed! doc="+doc);
            return -1;
        }*/

        if (!isObject(itemObj)) {
            console.log("itemObj is invalid, itemObj="+itemObj);
            done();
            return;
        }
        setTimeout(function() {
            try {
                pushnotification(pushServer, itemObj);
                job.progress(100, 100, JSON.stringify({'result': 'success'}));
                done();
            } catch (error) {
                console.log("Exception: in setKueProcessCallback, error="+error);
                console.log("Exception: in setKueProcessCallback, job.data="+JSON.stringify(job.data));
                done(new Error('failed'));
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

//function createTaskToKueQueue(prefix, _id, fromserver, eventType, doc, userId) {
function createTaskToKueQueue(prefix, _id, itemObj) {
    var job = kuequeue.create(prefix, {
      id: _id,
      itemObj:itemObj
      //fromserver: fromserver,
      //eventType: eventType,
      //doc: doc, //JSON.stringify(doc),
      //userId: userId
    }).priority('critical').removeOnComplete(true).save(function(err){
      if (!err) {
        console.log("   job.id = "+job.id+", _id="+_id);
      }
      console.log(']');
    });
    return job;
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

    router.route('/:_id')
        .post(function(req, res) {
            var job;

            totalRequestCount++;
            if (!req.query) {
                console.log("pushnotification: req.query is null, ignore this request.");
                return -1;
            }
            console.log('[');
            console.log('   req.params=' + JSON.stringify(req.params));
            console.log('   req.query=' + JSON.stringify(req.query));

            res.on('error', function(err){
                res.isResErr = true;
            });

            getJSONObj(req, res, function(error, dataArray){
                if (error || !dataArray || dataArray == '') {
                    console.log("   pushnotification: Get JSON Object failed! error="+error);
                    res.end(JSON.stringify({result: 'failed'}));
                    return -1;
                }
                if (!isArray(dataArray)) {
                    console.log("   pushnotification: received data is not an array! dataArray="+JSON.stringify(dataArray));
                    return -1;
                }
                dataArray.forEach(function(item, index) {
                    /*var fromserver = item.fromserver || '';
                    var eventType = item.eventType || '';
                    var doc = item.doc || '';
                    var userId = item.userId || '';

                    if (!item.eventType || !item.doc || !item.userId) {
                        console.log("   Push information error: item="+JSON.stringify(item));
                        return;
                    }*/
                    console.log("   index "+index+": "+JSON.stringify(item));
                    totalRedisTaskCount++;
                    console.log("totalRequestCount="+totalRequestCount);
                    console.log("totalRedisTaskCount="+totalRedisTaskCount);
                    if (process.env.SERVER_IN_US) {
                        console.log("   create task for US: "+index);
                        //job = createTaskToKueQueue(redis_prefix_us, req.params._id, fromserver, eventType, doc, userId);
                        job = createTaskToKueQueue(redis_prefix_us, req.params._id, item);
                    } else {
                        console.log("   create task for CN: "+index);
                        //job = createTaskToKueQueue(redis_prefix, req.params._id, fromserver, eventType, doc, userId);
                        job = createTaskToKueQueue(redis_prefix, req.params._id, item);
                    }
                    res.end(JSON.stringify({status:'success'}));

                    job.on('enqueue', function(id, type) {
                        console.log('Job '+id+'('+job.id+') got queued of type '+type); 
                    }).on('complete', function(result){
                        console.log('Job '+job.id+' completed with data '+result);
                    }).on('failed attempt', function(errorMessage, doneAttempts){
                        console.log('Job '+job.id+' attempt failed');
                        //res.end(JSON.stringify({status:'failed'}));
                    }).on('failed', function(errorMessage){
                        console.log('Job '+job.id+' failed');
                        //res.end(JSON.stringify({status:'failed'}));
                    }).on('progress', function(progress, data){
                        console.log('job #' + job.id + ' ' + progress + '% complete with data ', data);
                        if(res.isResErr === true) {
                            console.log("res error! Abort...");
                            return -1;
                        }
                        if (progress == 100) {
                            //writeRes(res, data, true);
                            //res.end(JSON.stringify(data));
                        }
                    });
                });
            });
        });

    startKueService();
    abornalDispose();
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use('/pushnotification', router);
    app.listen(SERVER_PORT);
    console.log('Magic happens on port ' + SERVER_PORT);
} else {
    startKueService();
    abornalDispose();
}
