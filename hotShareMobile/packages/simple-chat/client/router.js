simple_chat_page_stack = [];
SimpleChat.simple_chat_page_stack = simple_chat_page_stack;

var list_limit_val = 5;
var is_loading = new ReactiveVar(false);
var list_limit = new ReactiveVar(list_limit_val);
var page_title = new ReactiveVar('公司');
var page_data = null;
var $box = null;
var $box_ul = null;

Array.prototype.removeByIndex= function(index){
  return this.slice(0,index).concat(this.slice(index+1,this.length));
}

Template._simpleChatToChat.helpers({
  getMsg: function(){
    if (!page_data)
      return [];

    var now = new Date();
    var res = [];

    is_loading.set(true);
    page_data.messages().forEach(function (doc) {
      doc.show_time_str = get_diff_time((new Date(doc.create_time)).getTime());
      doc.has_show_time = true;

      if (res.length > 0){
        for(var i=res.length-1;i>=0;i--){
          if (res[i].show_time_str === doc.show_time_str)
            res[i].has_show_time = false;
        }
      }

      res.splice(0, 0, doc);
    });
    if(page_data.type != 'group')
      res.sort(function(da, db) {
        return new Date(da.create_time).getTime() - new Date(db.create_time).getTime();
      });
    console.log('load message:', new Date() - now, 'ms');
    is_loading.set(false);

    return res;
  }
});
Template._simpleChatToChat.onRendered(function(){
  console.log('message view rendered');
  page_data = this.data;
  if(!page_data)
    return;
  if(typeof(device) == "undefined")
    return
  if(Meteor.isCordova && device.platform === 'iOS'){
   try{
     Keyboard.shrinkView(true);
     Keyboard.disableScrollingInShrinkView(true);
   } catch (err){
     console.log(err)
   }
  }
  //开启已读消息模式
  if (withEnableHaveReadMsg && page_data.type === 'user') {
    var lastMsg =  Messages.findOne({'form.id': page_data.id, 'to.id': Meteor.userId(), to_type: page_data.type},{ sort: {create_time: -1}});
    if (lastMsg && lastMsg.is_read === false) {
      var to = {
        id:page_data.id
      }
      sendHaveReadMsg(to);
    }
  }
  loadMoreMesage(page_data.where, {limit: list_limit.get(), sort: {create_time: -1}}, list_limit.get());
});

Router.route(AppConfig.path + '/to/:type', {
  template: '_simpleChatToChat',
  data: function () {
    if(this.params.type != 'group')
      list_limit_val = 20;

    if (page_data && page_data.id === this.params.query['id'] && page_data.type === this.params.type)
      return page_data;

    var slef = this;
    var to = slef.params.query['id'];
    var type = slef.params.type
    var where = null;

    list_limit.set(10);

    if(type === 'group')
      where = {'to.id': to, to_type: type}; // 没有判断是否在群的处理。自动加群
    else
      where = {
        $or: [
          {'form.id': Meteor.userId(), 'to.id': to, to_type: type}, // me -> ta
          {'form.id': to, 'to.id': Meteor.userId(), to_type: type}  // ta -> me
        ]
      };

    console.log('where:', where);
    return {
      id: slef.params.query['id'],
      title: function(){
        return page_title.get();
      },
      is_group: function(){
        return slef.params.type === 'group';
      },
      query: Messages.find(where, {sort: {create_time: -1}}),
      type: slef.params.type,
      where: where,
      messages: function(){
        return Messages.find(where, {limit: list_limit.get(), sort: {create_time: -1}});
      },
      loading: is_loading.get()
    };
  }
});

var sendHaveReadMsg = function(to){
  var msg = {
      _id: new Mongo.ObjectID()._str,
      form:{
          id: Meteor.userId(),
          name: AppConfig.get_user_name(Meteor.user()),
          icon: AppConfig.get_user_icon(Meteor.user())
      },
      to: to,
      to_type: 'user',
      type: 'haveReadMsg',
      create_time: new Date(Date.now() + MQTT_TIME_DIFF),
      send_status: 'sending'
    };
  var callback = function(err){
    if(timeout){
      Meteor.clearTimeout(timeout);
      timeout = null;
    }
    if (err){
      console.log('send mqtt err:', err);
      //return Messages.update({_id: msg._id}, {$set: {send_status: 'failed'}});
      sendMqttUserMessage(msg.to.id, msg, arguments.callee);
    }
    //Messages.update({_id: msg._id}, {$set: {send_status: 'success'}});
  };
  var timeout = Meteor.setTimeout(function(){
    if (msg && msg.send_status === 'sending');
      sendMqttUserMessage(msg.to.id, msg, callback);
  }, 1000*60*2);
  sendMqttUserMessage(msg.to.id, msg, callback);
}

// lazyload
var lazyloadInitTimeout = null;
var lazyloadInit = function(){
  if (lazyloadInitTimeout)
    Meteor.clearTimeout(lazyloadInitTimeout);
  lazyloadInitTimeout = Meteor.setTimeout(function(){
    $box_ul.find('img.lazy:not([src])').lazyload({
      container: $box
    });
    $('.oneself_box ul').find('img.lazy:not([src])').lazyload({
      container: $('.oneself_box')
    });
    console.log('init lazyload');
  }, 600);
};
Template._simpleChatToChatItemImg.onRendered(function(){
  lazyloadInit();
});
Template._simpleChatToChatItemIcon.onRendered(function(){
  lazyloadInit();
});
Template._simpleChatToChatItemIcon2.onRendered(function(){
  lazyloadInit();
});

Template._simpleChatToChatItemThumbData.onRendered(function(){
  lazyloadInit();
});

var createTestMessage = function(groupid) {
  var msgObj1, msgObj2;
  msgObj1 = {
    _id: 'f2f37bb53b72afcbd095290e',
    form: {
      id: 'd22CXx4HpkF56bMth',
      name: '设备 13[7YRBBDB722205800]',
      icon: '/device_icon_192.png'
    },
    to: {
      id: groupid,
      name: '讯动训练营',
      icon: ''
    },
    to_type: 'group',
    type: 'text',
    text: '3 张照片需要标注',
    images: [
      {
        _id: "9f590ebd9a522dafeb274ac0",
        accuracy: false,
        fuzziness: "243",
        id: "7YRBBDB7222058001495085962690",
        img_type: "face",
        label: null,
        people_his_id: "MfBmtyGc6HGrmuJvM",
        url: "http://workaiossqn.tiegushi.com/87e74a36-3b8c-11e7-b451-d065caa84bb5"
      }, {
        _id: "9f590ebd9a522dafeb274ac0",
        accuracy: false,
        fuzziness: "243",
        id: "7YRBBDB7222058001495085962690",
        img_type: "face",
        label: null,
        people_his_id: "MfBmtyGc6HGrmuJvM",
        url: "http://workaiossqn.tiegushi.com/87e74a36-3b8c-11e7-b451-d065caa84bb5"
      }, {
        _id: "d2a7f9994fefb58ba992f2b5",
        accuracy: false,
        fuzziness: "155",
        id: "7YRBBDB7222058001495085962690",
        img_type: "face",
        label: null,
        people_his_id: "bwMqBiotYXj62J4oe",
        url: "http://workaiossqn.tiegushi.com/8716273a-3b8c-11e7-b451-d065caa84bb5"
      }
    ],
    people_uuid: "7YRBBDB722205800",
    people_id: "7YRBBDB7222058001495085962690",
    people_his_id: "MfBmtyGc6HGrmuJvM",
    wait_lable: true,
    is_read: false,
    is_people: true,
    create_time: new Date(),
    hasFromHistory: true,
    msg_ids: [
      {
        id: "f2f37bb53b72afcbd095290e"
      }, {
        id: "d369b0ef1bcd465d92de3c5d"
      }, {
        id: "d940b8ae826b707f1a72a9dc"
      }
    ]
  };
  msgObj2 = {
    _id: 'eebf9c65e525bce35b23ca76',
    form: {
      id: 'd22CXx4HpkF56bMth',
      name: '设备 13[7YRBBDB722205800]',
      icon: '/device_icon_192.png'
    },
    to: {
      id: groupid,
      name: '讯动训练营',
      icon: ''
    },
    to_type: 'group',
    type: 'text',
    text: '潘静鹏：',
    images: [
      {
        _id: "40a1e4fe75430f89bf0d27fa",
        accuracy: "0.78",
        fuzziness: "369",
        id: "aixia",
        img_type: "face",
        label: "潘静鹏",
        people_his_id: "FoJmBR6Cec8AmssQM",
        url: "http://workaiossqn.tiegushi.com/95723292-3b8c-11e7-b451-d065caa84bb5"
      }, {
        _id: "ff998283e039a5fa991ef097",
        accuracy: "0.77",
        fuzziness: "238",
        id: "aixia",
        img_type: "face",
        label: "潘静鹏",
        people_his_id: "aaedLtWZbbwFLZe6D",
        url: "http://workaiossqn.tiegushi.com/949da432-3b8c-11e7-b451-d065caa84bb5"
      }, {
        _id: "3759946bbeaecc709d6a8a12",
        accuracy: "0.77",
        fuzziness: "369",
        id: "aixia",
        img_type: "face",
        label: "潘静鹏",
        people_his_id: "XtfxhP3WCXSMok4q9",
        url: "http://workaiossqn.tiegushi.com/92fc7068-3b8c-11e7-b451-d065caa84bb5"
      }
    ],
    people_uuid: "7YRBBDB722205800",
    people_id: "aixia",
    people_his_id: "FoJmBR6Cec8AmssQM",
    wait_lable: false,
    is_read: false,
    is_people: true,
    create_time: new Date(),
    hasFromHistory: true,
    msg_ids: [
      {
        id: "eebf9c65e525bce35b23ca76"
      }, {
        id: "1346d8294eff172a6c3f7812"
      }, {
        id: "569bde89db7b19288a1acdd9"
      }
    ]
  };
  SimpleChat.Messages.insert(msgObj1);
  SimpleChat.Messages.insert(msgObj2);
};

