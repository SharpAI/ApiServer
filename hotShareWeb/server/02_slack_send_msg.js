var slack = function(){
  var obj = new Object();
  var sendMsg = function(message, params, callback){
    postMessageToGeneralChannel(message, params, callback);
  };
  var makerMsg = function(type, color, title, text, fields){
    var result = {
      attachments: [
        {
          color: color || '#36a64f',
          author_name: '类型：' + type,
          title: title,
          text: text,
          fields: fields,
          ts: new Date().getTime()
        }
      ]
    };
    console.log('slack params:', result);
    return result;
  }
  
  // 发贴
  obj.sendPostNew = function(id){
    var post = Posts.findOne({_id: id});
    if(!post)
      return;

    sendMsg('meow!', makerMsg('发表新贴', '', post.title, post.addontitle, [
      {
        title: '_id',
        value: post._id,
        short: false
      },
      {
        title: 'userId',
        value: post.owner,
        short: false
      }
    ]));
  };
  
  // 贴子审核通过
  obj.sendPostReview = function(id){
    var post = Posts.findOne({_id: id});
    if(!post)
      return;

    sendMsg('meow!', makerMsg('贴子审核通过', '', post.title, post.addontitle, [
      {
        title: '_id',
        value: post._id,
        short: false
      },
      {
        title: 'userId',
        value: post.owner,
        short: false
      }
    ]));
  };

  // 贴子审核未通过 
  obj.sendPostBack = function(id){
    var post = Posts.findOne({_id: id});
    if(!post)
      return;

    sendMsg('meow!', makerMsg('贴子审核未通过', '', post.title, post.addontitle, [
      {
        title: '_id',
        value: post._id,
        short: false
      },
      {
        title: 'userId',
        value: post.owner,
        short: false
      }
    ]));
  };
  
  // 删除贴子
  obj.sendPostRemove = function(id){
    var post = Posts.findOne({_id: id});
    if(!post)
      return;

    sendMsg('meow!', makerMsg('删除贴子', '', post.title, post.addontitle, [
      {
        title: '_id',
        value: post._id,
        short: false
      },
      {
        title: 'userId',
        value: post.owner,
        short: false
      }
    ]));
  };
  
  // 恢复贴子
  obj.sendPostRestore = function(id){
    var post = Posts.findOne({_id: id});
    if(!post)
      return;

    sendMsg('meow!', makerMsg('恢复贴子', '', post.title, post.addontitle, [
      {
        title: '_id',
        value: post._id,
        short: false
      },
      {
        title: 'userId',
        value: post.owner,
        short: false
      }
    ]));
  };
  
  // 绿网检查结果
  obj.sendPostCheck = function(id){
    var post = Posts.findOne({_id: id});
    if(!post)
      return;

    var result = '通过'
    if(post.pub.length > 0){
      _.map(post.pub, function(item){
        if(item.text){
          if(!syncCheckKeywords(item.text))
            return result = '未通过';
        }
      });
    }

    sendMsg('meow!', makerMsg('绿网检查结果', '', post.title, post.addontitle, [
      {
        title: '_id',
        value: post._id,
        short: false
      },
      {
        title: '结果',
        value: result,
        short: false
      }
    ]));
  };
  
  // 服务器状态
  obj.sendServerStatus = function(status){};
  
  // 删除用户
  obj.sendUserRemove = function(id){};
  
  // 恢复用户
  obj.sendUserRestore = function(id){};

  return obj;
};

Meteor.Slack = new slack();

Router.route('/slack/sendMsg', function (req, res, next) {
  console.log('type:', req.query['type']);
  switch(req.query['type']){
    case 'sendPostNew':
      Meteor.Slack.sendPostNew(req.query['id']);
      break;
    case 'sendPostReview':
      Meteor.Slack.sendPostReview(req.query['id']);
      break;
    case 'sendPostRemove':
      Meteor.Slack.sendPostRemove(req.query['id']);
      break;
    case 'sendPostRestore':
      Meteor.Slack.sendPostRestore(req.query['id']);
      break;
    case 'sendPostCheck':
      Meteor.Slack.sendPostCheck(req.query['id']);
      break;
    case 'sendServerStatus':
      Meteor.Slack.sendServerStatus(req.query['status']);
      break;
    case 'sendUserRemove':
      Meteor.Slack.sendUserRemove(req.query['id']);
      break;
    case 'sendUserRestore':
      Meteor.Slack.sendUserRestore(req.query['id']);
      break;
  }

  res.writeHead(200, {'Content-Type' : 'text/html;charset=UTF-8'});
  res.end('');
}, {where: 'server'});

Router.route('/slack/actions', function (req, res, next) {
  console.log('query:', req.query);

  res.writeHead(200, {'Content-Type' : 'text/html;charset=UTF-8'});
  res.end('');
}, {where: 'server'});