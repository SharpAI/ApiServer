/*
导入处理流程：
1、请求导入服务器失败时返回失败；
2、收到响应结果时返回结果；
3、超时时调用取消并等待响应后返回结果；
4、返回结果时，如果客户端已断开，则调用取消导入；
5、定时取消失败的的任务；

原则上，本处理返回失败时的情况：1、明确失败；2、server会一直取消导入直到成功取消；
*/

var request = Meteor.npmRequire('request');
var Fiber = Meteor.npmRequire('fibers');
var cancelImportTask = new Meteor.Collection('cancelImportTask');
var runCancelTaskInterval = null;

function ImportServer(res, taskId, chunked){
  var obj = new Object();

  obj.sendRes = function(str, end){
    if(!res || res.isEnd === true || res.isResErr === true)
      return;
    
    console.log('import server res['+(end === true ? 'end' : 'write')+']:', str);
    if(end === true){
      res.isEnd = true;
      return res.end((chunked === true ? '\r\n' : '') + str);
    }
    res.write((chunked === true ? '\r\n' : '') + str);
  };
  obj.cancelImport = function(auto){
    console.log('cancel import:', import_cancel_url + '/' + taskId);
    request({method: 'GET', uri: import_cancel_url + '/' + taskId})
      .on('error', function(err){
        if(auto === true)
          return;

        obj.sendRes('{"status": "failed"}', true);
        Fiber(function() {
          if(!cancelImportTask.findOne({_id: taskId}))
            cancelImportTask.insert({_id: taskId, createAt: new Date()});
        }).run();
        runCancelTask();
      }).on('end', function(data) {
        obj.sendRes('{"status": "failed"}', true);
        Fiber(function() {
          cancelImportTask.remove({_id: taskId});
        }).run();
      });
  }
  return obj;
};

function runCancelTask(){
  cancelImportTask.find({}).forEach(function(item){
    var importServer = new ImportServer(null, item._id);
    importServer.cancelImport(true);
  });

  if(!runCancelTaskInterval){
    runCancelTaskInterval = Meteor.setInterval(function(){
      cancelImportTask.find({}).forEach(function(item){
        var importServer = new ImportServer(null, item._id);
        importServer.cancelImport(true);
      });
    }, 1000*60*2);
  }
};

Meteor.startup(function(){
  runCancelTask();
});

Router.route('/import-server/:_id/:url', function (req, res, next) {
  var slef = this;
  var req_url = import_server_url + '/' + this.params._id + '/' + encodeURIComponent(this.params.url) + '?chunked=true';
  var clientIp = getClientIp(req);
  var taskId = this.params.query['task_id'] || new Mongo.ObjectID()._str;
  var importServer = new ImportServer(res, taskId, true);

  res.writeHead(200, {
    'Content-Type' : 'text/html;charset=UTF-8',
    'Transfer-Encoding' : 'chunked'
  });

  res.on('error', function(err){
    console.log('import server: client offline');
    res.isResErr = true;
    importServer.cancelImport();
  });

  if (clientIp)
    req_url += '&ip='+clientIp;
  if (Meteor.absoluteUrl().toLowerCase().indexOf('host2.tiegushi.com') >= 0)
    req_url += '&server='+encodeURIComponent(Meteor.absoluteUrl());
  req_url += '&task_id=' + taskId;
  if (this.params.query['isMobile'])
    req_url += '&isMobile=' + this.params.query['isMobile']
  console.log("api_url="+req_url+", Meteor.absoluteUrl()="+Meteor.absoluteUrl());

  // 超时处理
  var timeoutHandle = setTimeout(function(){
    if(res.isEnd === true)
      return;

    importServer.cancelImport();
  }, 1000*13);

  // 请求导入server
  request({method: 'GET', uri: req_url})
    .on('error', function(err){
      importServer.sendRes('{"status": "failed"}', true);
    }).on('data', function(data) {
      if (timeoutHandle) {
          clearTimeout(timeoutHandle);
          timeoutHandle = null;
      }
      data = JSON.parse(data);
      if(data.status != 'importing')
        return importServer.sendRes(JSON.stringify(data), true);
      importServer.sendRes(JSON.stringify(data));
    }).on('end', function(data) {
      importServer.sendRes(data, true);
    });

}, {where: 'server'});

Router.route('/import-cancel/:id', function (req, res, next) {
  var importServer = new ImportServer(res, this.params._id);

  res.writeHead(200, {
    'Content-Type' : 'text/html;charset=UTF-8'
  });
  res.on('error', function(err){
    console.log('import server: client offline');
    res.isResErr = true;
    importServer.cancelImport();
  });
  importServer.cancelImport();
}, {where: 'server'});

Router.route('/restapi/importPost/:type/:_id', function(req, res, next) {
    var req_data = null;
    var req_type = this.params.type;
    var req_userId = this.params._id;

    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    req.setEncoding('utf8');
    req.on('data', function(data) {
      //console.log(data)
      req_data = JSON.parse(data);
    })
    .on('end', function() {
        if (!req_data) {
            return res.end(JSON.stringify({result: 'fail'}));
        }
        var Fiber = Meteor.npmRequire('fibers');
        Fiber(function() {
            if (req_type === 'insert') {
                console.log("importPost insert 1, req_userId="+req_userId);
                var user = Meteor.users.findOne({_id: req_userId});
                if (!user){
                    console.log("Find userId failed: req_userId="+req_userId);
                    return res.end(JSON.stringify({result: 'fail', reason: 'No such user ID!'+req_userId}))
                }
                Posts.insert(req_data, function(err, id) {
                    console.log("importPost insert 2, id="+id);
                    if (err || !id) {
                        return res.end(JSON.stringify({result: 'fail', reason:'Insert post failed!'}))
                    }
                    res.end(JSON.stringify({result: 'success', user: user}));
                });
            } else if (req_type === 'update') {
                console.log("importPost update 1");
                Posts.update({_id: req_data._id}, {$set: req_data}, function(err, num) {
                    console.log("importPost update 2");
                    if (err || num <= 0) {
                        return res.end(JSON.stringify({result: 'fail'}));
                    }
                    var post = Posts.findOne({_id: req_data._id});
                    request({method: 'GET', uri: '/restapi/postInsertHook/' + post.owner + '/' + post._id});
                    res.end(JSON.stringify({result: 'ok'}));
                });
            } else {
                res.end(JSON.stringify({result: 'failed'}));
            }
        }).run();
    });
}, {where: 'server'});