Template._simpleChatToChat.onRendered(function(){
  is_loading.set(true);
  var slef = this;
  page_data = this.data;

  Meteor.setTimeout(function(){
    $box = $('.box');
    $box_ul = $('.box ul');

    if (page_data.type === 'group' && page_data.id === 'd2bc4601dfc593888618e98f') {
      var msgLocal = Messages.findOne(page_data.where);
      if (!msgLocal) {
        var msgObj = {
          _id: new Mongo.ObjectID()._str,
          form: {
            id: '',
            name: '系统',
            icon: ''
          },
          to: {
            id: page_data.id,
            name: page_data.title(),
            icon: ''
          },
          images: [],
          to_type: "group",
          type: "system",
          text: '当前端AI捕捉到有人在活动时，消息会发送到公司群中，请稍候' ,
          create_time: new Date(),
          is_read: false
        };
        Messages.insert(msgObj);

        Meteor.setTimeout(function(){
          createTestMessage(page_data.id);
        },300)
      }
    }
    if (page_data.type === 'group') {
      var msgLocal = Messages.findOne(page_data.where);
      if (!msgLocal) {
        var msgObj = {
          _id: new Mongo.ObjectID()._str,
          form: {
            id: '',
            name: '系统',
            icon: ''
          },
          to: {
            id: page_data.id,
            name: page_data.title(),
            icon: ''
          },
          images: [],
          to_type: "group",
          type: "system",
          text: '欢迎加入'+page_data.title(),
          create_time: new Date(),
          is_read: false
        };
        Messages.insert(msgObj);
      }
    }

    if (!Messages.onBefore){
      Messages.after.insert(function (userId, doc) {
        if (!page_data)
          return;
        if (doc.hasFromHistory === true) {
          return;
        }
        if (doc.to_type === page_data.type && doc.to.id === page_data.id){
          console.log('message insert');
          setMsgList(page_data.where, 'insert');
        }
        if (withEnableHaveReadMsg && doc.to_type === 'user' && doc.form.id === page_data.id) {
          console.log('receive other message')
          sendHaveReadMsg({id:doc.form.id});
        }
      });
      Messages.after.update(function (userId, doc, fieldNames, modifier, options) {
        if (!page_data)
          return;
        if (doc.to_type === page_data.type && doc.to.id === page_data.id){
          console.log('message update');
          setMsgList(page_data.where, 'update');
        }
      });
      Messages.after.remove(function (userId, doc){
        console.log('message remove');
        if (!page_data)
          return;
        if (doc.to_type === page_data.type && doc.to.id === page_data.id){
          console.log('message update');
          setMsgList(page_data.where, 'remove');
        }
      });
      Messages.onBefore = true;
    }

    Meteor.subscribe('people_new', function(){});
    Meteor.subscribe('get-messages', slef.data.type, slef.data.id, function(){


      is_loading.set(false);
    });

    $box.scroll(function () {
      if($box.scrollTop() === 0 && !is_loading.get()){
        // if(slef.data.messages.count() >= list_limit.get())
        is_loading.set(true);
        list_limit.set(list_limit.get()+list_limit_val);
        Meteor.setTimeout(function(){is_loading.set(false);}, 500);
        loadMoreMesage(page_data.where, {limit: list_limit.get(), sort: {create_time: -1}}, list_limit.get());
      }
    });

    if(Meteor.isCordova){
      $('#container').click(function(){
        var $link = $('.btn-box.link');
        //nlp训练营
        if ($link.length > 0) {
          cordova.plugins.clipboard.paste(function(link) {
            if (link !== null) {
              $('.input-text').val(link);
              Session.set('isFromClipboard',true);
              $('.send-btn input').submit();
              return;
            }
            else {
              return PUB.toast("粘贴板内容为空~");
            }
          }, function() {
            return PUB.toast("无法获得粘贴板数据，请手动粘贴\n点击输入框，长按进行粘贴");
          });
        }
        else{
          selectMediaFromAblumWithSize(1,480,640,function(cancel, result, currentCount, totalCount){
            if(cancel)
              return;
            if(result){
              var id = new Mongo.ObjectID()._str;
              window.___message.insert(id, result.filename, result.URI); // result.smallImage
              multiThreadUploadFile_new([{
                type: 'image',
                filename: result.filename,
                URI: result.URI
              }], 1, function(err, res){
                if(err || res.length <= 0){
                  window.___message.update(id, null);
                  return PUB.toast('上传图片失败~');
                }
                window.___message.update(id, res[0].imgUrl);
              });
            }
          });
        }
      });
    }else{
      Meteor.setTimeout(function(){
        // load upload.js
        loadScript('/packages/feiwu_simple-chat/client/upload.js', function(){
          var uploader = SimpleChat.createPlupload('selectfiles');
          uploader.init();
        });
      }, 2000);
    }

    Meteor.setTimeout(function(){
      setScrollToBottom();
    }, 600);
  }, 200);
});

Template._simpleChatToChat.onDestroyed(function(){
  page_data = null;
  if(Meteor.isCordova && device.platform === 'iOS'){
    try{
     Keyboard.shrinkView(false);
     Keyboard.disableScrollingInShrinkView(false);
    } catch (err){
     console.log(err)
    }
  }
  $box.css('overflow', 'auto');
});

var get_people_names = function(){
  var names = People.find({}, {sort: {updateTime: -1}, limit: 50}).fetch();
  var result = [];
  if(names.length > 0){
    for(var i=0;i<names.length;i++){
      if(result.indexOf(names[i].name) === -1)
        result.push(names[i].name);
    }
  }

  return result;
};

var onFixName = function(id, uuid, his_id, url, to, value, type){
  var user = Meteor.user();
  var images = [];

  if (url && Object.prototype.toString.call(url) === '[object Array]'){
    for(var i=0;i<url.length;i++)
      images.push({
        _id: new Mongo.ObjectID()._str,
        people_his_id: his_id,
        url: url[i].url
      });
  }

  var msg = {
    _id: new Mongo.ObjectID()._str,
    form: {
      id: user._id,
      name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
      icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png'
    },
    to: to,
    images: images,
    to_type: "group",
    type: "text",
    create_time: new Date(),
    people_id: id,
    people_uuid: uuid,
    people_his_id: his_id,
    is_read: false
  };

  switch(type){
    case 'label':
      msg.text = '这是"' + value + '" ~';
      Messages.insert(msg);
      sendMqttGroupMessage(msg.to.id, msg);
      // sendMqttMessage('workai', msg);
      // sendMqttMessage('trainset', {url: url, person_id: '', device_id: uuid, face_id: id});
      break;
    case 'check':
      msg.text = '这是"' + value + '" ~';
      Messages.insert(msg);
      sendMqttGroupMessage(msg.to.id, msg);
      // sendMqttMessage('workai', msg);
      // sendMqttMessage('trainset', {url: url, person_id: '', device_id: uuid, face_id: id});
      break;
    case 'remove':
      msg.text = '删除这条信息: ' + value;
      Messages.insert(msg);
      sendMqttGroupMessage(msg.to.id, msg);
      // sendMqttMessage('workai', msg);
      if (url && Object.prototype.toString.call(url) === '[object Array]'){
        url.forEach(function(img){
          sendMqttMessage('trainset', {url: img.url, person_id: '', device_id: uuid, face_id: id, drop: true});
        });
      }else{
        sendMqttMessage('trainset', {url: url, person_id: '', device_id: uuid, face_id: id, drop: true});
      }
      break;
  };
  Meteor.setTimeout(function() {
    $('.simple-chat-label').remove();
    $('#swipebox-overlay').remove();
  }, 500);
};

