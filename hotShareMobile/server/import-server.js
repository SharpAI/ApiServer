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
var subStringByte = function(str, length){
  if(!str)
    return '';
  if(length >= GetStringByteLength(str))
    return str;
  
  var tmp = str.substr(0, length > str.length ? str.length : length);
  for(var i=length;i>1;i--){
    if(GetStringByteLength(tmp) <= length || tmp.length <= 1)
      break;    
    tmp = tmp.substr(0, tmp.length-1);
  }
  return tmp;
};

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
    console.log('cancel import:', import_cancel_url + '/' + taskId +'- 3');
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
        console.log("cancel import: request end.");
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
  var clientIp = getClientIp(req);
  var req_url = import_server_url + '/' + this.params._id + '/' + encodeURIComponent(this.params.url) + '?chunked=true';
  var taskId = this.params.query['task_id'] || new Mongo.ObjectID()._str;
  var importServer = new ImportServer(res, taskId, true);
  var q_ver = this.params.query['v'] || '1';

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
  //if (Meteor.absoluteUrl().toLowerCase().indexOf('host2.tiegushi.com') >= 0)
  req_url += '&fromserver='+encodeURIComponent(Meteor.absoluteUrl());
  req_url += '&task_id=' + taskId;
  req_url += '&v=' + q_ver;
  if (this.params.query['isMobile'])
    req_url += '&isMobile=' + this.params.query['isMobile']
  console.log("api_url="+req_url+", Meteor.absoluteUrl()="+Meteor.absoluteUrl());

  // 超时处理
  var timeoutHandle = setTimeout(function(){
    if(res.isEnd === true)
      return;

    importServer.cancelImport();
  }, 1000*18);

  // 请求导入server
  request({method: 'GET', uri: req_url})
    .on('error', function(err){
      console.log("request req_url error: req_url="+req_url);
      importServer.sendRes('{"status": "failed"}', true);
    }).on('data', function(data) {
      if (timeoutHandle) {
          clearTimeout(timeoutHandle);
          timeoutHandle = null;
      }
      data = JSON.parse(data);
      if(data.status != 'importing') {
        console.log("data.status is not importing: data="+JSON.stringify(data));
        return importServer.sendRes(JSON.stringify(data), true);
      }
      importServer.sendRes(JSON.stringify(data));
    }).on('end', function(data) {
      console.log("request req_url end: req_url="+req_url);
      importServer.sendRes(data, true);
    });

}, {where: 'server'});

