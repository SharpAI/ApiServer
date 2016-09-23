var slack = function(){
  var obj = new Object();

  var makerMsg = function(color, message, author, title, image, url, fields){
    var result = {
      attachments: [
        {
          color: color || 'warning',
          pretext: message,
          title: title && title.length > 0 ? title[0] : '',
          title_link: url,
          text: title && title.length > 1 ? title[1] : '',
          thumb_url: image,
          fields: fields || [],
          footer: author ? '@' + author : '',
          footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
          ts: new Date().getTime()
        }
      ]
    };
    console.log('sned smg:', result);
    return result;
  }

  var makerPostMsg = function(color, message, id){
    var post = Posts.findOne({_id: id});
    if(!post)
      return null;

    return makerMsg(color, message, post.ownerName, [post.title, post.addontitle], post.mainImage, 'http://cdcdn.tiegushi.com/posts/' + post._id + '?check=true', [{
        title: '贴子',
        value: post._id,
        short: true
      },{
        title: '用户',
        value: post.owner,
        short: true
      }]
    );
  };

  var makerUserMsg = function(color, message, id){
    var user = Meteor.users.findOne({_id: id});
    if(!user)
      return null;

    return makerMsg.apply(color, message, user.profile && user.profile.fullname ? user.profile.fullname : user.username, '', '', '', [{
        title: '用户',
        value: user._id,
        short: true
      }]
    );
  };
  
  // 发贴
  obj.sendPostNew = function(id, callback){
    var msg = makerPostMsg('warning', '发表新贴', id);
    if(!msg)
      return callback && callback(new Error('贴子不存在'));
    postMessageToGeneralChannel('', msg, callback);
  };
  
  // 贴子通过审核
  obj.sendPostReview = function(id, callback){
    var msg = makerPostMsg('good', '贴子通过审核', id);
    if(!msg)
      return callback && callback(new Error('贴子不存在'));
    postMessageToGeneralChannel('', msg, callback);
  };

  // 贴子未通过审核
  obj.sendPostBack = function(id, callback){
    var msg = makerPostMsg('danger', '贴子未通过审核', id);
    if(!msg)
      return callback && callback(new Error('贴子不存在'));
    postMessageToGeneralChannel('', msg, callback);
  };
  
  // 删除贴子
  obj.sendPostRemove = function(id, callback){
    var msg = makerPostMsg('danger', '删除贴子', id);
    if(!msg)
      return callback && callback(new Error('贴子不存在'));
    postMessageToGeneralChannel('', msg, callback);
  };
  
  // 恢复贴子
  obj.sendPostRestore = function(id, callback){
    var msg = makerPostMsg('good', '恢复贴子', id);
    if(!msg)
      return callback && callback(new Error('贴子不存在'));
    postMessageToGeneralChannel('', msg, callback);
  };
  
  // 绿网检查结果
  obj.sendPostCheck = function(id, callback){
    var post = Posts.findOne({_id: id});
    if(!post)
      return callback && callback(new Error('贴子不存在'));

    var result = '安全'
    if(post.pub.length > 0){
      _.map(post.pub, function(item){
        if(item.text){
          if(syncCheckKeywords(item.text))
            return result = '不安全';
        }
      });
    }

    var msg = makerPostMsg(result === '安全' ? 'good' : 'danger', '绿网检查：' + result, id);
    if(!msg)
      return callback && callback(new Error('贴子不存在'));
    postMessageToGeneralChannel('', msg, callback);
  };
  
  // 服务器状态
  obj.sendServerStatus = function(status, callback){
    postMessageToGeneralChannel('', makerMsg('#439FE0', '服务器状态：' + status), callback);
  };
  
  // 删除用户
  obj.sendUserRemove = function(id, callback){
    var msg = makerUserMsg('good', '删除用户', id);
    if(!msg)
      return callback && callback(new Error('用户不存在'));
    postMessageToGeneralChannel('', msg, callback);
  };
  
  // 恢复用户
  obj.sendUserRestore = function(id, callback){
    var msg = makerUserMsg('danger', '恢复用户', id);
    if(!msg)
      return callback && callback(new Error('用户不存在'));
    postMessageToGeneralChannel('', msg, callback);
  };

  return obj;
};

Meteor.Slack = new slack();

Router.route('/slack/sendMsg', function (req, res, next) {
  res.writeHead(200, {'Content-Type' : 'text/html;charset=UTF-8'});

  var callback = function(err, result){
    if(err)
      return res.end('{"result": "fail"}');
    res.end('{"result": "succ"}');
  };

  switch(req.query['type']){
    case 'sendPostNew':
      Meteor.Slack.sendPostNew(req.query['id'], callback);
      break;
    case 'sendPostReview':
      Meteor.Slack.sendPostReview(req.query['id'], callback);
      break;
    case 'sendPostRemove':
      Meteor.Slack.sendPostRemove(req.query['id'], callback);
      break;
    case 'sendPostRestore':
      Meteor.Slack.sendPostRestore(req.query['id'], callback);
      break;
    case 'sendPostCheck':
      Meteor.Slack.sendPostCheck(req.query['id'], callback);
      break;
    case 'sendServerStatus':
      Meteor.Slack.sendServerStatus(req.query['status'], callback);
      break;
    case 'sendUserRemove':
      Meteor.Slack.sendUserRemove(req.query['id'], callback);
      break;
    case 'sendUserRestore':
      Meteor.Slack.sendUserRestore(req.query['id'], callback);
      break;
    default:
      res.end('{"result": "fail"}');
      break;
  }
}, {where: 'server'});

// Router.route('/slack/actions', function (req, res, next) {
//   console.log('query:', req.query);

//   res.writeHead(200, {'Content-Type' : 'text/html;charset=UTF-8'});
//   res.end('');
// }, {where: 'server'});