var showBoxView = null;
var showBox = function(title, btns, list, tips, callback){
  if(showBoxView)
    Blaze.remove(showBoxView);
  showBoxView = Blaze.renderWithData(Template._simpleChatToChatLabelBox, {
    title: title,
    btns: btns || ['知道了'],
    list: list,
    tips: tips,
    callback: callback || function(){},
    remove: function(){Blaze.remove(showBoxView);}
  }, document.body);
};
Template._simpleChatToChatLabelBox.events({
  'click .mask': function(e, t){
    t.data.remove();
  },
  'click .my-btn': function(e, t){
    var index = 0;
    var btns = t.$('.my-btn');
    var value = t.$('select').val() || t.$('input').val();

    for(var i=0;i<btns.length;i++){
      if(btns[i].innerHTML === $(e.currentTarget).html()){
        index = i;
        break;
      }
    }
    console.log('selected:', index, value);
    t.data.remove();
    t.data.callback(index, value);
  },
  'change select': function(e, t){
    var $input = t.$('input');
    var $select = t.$('select');

    if($(e.currentTarget).val() === ''){
      $select.hide();
      $input.show();
    }else{
      $input.hide();
      $select.show();
    }
  }
});

var setMsgList = function(where, action){
  if (action === 'update') {
    lazyloadInit();
  }
  if(action === 'insert' || action === 'remove')
    setScrollToBottom();
};

Template._simpleChatToChatItem.events({
  'click li img.swipebox': function(e){
    var imgs = []
    var index = 0;
    var selected = 0;
    var data = Blaze.getData($(e.currentTarget).attr('data-type') === 'images' ? $(e.currentTarget).parent().parent().parent()[0] : $('#'+this._id)[0]);

    console.log('data:', data);
    // $('li#' + data._id + ' img.swipebox').each(function(){
    //   imgs.push({
    //     href: $(this).attr('src'),
    //     title: ''
    //   });
    //   if($(e.currentTarget).attr('src') === $(this).attr('src'))
    //     selected = index;
    //   index += 1;
    // });
    if(data.images.length > 0){
      for(var i=0;i<data.images.length;i++){
        imgs.push({
          href: data.images[i].url,
          title: ''
        });
        if(data.images[i].url === $(e.currentTarget).attr('src'))
          selected = i;
      }
    }
    if(imgs.length > 0){
      console.log('imgs:', imgs);
      var labelView = null;

      $.swipebox(imgs, {
        initialIndexOnArray: selected,
        hideCloseButtonOnMobile : true,
        loopAtEnd: false,
        beforeOpen: function(){
          if (data.people_id)
            Session.set('SimpleChatToChatLabelImage', data.images[selected]);
            labelView = Blaze.renderWithData(Template._simleChatToSwipeBox, data, document.body);
        },
        afterClose: function(){
          if (data.people_id)
            Blaze.remove(labelView);
        },
        indexChanged: function(index){
          var data = Blaze.getData($('.simple-chat-swipe-box')[0]);
          var $img = $('#swipebox-overlay .slide.current img');

          console.log($img.attr('src'));
          console.log(_.pluck(data.images, 'url'));
          Session.set('SimpleChatToChatLabelImage', data.images[index]);
        }
      });
    }
  },
  'click .sendfiled':function(e){
    sendMqttMsg(this);
  },
  'click li div.showmore':function(e){
    if (this.type === 'url') {
      return;
    }
    console.log(e.currentTarget.id);
    id = e.currentTarget.id;
    $('li#' + id + ' div.showmore').hide();
    $('li#' + id + ' div.text .imgs').removeAttr('style');
    $('li#' + id + ' div.text .imgs-1-box').removeAttr('style');
  },
  'click .check': function(){
    if (this.type === 'url') {
      return;
    }
    Template._simpleChatLabelDevice.open(this);
  },
  'click .crop':function(){
    if (this.type === 'url') {
      return;
    }
    Template._simpleChatLabelCrop.open(this);
  },
  'click .remove': function(){
    if (this.type === 'url') {
      return;
    }
    Template._simpleChatLabelRemove.open(this);
  },
  'click .yes': function(){
    if (this.type === 'url') {
      return;
    }
    // update label
   var name = this.images[0].label;
   var msgObj = this;
    Meteor.call('get-id-by-name1', msgObj.people_uuid, name, msgObj.to.id, function(err, res){
      if (err || !res)
        return PUB.toast('标注失败，请重试~');

      var setNames = [];
      for (var i=0;i<msgObj.images.length;i++){
        if (msgObj.images[i].label) {
          var trainsetObj = {
            group_id: msgObj.to.id,
            type: 'trainset',
            url: msgObj.images[i].url,
            person_id: '',
            device_id: msgObj.people_uuid,
            face_id: res ? res.faceId : msgObj.images[i].id,
            drop: false,
            img_type: msgObj.images[i].img_type,
            style:msgObj.images[i].style,
            sqlid:msgObj.images[i].sqlid
          };
          console.log("##RDBG clicked yes: " + JSON.stringify(trainsetObj));
          sendMqttMessage('/device/'+msgObj.to.id, trainsetObj);
        }

        if (_.pluck(setNames, 'id').indexOf(msgObj.images[i].id) === -1)
          setNames.push({uuid: msgObj.people_uuid, id: msgObj.images[i].id, url: msgObj.images[i].url, name: msgObj.images[i].label});
      }
      if (setNames.length > 0)
        Meteor.call('set-person-names', msgObj.to.id, setNames);

      var user = Meteor.user();
      if(user.profile && user.profile.userType && user.profile.userType == 'admin'){
        sendMqttGroupLabelMessage(msgObj.to.id, {
          _id: new Mongo.ObjectID()._str,
          msgId: msgObj._id,
          user: {
            id: user._id,
            name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
            icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
          },
          is_admin_relay: true,
          people_id: setNames[0].id,
          text: setNames[0].name,
          createAt: new Date()
        });
      }
      sendMqttGroupLabelMessage(msgObj.to.id, {
        _id: new Mongo.ObjectID()._str,
        msgId: msgObj._id,
        user: {
          id: user._id,
          name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
          icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
        },
        createAt: new Date()
      });

      // update collection
      Messages.update({_id: msgObj._id}, {$set: {label_complete: true}});

      Meteor.setTimeout(function(){
        var $box = $('.box');
        if ($('.oneself_box').length > 0) {
           $box = $('.oneself_box');
        }
        $box.scrollTop($box.scrollTop()+10);
        $box.trigger("scroll");
      }, 500);

    });
  },
  'click .no': function(){
    if (this.type === 'url') {
      return;
    }
    var user = Meteor.user();
    if(user.profile && user.profile.userType && user.profile.userType == 'admin'){
      console.log(this)
      var msgObj = this;
      var images = this.images;
      for(var i=0;i< images.length;i++){
        // send to device
        var trainsetObj = {
          group_id: msgObj.to.id,
          type: 'trainset',
          url: images[i].url,
          device_id: msgObj.people_uuid,
          face_id: msgObj.people_id ? msgObj.people_id : images[i].id,
          drop: true,
          img_type: images[i].img_type,
          raw_face_id: images[i].id,
          style:images[i].style,
          sqlid:images[i].sqlid
        };
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        sendMqttMessage('/device/'+msgObj.to.id, trainsetObj);

        images[i].label = null;
      }

      this.images = images;
      Template._simpleChatLabelDevice.open(this);
      return;
    }
    Template._simpleChatLabelLabel.open(this);
  },
  'click .show_more': function(e, t){
    if (this.type === 'url') {
      return;
    }
    var $box = $('.box');
    if ($('.oneself_box').length > 0) {
       $box = $('.oneself_box');
    }
    var $li = $box.find('li#'+ this._id);
    var $imgs = $li.find('.text .imgs');
    var $labels = $li.find('.text .imgs-1-item');
    var $show = $li.find('.show_more');

    if ($imgs.find('div._close').length > 0 || $labels.find('div._close').length > 0){
      $show.html('<i class="fa fa-angle-up"></i>');
      $imgs.find('.img_container').removeClass('_close');
      $labels.find('.img_container').removeClass('_close');
      $box.trigger("scroll");
      $box.scrollTop($box.scrollTop()+1);
      // $box.scrollTop($box.scrollTop()-1);
    } else {
      $show.html('<i class="fa fa-angle-right"></i>');
      $imgs.find('.img_container').addClass('_close');
      $labels.find('.img_container').addClass('_close');
    }
  }
});