Router.route('/import-cancel/:_id', function (req, res, next) {
  var importServer = new ImportServer(res, this.params._id);

  console.log("Receved import-cancel request: "+this.params._id+"!!! - 3");
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
    var req_datastr = '';
    var req_data = null;
    var req_type = this.params.type;
    var req_userId = this.params._id;   

    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    req.setEncoding('utf8');
    req.on('data', function(data) {
      //console.log(data)
      //req_data = JSON.parse(data);
      req_datastr += data;
    })
    .on('end', function() {
        if (!req_datastr) {
            return res.end(JSON.stringify({result: 'failed'}));
        }
        try {
            req_data = JSON.parse(req_datastr);
        } catch (error) {
            console.log("importPost: JSON.parse exception! error="+error);
            return;
        }

        // console.log(req_type + ':', _.pluck(req_data.pub, '_id'));
        var Fiber = Meteor.npmRequire('fibers');
        Fiber(function() {
            req_data.title = subStringByte(req_data.title, withPostTitleMaxLength);
            req_data.addontitle = req_data.addontitle ? subStringByte(req_data.addontitle, withPostSubTitleMaxLength) : '';

            if (req_type === 'insert') {
                console.log("importPost find user 1, req_userId="+req_userId);
                var user = Meteor.users.findOne({_id: req_userId});
                console.log("importPost find user 2");
                if (!user){
                    console.log("Find userId failed: req_userId="+req_userId);
                    return res.end(JSON.stringify({result: 'failed', reason: 'No such user ID!'+req_userId}))
                }
                req_data.ownerId = user._id;
                req_data.owner = user._id;
                req_data.ownerName = user.profile.fullname || user.username;
                req_data.ownerIcon = user.profile.icon || '/userPicture.png';
                if (req_data.createdAt) {
                    req_data.createdAt = new Date(req_data.createdAt);
                }
                console.log("importPost insert 1, req_data._id="+req_data._id);
                Posts.insert(req_data, function(err, id) {
                    console.log("importPost insert 2, err="+err+", id="+id);
                    if (err || !id) {
                        console.log("importPost insert failed");
                        return res.end(JSON.stringify({result: 'failed', reason:'Insert post failed!'}))
                    }
                    var userObj = {_id:user._id, profile:user.profile};
                    res.write(JSON.stringify({result: 'success', user: userObj}));
                    res.end();
                });
            } else if (req_type === 'update') {
                console.log("importPost update 1, req_data._id="+req_data._id);
                if (req_data.createdAt) {
                    req_data.createdAt = new Date(req_data.createdAt);
                }
                Posts.update({_id: req_data._id}, {$set: req_data}, function(err, num) {
                    console.log("importPost update 2, err="+err+", num="+num);
                    if (err || num <= 0) {
                        return res.end(JSON.stringify({result: 'failed'}));
                    }
                    var post = Posts.findOne({_id: req_data._id});
                    //var position = Meteor.absoluteUrl().length-1;
                    //var hostAndPortUrl = Meteor.absoluteUrl().substr(0, position) + ":8083" + Meteor.absoluteUrl().substr(position);
                    var hostAndPortUrl = "http://127.0.0.1";
                    var uri = hostAndPortUrl + '/restapi/postInsertHook/' + post.owner + '/' + post._id;
                    console.log("req_data._id="+req_data._id+", uri = "+uri);
                    request({method: 'GET', uri: uri})
                      .on('error', function(err){
                        console.log('/restapi/postInsertHook/ err:', err);
                      }).on('data', function(data) {
                      }).on('end', function(data) {
                        console.log('/restapi/postInsertHook/ ok:', data);
                      });
                    res.end(JSON.stringify({result: 'success'}));
                });
            } else if(req_type === 'image'){
              var post = Posts.findOne({_id: req_data._id});
              var new_post = {import_status: 'imported', publish: true};

              // 用户没有修改标题图片
              if (req_data.mainImage && post.mainImage === 'http://data.tiegushi.com/res/defaultMainImage1.jpg')
                new_post.mainImage = req_data.mainImage;
              if (req_data.createdAt)
                new_post.createdAt = new Date(req_data.createdAt);
              if (req_data.fromUrl)
                new_post.fromUrl = req_data.fromUrl;

              for(var i=0;i<post.pub.length;i++){
                if(post.pub[i].type === 'image'){
                  for(var ii=0;ii<req_data.pub.length;ii++){
                    if(req_data.pub[ii]._id === post.pub[i]._id){
                      // 用户没有修改图片
                      if(post.pub[i].imgUrl.startsWith('data:image/')){
                        new_post['pub.'+i+'.imgUrl'] = req_data.pub[ii].imgUrl;
                        new_post['pub.'+i+'.souImgUrl'] = post.pub[i].originImgUrl;
                        new_post['pub.'+i+'.data_sizey'] = req_data.pub[ii].data_sizey;
                      }
                      break;
                    } 
                  }               
                }
              }
              console.log('import update post:', new_post);
              Posts.update({_id: req_data._id}, {$set: new_post}, function(err, num) {
                console.log("importPost update 2, err="+err+", num="+num);
                if (err || num <= 0) {
                    return res.end(JSON.stringify({result: 'failed'}));
                }
                var post = Posts.findOne({_id: req_data._id});
                //var position = Meteor.absoluteUrl().length-1;
                //var hostAndPortUrl = Meteor.absoluteUrl().substr(0, position) + ":8083" + Meteor.absoluteUrl().substr(position);
                var hostAndPortUrl = "http://127.0.0.1";
                var uri = hostAndPortUrl + '/restapi/postInsertHook/' + post.owner + '/' + post._id;
                console.log("req_data._id="+req_data._id+", uri = "+uri);
                request({method: 'GET', uri: uri})
                  .on('error', function(err){
                    console.log('/restapi/postInsertHook/ err:', err);
                  }).on('data', function(data) {
                  }).on('end', function(data) {
                    console.log('/restapi/postInsertHook/ ok:', data);
                  });
                res.end(JSON.stringify({result: 'success'}));
              });
            } else {
                res.end(JSON.stringify({result: 'failed'}));
            }
        }).run();
    });
}, {where: 'server'});