Template._simpleChatToChatLabel.helpers({
  data: function(){
    return Session.get('SimpleChatToChatLabelImage');
  }
});

Template._simpleChatToChatLabel.events({
  'click .btn-label.yes': function(){
    var $img = $('#swipebox-overlay .slide.current img');
    var data = this;
    var names = get_people_names();

    show_label(data.to.id, function(name){
      Meteor.call('get-id-by-name1', data.people_uuid, name, data.to.id, function(err, res){
        if(err)
          return PUB.toast('标记失败，请重试~');

        console.log(res);
        PeopleHis.update({_id: data.people_his_id}, {
          $set: {fix_name: name, msg_to: data.to},
          $push: {fix_names: {
            _id: new Mongo.ObjectID()._str,
            name: name,
            userId: Meteor.userId(),
            userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
            userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
            fixTime: new Date()
          }}
        }, function(err, num){
          if(err || num <= 0){
            return PUB.toast('标记失败，请重试~');
          }

          Messages.update({_id: data.msg_id, 'images.url': $img.attr('src')}, {
            $set: {
              'images.$.label': name,
              'images.$.result': ''
            }
          });

          var imgtype = '';
          if(data && data.images && data.images[0] && data.images[0].img_type)
              imgtype = data.images[0].img_type;

          onFixName(data.people_id, data.people_uuid, data.people_his_id, $img.attr('src'), data.to, name, 'label');
          sendMqttMessage('trainset', {url: $img.attr('src'), person_id: res.id ? res.id : '', device_id: data.people_uuid, face_id: res ? res.faceId : data.people_id, drop: false, img_type: imgtype});
          PUB.toast('标记成功~');
        });
      });
    });
  },
  'click .btn-yes': function(){
    var $img = $('#swipebox-overlay .slide.current img');
    var data = this;
    var name = data.images[0].label;

    Meteor.call('get-id-by-name1', data.people_uuid, name, data.to.id, function(err, res){
      if(err)
        return PUB.toast('标记失败，请重试~');

      PeopleHis.update({_id: data.people_his_id}, {
        $set: {fix_name: name, msg_to: data.to},
        $push: {fix_names: {
          _id: new Mongo.ObjectID()._str,
          name: name,
          userId: Meteor.userId(),
          userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
          userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
          fixTime: new Date()
        }}
      }, function(err, num){
        if(err || num <= 0){
          return PUB.toast('标记失败，请重试~');
        }

        Messages.update({_id: data.msg_id, 'images.url': $img.attr('src')}, {
          $set: {
            'images.$.label': name,
            'images.$.result': ''
          }
        });

        var imgtype = '';
        if(data && data.images && data.images[0] && data.images[0].img_type)
            imgtype = data.images[0].img_type;

        onFixName(data.people_id, data.people_uuid, data.people_his_id, $img.attr('src'), data.to, name, 'label');
        sendMqttMessage('trainset', {url: $img.attr('src'), person_id: res.id ? res.id : '', device_id: data.people_uuid, face_id: res ? res.faceId : data.people_id, drop: false, img_type: imgtype});
        PUB.toast('标记成功~');
      });
    });
  },
  'click .btn-no': function(){
    var $img = $('#swipebox-overlay .slide.current img');
    var data = this;
    var name = Session.get('SimpleChatToChatLabelImage').label;
    var names = get_people_names();

    showBox('提示', ['重新标记', '删除'], null, '重新标记还是删除？', function(index){
      if(index === 0)
        show_label(data.to.id, function(name){
          Meteor.call('get-id-by-name1', data.people_uuid, name, data.to.id, function(err, res){
            if(err)
              return PUB.toast('标记失败，请重试~');

            PeopleHis.update({_id: data.people_his_id}, {
              $set: {fix_name: name, msg_to: data.to},
              $push: {fix_names: {
                _id: new Mongo.ObjectID()._str,
                name: name,
                userId: Meteor.userId(),
                userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
                userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
                fixTime: new Date()
              }}
            }, function(err, num){
              if(err || num <= 0){
                return PUB.toast('标记失败，请重试~');
              }

              Messages.update({_id: data.msg_id, 'images.url': $img.attr('src')}, {
                $set: {
                  'images.$.label': name,
                  'images.$.result': ''
                }
              });

              var imgtype = '';
              if(data && data.images && data.images[0] && data.images[0].img_type)
                  imgtype = data.images[0].img_type;

              onFixName(data.people_id, data.people_uuid, data.people_his_id, $img.attr('src'), data.to, name, 'label');
              sendMqttMessage('trainset', {url: $img.attr('src'), person_id: res.id ? res.id : '', device_id: data.people_uuid, face_id: res ? res.faceId : data.people_id, drop: false, img_type: imgtype});
              PUB.toast('标记成功~');
            });
          });
        });
      else
        show_remove(function(text){
          PeopleHis.update({_id: data.people_his_id}, {
            $set: {msg_to: data.to},
            $push: {fix_names: {
              _id: new Mongo.ObjectID()._str,
              userId: Meteor.userId(),
              userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
              userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
              fixTime: new Date(),
              fixType: 'remove',
              removeText: text
            }}
          }, function(err, num){
            if(err || num <= 0){
              console.log(err);
              return PUB.toast('删除失败，请重试~');
            }

            Messages.update({_id: data.msg_id, 'images.url': $img.attr('src')}, {
              $set: {
                'images.$.result': 'remove'
              }
            });

            onFixName(data.people_id, data.people_uuid, data.people_his_id, $img.attr('src'), data.to, text, 'remove');
            PUB.toast('删除成功~');
          });
        });
    });
  }
});

var loadScript = function(url, callback){
  if($("script[src='"+url+"']").length > 0)
    return callback && callback();

  var script = document.createElement('script');
  script.type = 'text/javascript';
  if(script.readyState){
    script.onreadystatechange = function(){
      if(script.readyState === 'loaded' || script.readyState === 'complete'){
        script.onreadystatechange = null;
        callback && callback();
      }
    }
  }else{
    script.onload = function(){
      callback && callback();
    };
  }

  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

var selectMediaFromAblumWithSize = function(max_number,width, height,callback) {
    window.imagePicker.getPictures(
        function(results) {

            if (results === undefined) {
                return;
            }

            var length = 0;
            try {
                length = results.length;
            } catch (error) {
                length = results.length;
            }
            if (length === 0) {
                callback('cancel');
                return;
            }

            for (var i = 0; i < length; i++) {
                var timestamp = new Date().getTime();
                var originalFilename = results[i].replace(/^.*[\\\/]/, '');
                var filename = Meteor.userId() + '_' + timestamp + '_' + originalFilename;
                console.log('File name ' + filename);
                console.log('Original full path ' + results[i]);
                var params = '';
                if (device.platform === 'Android') {
                    params = { filename: filename, URI: results[i], smallImage: 'cdvfile://localhost/cache/' + originalFilename };
                } else {
                    params = { filename: filename, URI: results[i], smallImage: 'cdvfile://localhost/persistent/drafts/' + originalFilename };
                }
                callback(null, params, (i + 1), length);
            }
        },
        function(error) {
            console.log('Pick Image Error ' + error);
            if (callback) {
                callback(null);
            }
        }, {
            maximumImagesCount: max_number,
            width: width || 480,
            height: height || 640,
            quality: 20,
            storage: 'persistent'
        });
};

var setScrollToBottomTimeout = null;
var setScrollToBottom = function(){
  if (setScrollToBottomTimeout)
    Meteor.clearTimeout(setScrollToBottomTimeout);
  setScrollToBottomTimeout = Meteor.setTimeout(function(){
    console.log('set scrollTop to end');
    var $box = $('.box');
    var $box_ul = $('.box ul');
    if ($('.oneself_box').length > 0) {
       $box = $('.oneself_box');
       $box_ul = $('.oneself_box ul');
    }
    $box.scrollTop($box_ul.height());
  }, 200);
};

Template._simpleChatToChat.helpers({
  title: function(){
    if(this.type != 'user'){
      group = Groups.findOne({_id: this.id});
      if (group && group.name) {
        return group.name;
      }
    }else{
      var user = Meteor.users.findOne({_id: this.id});
      if (user) {
        return AppConfig.get_user_name(user);
      }
    }
    return '';
  },
  loading: function(){
    return is_loading.get();
  },
  isGroups:function(){
    return page_data && page_data.is_group ? page_data.is_group() : false;
  },
  isNLPGroup:function(){
    if (page_data && page_data.id) {
      var obj = Groups.findOne({_id: page_data.id});
      if (obj && obj.template && obj.template.type === 'nlp_classify') {
        return true;
      }
    }
    return false;
  },
  needShowTips:function(){
    var res = Session.get('simple_chat_need_show_tips');
    return res == true;
  }
});

sendMqttMsg = function(){
  var msg = _.clone(arguments[0]);
  delete msg.send_status
  var callback = function(err){
    if(timeout){
      Meteor.clearTimeout(timeout);
      timeout = null;
    }
    if (err){
      console.log('send mqtt err:', err);
      return Messages.update({_id: msg._id}, {$set: {send_status: 'failed'}});
    }
    Messages.update({_id: msg._id}, {$set: {send_status: 'success'}});
  };
  var timeout = Meteor.setTimeout(function(){
    var obj = Messages.findOne({_id: msg._id});
    if (obj && obj.send_status === 'sending')
      Messages.update({_id: msg._id}, {$set: {send_status: 'failed'}});
  }, 1000*15);

  Messages.update({_id: msg._id}, {$set: {send_status: 'sending'}});

  if (msg.type === 'image'){
    if(!msg.images[0].url){
      return multiThreadUploadFile_new([{
        type: 'image',
        filename: msg.images[0].filename,
        URI: msg.images[0].uri
      }], 1, function(err, res){
        if(err || res.length <= 0)
          return callback(new Error('upload error'));

        if(timeout){
          Meteor.clearTimeout(timeout);
          timeout = null;
        }
        window.___message.update(id, res[0].imgUrl);
        msg = Messages.findOne({_id: msg.to.id});
        sendMqttGroupMessage(msg.to.id, msg, callback);
      });
    }
  }

  if(msg.to_type === 'group')
    sendMqttGroupMessage(msg.to.id, msg, callback);
  else
    sendMqttUserMessage(msg.to.id, msg, callback);
};

Template._simpleChatToChat.events({
  'focus .input-text': function(){
    $('.box').animate({scrollTop:'999999px'}, 800);
    /*Meteor.setTimeout(function(){
      $('body').scrollTop(999999);
    }, 500);*/
  },
  'submit .input-form': function(e, t){
    if (Session.get('isFromClipboard') == true) {
      Session.set('isFromClipboard',false);
    }
    else{
      $('.input-text').focus();
    }
    try{
      var data = page_data;
      var text = $('.input-text').val();
      var to = null;
      var is_nlp_classify_group = false;

      var isInputLink = function(link){

        var decodelink = decodeURIComponent(link);
        var importLink, matchArray, regexToken;

        regexToken = /\b(((http|https?)+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;

        matchArray = regexToken.exec(decodelink);

        if (matchArray !== null) {
          importLink = matchArray[0];
          if (matchArray[0].indexOf('http') === -1) {
            importLink = "http://" + matchArray[0];
          }
        }
        return importLink;
      }
      var inputLink = isInputLink(text);

      if(!text){
        $('.box').scrollTop($('.box ul').height());
        return false;
      }
      if(data.type === 'group'){
        var obj = Groups.findOne({_id: data.id});
        to = {
          id: data.id,
          name: obj.name,
          icon: obj.icon
        };
        if (obj.template && obj.template.type === 'nlp_classify') {
          is_nlp_classify_group = true;
        }
      }else{
        var obj = Meteor.users.findOne({_id: data.id});
        to = {
          id: t.data.id,
          name: AppConfig.get_user_name(obj),
          icon: AppConfig.get_user_icon(obj)
        };
      }

      var wait_classify = null;
      if (is_nlp_classify_group && inputLink) {
        wait_classify = true;
      }

      var msg = {
        _id: new Mongo.ObjectID()._str,
        form:{
          id: Meteor.userId(),
          name: AppConfig.get_user_name(Meteor.user()),
          icon: AppConfig.get_user_icon(Meteor.user())
        },
        to: to,
        to_type: data.type,
        type: 'text',
        text: text,
        create_time: new Date(),
        is_read: false,
        wait_classify:wait_classify,
        send_status: 'sending'
      };
      Messages.insert(msg, function(){
        sendMqttMsg(msg);
        setScrollToBottom();
      });

      $('.input-text').val('');
      return false;
    }catch(ex){console.log(ex); return false;}
  },
  'click .groupsProfile':function(e,t){
    var data = page_data;
    Router.go('/groupsProfile/'+data.type+'/'+data.id);
  },
  'click .userProfile':function(e,t){
    var data = page_data;
    Router.go('/groupsProfile/'+data.type+'/'+data.id);
    //PUB.page('/simpleUserProfile/'+data.id);
  },
  'click .ta div.icon':function(e){
     console.log('i clicked a chat userICON');
     Template._simpleChatOneSelfMsg.open(this);
  }

});

var renderMoreButtonTimeout = null;
var renderMoreButton = function(){
  if (renderMoreButtonTimeout)
    Meteor.clearTimeout(renderMoreButtonTimeout);
  renderMoreButtonTimeout = Meteor.setTimeout(function(){
    var $box_ul = $('.box ul');
    $box_ul.find('li.data-show-more-render').each(function(){
      var $li = $(this);
      var $li_show_more = $li.find('.show_more');

      // 默认图像
      var $imgs = $li.find('.text > .imgs img');
      if ($imgs.length >= 4){
        $li_show_more.show();
        return $li.removeClass('data-show-more-render');
      }

      // 标注过的图
      $imgs = $li.find('.text > .imgs-1-box img');
      if ($imgs.length >= 4){
        $li_show_more.show();
        return $li.removeClass('data-show-more-render');
      }

      // 有裁剪按钮的图
      $imgs = $li.find('.img > .imgs img');
      if ($imgs.length >= 4){
        $li_show_more.show();
        return $li.removeClass('data-show-more-render');
      }
    });
  }, 1000);
};

Template._simpleChatToChatItem.onRendered(function(){
  var data = this.data;

  // if (data.form.id === Meteor.userId() && data.send_status === 'sending')
  //   sendMqttMsg(data);

  touch.on(this.$('li'),'hold',function(ev){
    var msg = Messages.findOne({_id: data._id});
    console.log('hold event:', msg);
    if (!msg)
      return;

    if (msg.form.id === Meteor.userId() && (msg.send_status === 'failed' || msg.send_status === 'sending')){
      switch(msg.send_status){
        case 'failed':
          window.plugins.actionsheet.show({
            title: '消息发送失败，请选择？',
            buttonLabels: ['重新发送', '删除'],
            addCancelButtonWithLabel: '返回',
            androidEnableCancelButton: true
          }, function(index){
            if (index === 1)
              sendMqttMsg(msg);
            else if (index === 2)
              Messages.remove({_id: msg._id});
          });
          break;
        case 'sending':
          window.plugins.actionsheet.show({
            title: '消息发送中，请选择？',
            buttonLabels: ['取消发送'],
            addCancelButtonWithLabel: '返回',
            androidEnableCancelButton: true
          }, function(index){
            if (index === 1)
              Messages.remove({_id: msg._id});
          });
          break;
      }
    }
  });
});

Template._simpleChatToChatItem.helpers({
  is_system_message:function(){
    if (this.type === 'system') {
      return true;
    }
    return false;
  },
  is_url_type:function(){
    if (this.type === 'url') {
      return true;
    }
    return false;
  },
  is_text_type:function(type){
    return type === 'text'
  },
  is_error: function(images){
    for(var i=0;i<images.length;i++){
      if (images[i].error)
        return true;
    }
    return false;
  },
  is_remove: function(images){
    for(var i=0;i<images.length;i++){
      if (images[i].remove)
        return true;
    }
    return false;
  },
  is_label: function(images){
    for(var i=0;i<images.length;i++){
      if (images[i].label)
        return true;
    }
    return false;
  },
  is_remove_label: function(images){
    for(var i=0;i<images.length;i++){
      if (images[i].remove || images[i].label)
        return true;
    }
    return false;
  },
  is_wait_img: function(images){
    for(var i=0;i<images.length;i++){
      if (!images[i].remove && !images[i].label && !images[i].error)
        return true;
    }
    return false;
  },
  is_wait_item: function(item){
    return !item.remove && !item.label && !item.error;
  },
  ta_me: function(id){
    return id != Meteor.userId() ? 'ta' : 'me';
  },
  is_me: function(id){
    return id === Meteor.userId();
  },
  status_sending: function(val){
    return val === 'sending';
  },
  status_failed: function(val){
    return val === 'failed';
  },
  show_images: function(images){
    renderMoreButton();
  }
});

window.___message = {
  insert: function(id, filename, uri){
    var data = page_data;
    var to = null;
    var img_type = null;
    var faceId = new Mongo.ObjectID()._str;

    if(data.type === 'group'){
      var obj = Groups.findOne({_id: data.id});
      to = {
        id: data.id,
        name: obj.name,
        icon: obj.icon
      };
      if (obj.template && obj.template.img_type) {
        img_type = obj.template.img_type;
      }
    }else{
      var obj = Meteor.users.findOne({_id: data.id});
      to = {
        id: data.id,
        name: AppConfig.get_user_name(obj),
        icon: AppConfig.get_user_icon(obj)
      };
    }

    Messages.insert({
      _id: id,
      form:{
          id: Meteor.userId(),
          name: AppConfig.get_user_name(Meteor.user()),
          icon: AppConfig.get_user_icon(Meteor.user())
      },
      to: to,
      to_type: data.type,
      type: 'image',
      images:[
        {
          _id: new Mongo.ObjectID()._str,
          id:faceId,
          url:null,
          label:null,
          people_his_id:id,
          img_type:img_type,
          thumbnail: '/packages/feiwu_simple-chat/images/sendingBmp.gif',
          filename: filename,
          uri: uri
        }
      ],
      //thumbnail: '/packages/feiwu_simple-chat/images/sendingBmp.gif',
      create_time: new Date(),
      people_uuid:'',
      people_id: faceId,
      people_his_id:id,
      wait_lable:true,
      is_read: false,
      send_status: 'sending'
    }, function(err, id){
      console.log('insert id:', id);
      $('.box').scrollTop($('.box ul').height());
    });
  },
  update: function(id, url){
    var msg = Messages.findOne({_id: id});
    var images = msg.images;
    for (var i = 0; i < images.length; i++) {
      images[i].url = url;
    }
    Messages.update({_id: id}, {$set: {
      images: images
    }}, function(){
      console.log('update id:', id);
      $('.box').scrollTop($('.box ul').height());
      sendMqttMsg(msg);
      lazyloadInit();
    });
  },
  remove: function(id){
    Messages.remove({_id: id}, function(){
      console.log('remove id:', id);
      $('.box').scrollTop($('.box ul').height());
    });
  }
};

var updateMessageForTemp = function(id){
  console.log('update message from temp:', id);

  MessageTemp.find({'msg.to.id': id}, {sort: {createAt: 1}, limit: 20}).fetch().forEach(function(item){
    Meteor.setTimeout(function(){
      MessageTemp.remove({_id: item._id});
      onMqttMessage(item.topic, JSON.stringify(item.msg));
    }, 0);
  });
};

var msgGroup = [];
var updateNewMessageInterval = null;
var updateNewMessage = function(id){
  if (msgGroup.indexOf(id) === -1)
    msgGroup.push(id);
  if (updateNewMessageInterval)
    return;

  updateNewMessageInterval = Meteor.setInterval(function(){
    if (MessageTemp.find({}).count() <= 0){
      if (updateNewMessageInterval)
        Meteor.clearInterval(updateNewMessageInterval);
      msgGroup = [];
      updateNewMessageInterval = null;
    } else {
      msgGroup.forEach(function(item){
        updateMessageForTemp(item)
      });
    }
  }, 1000*30); // 30 秒取一次最新消息
};

//收到推送消息时立刻从temp中取一次数据
SimpleChat.onPushNotifacation = function(){
  if (MessageTemp.find({}).count() > 0) {
    msgGroup.forEach(function(item){
        updateMessageForTemp(item);
      });
  }
};

//删除本地数据库过多的老的聊天数据
var clearMsgTime = null;
var clearMsgLastTime = null;
var clearMsgForGroundDB = function(){
  if (Meteor.userId()) {
    Meteor.subscribe('get-my-group',Meteor.userId(), {
      onReady: function() {
        var myGroup = GroupUsers.find({user_id: Meteor.userId()});
        if (myGroup) {
          myGroup.forEach(function(item){
            var msg = MessagesHis.find({'to.id': item.group_id}).fetch();
            if (msg && msg.length > 100) {
              for (var i = 0; i < msg.length - 100; i++) {
                MessagesHis.remove({_id:msg[i]._id});
              }
            }
          });
        }
      }
    });
  }
}
var clearMoreOldMessage = function(){
   if (clearMsgTime) {
    Meteor.clearTimeout(clearMsgTime);
    clearMsgTime = null;
   }
   if (clearMsgLastTime && new Date() - clearMsgLastTime > 1000*300) {
    clearMsgForGroundDB();
    clearMsgLastTime = new Date();
   }
   else{
    clearMsgTime = Meteor.setTimeout(function(){
      clearMsgForGroundDB();
      clearMsgLastTime = new Date();
      clearMsgTime = null;
    },1000*60);
   }
}

SimpleChat.onMqttMessage = function(topic, msg) {
  var msgObj = JSON.parse(msg);

  if (!(topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/')))
    return;
  if (msgObj.create_time)
      msgObj.create_time = new Date(msgObj.create_time);
  else
      msgObj.create_time = new Date();
  if (msgObj.to_type == 'group') {

    var group_id = msgObj.to.id;
    var group = SimpleChat.Groups.findOne({_id: group_id});
    var isAdmin = Meteor.user() && Meteor.user().profile && Meteor.user().profile.userType && Meteor.user().profile.userType == 'admin';
    if(group && group.rejectLabelMsg && !isAdmin && typeof(msgObj.wait_lable) != 'undefined'){
      console.log('辅助用户关闭了该群相应的label接收')
      return;
    }

    var where = {
      to_type: msgObj.to_type,
      'to.id': msgObj.to.id,
    };
    if (msgObj.wait_classify == false) {
      onNLPClassifyMessage(topic,msgObj);
      return;
    }
    var msgCount = Messages.find(where).count();
    if (msgCount < 10) {
      onMqttMessage(topic, msg);
      return;
    }
  }
  if (msgObj.to_type === 'user' && msgObj.to.id == Meteor.userId()) {
    if (msgObj.type === 'haveReadMsg') {
      Messages.find({'form.id':Meteor.userId(),'to.id':msgObj.form.id,is_read:false}).forEach(function(item){
          Messages.update({_id:item._id},{$set:{is_read:true}});
      })
      return;
    }

    if (msgObj.type === 'register_company') {
      if (msgObj.isExist === true) {
        function callback(){
          Meteor.call('set-perf-link',msgObj.group_id,msgObj.perf_info,function(error,res){
            if (error) {
               return PUB.toast('绑定异常~');
            }
            PUB.toast('绑定成功！');
          });
        }
        try{
          navigator.notification.confirm(msgObj.text,function
                (index){if(index == 2){callback()}},
                '提示',['暂不','绑定']);
        }
        catch (error){
          if(confirm(msgObj.text)){
            callback()
          }
        }
      }
      else{
        try{
          navigator.notification.alert(msgObj.text,function
                (index){},
                '提示','我知道了');
        }
        catch (error){
          alert(msgObj.text);
        }
      }
      return;
    }

    //群主解散了该群
    if (msgObj.is_group_del && msgObj.group_id) {
      var id = msgObj.group_id;
      if (mqtt_connection) {
        mqtt_connection.unsubscribe("/msg/g/" + id);
      }
      MsgSession.remove({userId: Meteor.userId(),toUserId:id});
      try{
        var where = {'to.id': id, to_type: 'group'};
        Messages.remove(where);
        Meteor.setTimeout(function(){
          MessagesHis.remove(where);
        },100);
      }
      catch(error){
        console.log('remove msg err when group has been deleted');
      }
    }
    //ta 被我拉黑
    if(BlackList.find({blackBy: Meteor.userId(), blacker:{$in: [msgObj.form.id]}}).count() > 0){
      console.log(msgObj.to.id+'被我拉黑');
      return;
    }
  }
  if (!msgObj.is_people)
    return Messages.insert(msgObj);

  onMqttMessage(topic, msg);
  // MessageTemp.insert({
  //   topic: topic,
  //   msg: msgObj,
  //   createAt: msgObj.create_time || new Date()
  // }, function(err){
  //   if (!err)
  //     updateNewMessage(msgObj.to.id);
  // });
  clearMoreOldMessage();
};

var onMqttMessage = function(topic, msg) {
  var insertMsg = function(msgObj, type){
    if(msgObj.admin_remove){
      return;
    }
    console.log(type, msgObj._id);
    Messages.insert(msgObj, function(err, _id){
      if (err)
        console.log('insert msg error:', err);
    });
  };

  if (!(topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/')))
    return;

  Session.set('hasNewLabelMsg', true);
  var msgObj = JSON.parse(msg);

  if (msgObj.to_type == 'group') {
    var record = GroupUsers.findOne({group_id: msgObj.to.id, user_id: Meteor.userId()});
    if (!record) {
      var User = Meteor.user();
      if(User && User.profile && User.profile.userType && User.profile.userType == 'admin') {
          console.log('this is adminstrator, show all message')
      }
      else {
          console.log('receive group message from group that i am not in: ' + msgObj.to.id);
          return;
      }
    }
  }
  if (msgObj.type === 'url') {
    onMqttNLPMessage(topic,msgObj);
  }
  msgObj.create_time = msgObj.create_time ? new Date(msgObj.create_time) : new Date();

  //一分钟以内的消息
  var whereTime = new Date((msgObj.create_time.getTime() - 60*1000));
  var msgType = topic.split('/')[2];
  var where = {
    to_type: msgObj.to_type,
    wait_lable: msgObj.wait_lable,
    people_uuid:msgObj.people_uuid,
    label_complete: {$ne: true},
    label_start: {$ne: true},
    'to.id': msgObj.to.id,
    images: {$exists: true},
    create_time: {$gte: whereTime},
    type: 'text'
  };

  // 后收到消息处理
  var msg_admin_realy = MsgAdminRelays.findOne({_id: msgObj._id});
  if(msg_admin_realy) {
    msgObj.is_admin_relay = msg_admin_realy.is_admin_relay;
    msgObj.admin_remove = msg_admin_realy.admin_remove;

    msgObj.people_id = msg_admin_realy.people_id;
    msgObj.text = msg_admin_realy.text;
    msgObj.wait_lable = false;
    msgObj.label_complete = false;
    msgObj.is_read = false;

    var setObjExtend = {
      is_admin_relay:msg_admin_realy.is_admin_relay,
      admin_remove: msg_admin_realy.admin_remove,
      people_id: msg_admin_realy.people_id,
      text: msg_admin_realy.text,
      wait_lable: false,
      label_complete: false,
      is_read: false
    }
    console.log('==sraita==,after the admin label'+ JSON.stringify(msgObj));
    MsgAdminRelays.remove({_id: msg_admin_realy._id});
  }

  msgObj.msg_ids = [{id: msgObj._id}];

  if (msgObj.images && msgObj.length > 0 && msgObj.is_people && msgObj.people_id){
    for(var i=0;i<msgObj.images.length;i++)
      msgObj.images[i].id = msgObj.people_id;
  }

  if (Messages.find({_id: msgObj._id}).count() > 0)
    return console.log('已存在此消息:', msgObj._id);

  var targetMsg = null;

  if (msgObj.tid && msgObj.tid !== '') {
    //最近十条记录
    var targetArray = Messages.find({to_type: msgObj.to_type,'to.id': msgObj.to.id}, {limit: 10, sort: {create_time: -1}}).fetch();
    for (var i = 0; i < targetArray.length; i++) {
      //tid 相同且没完成标记
      if (targetArray[i].tid === msgObj.tid && targetArray[i].label_complete !== true) {
        targetMsg = targetArray[i];
        console.log('找到符合条件tid=' + msgObj.tid + '的记录~');
        break;
      }
    }
  }
  else{
      if (msgObj.wait_lable){where.people_id = msgObj.people_id;}
      else if (!msgObj.wait_lable && msgObj.images && msgObj.images.length > 0) {where['images.label'] = msgObj.images[0].label}
      else {return Messages.insert(msgObj)}

      console.log('SimpleChat.SimpleChat where:', where);
      targetMsg = Messages.findOne(where, {sort: {create_time: -1}});
      //是否是最后一条
      var is_last_msg = false;
      if (targetMsg) {
        var lastMsg = Messages.findOne({to_type:msgObj.to_type,'to.id':msgObj.to.id}, {sort: {create_time: -1}});
        if (targetMsg._id === lastMsg._id) {
          is_last_msg = true;
        }
      }
      if (!is_last_msg) {
        return insertMsg(msgObj, '不是最后一条消息');
      }
  }
  // TODO: 还存在问题
  // if (withMessageHisEnable && !targetMsg){
  //   targetMsg = MessagesHis.findOne(where, {sort: {create_time: -1}});
  //   targetMsg.hasFromHistory = true;
  // }

  if (!targetMsg || !targetMsg.images || targetMsg.images.length <= 0)
    return insertMsg(msgObj, '无需合并消息');
  if (targetMsg.images && targetMsg.images.length >= 20)
    return insertMsg(msgObj, '单行信息超过 20 条');
  if (!msgObj.images || msgObj.images.length <= 0)
    return insertMsg(msgObj, '不是图片消息');
  if (msgObj.to_type != 'group' || !msgObj.is_people)
    return insertMsg(msgObj, '不是 Group 或人脸消息');

  var msg_ids = targetMsg.msg_ids;
  var is_exist = false;
  if (msg_ids && msg_ids.length > 0) {
    for (var i = 0; i < msg_ids.length; i++) {
      if (msg_ids[i].id === msgObj._id) {
        is_exist = true;
        console.log(msgObj._id+':此消息已合并过~');
        break;
      }
    }
  }
  if (is_exist) {
    return;
  }

  var setObj = {/*create_time: new Date(),*/ 'form.name': msgObj.form.name, hasFromHistory: false};
  if (msgObj.wait_lable){
    //根据tid合并时会出现 wait_lable不同的情况
    if (targetMsg.wait_lable === false) {
      setObj.text = targetMsg.text;
      //var label = targetMsg.text.replace('AI观察到 ','').replace('：','');
      var label = '';
      for (var i = 0; i < targetMsg.images.length; i++) {
        if (targetMsg.images[i].label) {
          label = targetMsg.images[i].label;
          break;
        }
      }
      for (var i = 0; i < targetMsg.images.length; i++) {
        targetMsg.images[i].label = label;
      }
      for (var i = 0; i < msgObj.images.length; i++) {
        msgObj.images[i].label = label;
      }
    }
    else{
      var count = 0;
      for(var i=0;i<targetMsg.images.length;i++){
        if (!targetMsg.images[i].label && !targetMsg.images[i].remove && !targetMsg.images[i].error)
          count += 1;
      }
      for(var i=0;i<msgObj.images.length;i++){
        if (!msgObj.images[i].label && !msgObj.images[i].remove && !msgObj.images[i].error)
          count += 1;
      }
      if (count > 0){
        setObj.text = 'AI观察到有人在活动(' + count + '次)';
      } else {
        setObj.text = 'AI观察到有人在活动';
      }
    }
  } else {
    if (msgObj.tid && msgObj.tid !== '' && targetMsg.wait_lable === false) {
      var is_label_same = true; //识别出的名字是否相同
      for(var i=0;i<targetMsg.images.length;i++){
        if (targetMsg.images[i].label){
          if (msgObj.images[0].label !== targetMsg.images[i].label ) {
            is_label_same = false;
            break;
          }
        }
      }
      if (is_label_same === false) {
        return insertMsg(msgObj, 'tid相同，但label_name不同');
      }
    }
    setObj.text = 'AI观察到 '+msgObj.images[0].label + '：';
    if (targetMsg.tid) {
      setObj.wait_lable = msgObj.wait_lable;
      for (var i = 0; i < targetMsg.images.length; i++) {
        targetMsg.images[i].label = msgObj.images[0].label;
      }
    }
  }

  if(setObjExtend){
    setObj = $.extend(setObj,setObjExtend);
  }
  if (targetMsg.tid) {
    setObj.images = targetMsg.images.concat(msgObj.images);
    Messages.update({_id: targetMsg._id}, {
      $set: setObj,
      $push: {msg_ids: {id: msgObj._id}}
    }, function(err, num){
      if (err || num <= 0)
        insertMsg(msgObj, 'update 失败');
    });
    return;
  }
  Messages.update({_id: targetMsg._id}, {
    $set: setObj,
    $push: {images: {$each: msgObj.images}, msg_ids: {id: msgObj._id}}
  }, function(err, num){
    if (err || num <= 0)
      insertMsg(msgObj, 'update 失败');
  });
};

SimpleChat.onMqttLabelMessage = function(topic, msg) {
  if (!topic.startsWith('/msg/l/'))
    return;

  var msgObj = JSON.parse(msg);
  var isAdmin = Meteor.user() && Meteor.user().profile && Meteor.user().profile.userType && Meteor.user().profile.userType == 'admin';
  if (msgObj.createAt)
      msgObj.createAt = new Date(msgObj.createAt);
  else
      msgObj.createAt = new Date();
  var msgId = topic.split('/')[3];
  var targetMsg = Messages.findOne({$or: [{'msg_ids.id': msgObj.msgId}, {_id: msgObj.msgId}]}, {sort: {create_time: -1}});

  // if (!targetMsg)
  //   return;
  if (!targetMsg){
    // 处理admin label消息后到的情况
    if(msgObj.is_admin_relay){
      msgObj._id = msgObj.msgId;
      MsgAdminRelays.insert(msgObj);
    }
    return;
  }
  if(msgObj.is_admin_relay){
    if(msgObj.admin_remove){
      // admin 发送了删除消息
      Messages.remove({_id: targetMsg._id});
      return;
    }
    // try{
      // 处理辅助用户已经标注的图片
      console.log('the msgObjj ='+JSON.stringify(msgObj))
      if(msgObj.setNames.length > 0 && msgObj.labeldImages.length > 0){
        var setObj2 = targetMsg
        for(var i=0;i< msgObj.setNames.length;i++){
          setObj2._id = new Mongo.ObjectID()._str;
          setObj2.text = msgObj.setNames[i].name;
          setObj2.people_id = msgObj.setNames[i].id;
          setObj2.images = [];
          setObj2.wait_lable = false;
          setObj2.label_complete = false;
          setObj2.is_read = false;
          for(var j=0; j < msgObj.labeldImages.length; j++){
            if(msgObj.setNames[i].name == msgObj.labeldImages[j].label){
              setObj2.images.push(msgObj.labeldImages[j])
            }
          }
          // ??? insert 失败？
          console.log('the setObj2='+JSON.stringify(setObj2))
          Messages.insert(setObj2, function(err, _id){
            if (err)
              console.log('the setObj2 ,insert msg error:', err);
          });
        }
      }
      // 处理辅助用户没有标识的图片
      if(msgObj.waitLabelImages && msgObj.waitLabelImages.length > 0){
        var setObj = {
          wait_lable: true,
          label_complete: false,
          is_read: false,
          images: [],
          text: 'AI观察到有人在活动(' + msgObj.waitLabelImages.length + '次)'
        };
        for(var i=0; i< msgObj.waitLabelImages.length ; i++){
          setObj.images.push(msgObj.waitLabelImages[i]);
        }
        Messages.update({_id: targetMsg._id}, {
          $set:setObj
        }, function(){
          Meteor.setTimeout(function(){
            var $box = $('.box');
            if ($('.oneself_box').length > 0) {
               $box = $('.oneself_box');
            }
            $box.scrollTop($box.scrollTop()+1);
            $box.trigger("scroll");
          }, 100);
        });
      }

    // } catch (error){
    //    console.log('==lalalaalal='+error)
    // }
    console.log('==lalalaalal='+JSON.stringify(targetMsg))

    return;
  }
  if (targetMsg.label_users && targetMsg.label_users.length > 0 && _.pluck(targetMsg.label_users, 'id').indexOf(msgObj.user.id) >= 0)
    return;
  Messages.update({_id: targetMsg._id}, {
    $push: {label_users: msgObj.user},
  //  $set: {create_time: new Date()}
  }, function(){
    Meteor.setTimeout(function(){
      var $box = $('.box');
      if ($('.oneself_box').length > 0) {
         $box = $('.oneself_box');
      }
      $box.scrollTop($box.scrollTop()+1);
      $box.trigger("scroll");
    }, 100);
  });
};

// SimpleChat.onMqttMessage('/msg/g/b82cc56c599e4c143442c6d0', JSON.stringify({
//   "_id":new Mongo.ObjectID()._str,
//   "form":{"id":"u5DuPhJYW5raAQYuh","name":"7YRBBDB722002717","icon":"/userPicture.png"},
//   "to":{"id":"b82cc56c599e4c143442c6d0","name":"群聊 2","icon":""},
//   "images":[{"_id":new Mongo.ObjectID()._str,"id":"17","people_his_id":"56rqonm3FNssmh6cR","url":"http://onm4mnb4w.bkt.clouddn.com/eb2a15d6-2310-11e7-9ce5-d065caa81a04","label":null}],
//   "to_type":"group",
//   "type":"text",
//   "text":"[设备 4,17]: -> 需要标注",
//   "create_time": new Date(),
//   "people_id":"17",
//   "people_uuid":"7YRBBDB722002717",
//   "people_his_id":"56rqonm3FNssmh6cR",
//   "wait_lable":true,
//   "is_people":true,
//   "is_read":false
// });

// label
var label_view = null;
var label_limit = new ReactiveVar(0);
show_label = function(group_id, callback){
  if (label_view)
    Blaze.remove(label_view);
  label_view = Blaze.renderWithData(Template._simpleChatToChatLabelName, {
    group_id: group_id,
    callback : callback || function(){}
  }, document.body);
  simple_chat_page_stack.push(label_view);
}
SimpleChat.show_label = show_label;

Template._simpleChatToChatLabelNameImg.onRendered(function(){
  this.$("img.lazy:not([src])").lazyload({
    threshold: 100,
    container: $(".simple-chat-to-chat-label-name")
  });
});
Template._simpleChatToChatLabelName.onRendered(function(){
  label_limit.set(40);
  var gid = this.data.group_id;
  Meteor.subscribe('get-label-names', this.data.group_id, label_limit.get(), {
      onStop: function() {},
      onReady: function(){
          Session.set(gid + "_simpleChatToChatLabelName_loading", false);
      }
  }); // TODO：
  var $box = this.$(".simple-chat-to-chat-label-name");
  $box.scroll(function(){
    if ($box.scrollTop() + $box[0].offsetHeight >= $box[0].scrollHeight){
      label_limit.set(label_limit.get()+20);
      var group_id = Blaze.getData($('.simple-chat-to-chat-label-name')[0]).group_id;
      Meteor.subscribe('get-label-names', group_id, label_limit.get(), {
          onStop: function() {},
          onReady: function(){
              Session.set(group_id + "_simpleChatToChatLabelName_loading", false);
          }
      }); // TODO：
      console.log('load more');
    }
  });
});
Template._simpleChatToChatLabelName.helpers({
  notLoading: function() {
    var loading = Session.get(this.group_id + "_simpleChatToChatLabelName_loading");
    if (loading != null && loading != undefined) {
      if (loading == false)
        return true;
    }

    return false;
  },
  names: function(){
    return PersonNames.find({group_id: this.group_id}, {sort: {createAt: 1}, limit: label_limit.get()});
  }
});
Template._simpleChatToChatLabelName.events({
  'click li': function(e, t){
    $('#label-input-name').val(this.name);
    t.$('li img').removeAttr('style');
    $(e.currentTarget).find('img').attr('style', 'border: 3px solid #39a8fe;box-shadow: 0 0 10px 3px #39a8fe;');
  },
  'click .leftButton': function(){
    Blaze.remove(label_view);
    simple_chat_page_stack.pop();
    label_view = null;
  },
  'click .rightButton': function(e, t){
    if (!$('#label-input-name').val())
      return PUB.toast('请选择或输入名字~');;

    t.data.callback && t.data.callback($('#label-input-name').val());
    Blaze.remove(label_view);
    simple_chat_page_stack.pop();
    label_view = null;
  }
});

// remove
var remove_view = null;
show_remove = function(callback){
  if (remove_view)
    Blaze.remove(remove_view);
  remove_view = Blaze.renderWithData(Template._simpleChatToChatLabelRemove, {
    callback : callback || function(){}
  }, document.body);
  simple_chat_page_stack.push(remove_view);
}

Template._simpleChatToChatLabelRemove.events({
  'click li': function(e, t){
    $('#label-input-name').val($(e.currentTarget).find('.userName').text());
    // t.$('li img').removeAttr('style');
    // $(e.currentTarget).find('img').attr('style', 'border: 1px solid #39a8fe;');
  },
  'click .leftButton': function(){
    Blaze.remove(remove_view);
    simple_chat_page_stack.pop();
    remove_view = null;
  },
  'click .rightButton': function(e, t){
    if (!$('#label-input-name').val())
      return PUB.toast('请输入删除信息的原因~');;

    t.data.callback && t.data.callback($('#label-input-name').val());
    Blaze.remove(remove_view);
    simple_chat_page_stack.pop();
    remove_view = null;
  }
});

Template._simpleChatToChatItemImg.helpers({
  hasAccAndFuzz:function(){
    return this.accuracy && this.fuzziness;
  }
})

Template._simleChatToSwipeBox.helpers({
  data:function(){
    return Session.get('SimpleChatToChatLabelImage');
  },
  hasAccAndFuzz:function(){
    var data = Session.get('SimpleChatToChatLabelImage');
    return data.accuracy && data.fuzziness;
  }
})

SimpleChat.onShowTipsMessages = function(need_show,type){
  Session.set('simple_chat_need_show_tips',need_show);
  Session.set('simple_chat_tips_type',type);
};
