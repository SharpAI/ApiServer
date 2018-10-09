var renderMoreButtonTimeout = null;
var $box_ul = null;
var renderMoreButton = function(){
  if (renderMoreButtonTimeout)
    Meteor.clearTimeout(renderMoreButtonTimeout);
  renderMoreButtonTimeout = Meteor.setTimeout(function(){
    $box_ul.find('li.data-show-more-render').each(function(){
      var $li = $(this);
      var $li_show_more = $li.find('.show_more');
      var $url = $li.find('.url >');

      // 默认链接
      var $urls = $url.find('.urls .url_container');
      if ($urls.length >= 4){
        $li_show_more.show();
        return $li.removeClass('data-show-more-render');
      }

      // 标注过的链接
      $urls = $url.find('.urls-1-box .url_container');
      if ($urls.length >= 4){
        $li_show_more.show();
        return $li.removeClass('data-show-more-render');
      }
    });
  }, 1000);
};

// label
nlp_label_view = null;
show_nlp_label = function(group_id, callback){
  if (nlp_label_view)
    Blaze.remove(nlp_label_view);
  nlp_label_view = Blaze.renderWithData(Template._NLPTextLabelName, {
    group_id: group_id,
    callback : callback || function(){}
  }, document.body)
};

// remove
nlp_remove_view = null;
show_nlp_remove = function(callback){
  if (nlp_remove_view)
    Blaze.remove(nlp_remove_view);
  nlp_remove_view = Blaze.renderWithData(Template._NLPTextRemoveReason, {
    callback : callback || function(){}
  }, document.body)
}

Template._simpleChatToChatItemNLPText.onRendered(function(){
  $box_ul = $('.box ul');
})

Template._simpleChatToChatItemNLPText.helpers({
  is_error: function(urls){
    for(var i=0;i<urls.length;i++){
      if (urls[i].error)
        return true;
    }
    return false;
  },
  has_right_item:function(urls){
    is_error_count = 0;
    for(var i=0;i<urls.length;i++){
      if (urls[i].error)
        is_error_count += 1;
    }
    if (is_error_count === urls.length) {
      return false;
    }
    return true ;
  },
  is_remove: function(urls){
    for(var i=0;i<urls.length;i++){
      if (urls[i].remove)
        return true;
    }
    return false;
  },
  is_label: function(urls){
    for(var i=0;i<urls.length;i++){
      if (urls[i].label)
        return true;
    }
    return false;
  },
  is_remove_label: function(urls){
    for(var i=0;i<urls.length;i++){
      if (urls[i].remove || urls[i].label)
        return true;
    }
    return false;
  },
  is_wait_url: function(urls){
    for(var i=0;i<urls.length;i++){
      if (!urls[i].remove && !urls[i].label && !urls[i].error)
        return true;
    }
    return false;
  },
  is_wait_item: function(item){
    return !item.remove && !item.label && !item.error;
  },
  show_urls: function(urls){
    renderMoreButton();
  }
});

Template._simpleChatToChatItemNLPText.events({
  'click li div.showmore':function(e){
    console.log(e.currentTarget.id);
    id = e.currentTarget.id;
    $('li#' + id + ' div.showmore').hide();
    $('li#' + id + ' div.url .urls').removeAttr('style');
    $('li#' + id + ' div.url .urls-1-box').removeAttr('style');
  },
  'click .check': function(e,t){
    Template._NLPTextDevice.open(this);
  },
  'click .remove': function(){
    Template._NLPTextLabelRemove.open(this);
  },
  'click .yes': function(){
    // update label
    var setNames = [];
    for (var i=0;i<this.urls.length;i++){
      if (this.urls[i].label) {
        var trainsetObj = {group_id: this.to.id, type: 'trainset', url: this.urls[i].url, class_name: this.urls[i].label};
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        sendMqttMessage('/nlp_trainset', trainsetObj);
      }

      if (_.pluck(setNames, 'class_name').indexOf(this.urls[i].class_name) === -1)
        setNames.push({class_name: this.urls[i].label});
    }
    if (setNames.length > 0)
      Meteor.call('set-class-names', this.to.id, setNames);

    var user = Meteor.user();
    sendMqttGroupLabelMessage(this.to.id, {
      _id: new Mongo.ObjectID()._str,
      msgId: this._id,
      user: {
        id: user._id,
        name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
        icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
      },
      createAt: new Date()
    });

    // update collection
    Messages.update({_id: this._id}, {$set: {label_complete: true}});

    Meteor.setTimeout(function(){
      var $box = $('.box');
      if ($('.oneself_box').length > 0) {
         $box = $('.oneself_box');
      }
      $box.scrollTop($box.scrollTop()+10);
      $box.trigger("scroll");
    }, 500);
  },
  'click .no': function(){
    Template._NLPTextLabelError.open(this);
  },
  'click .show_more': function(e, t){
    var $box = $('.box');
    if ($('.oneself_box').length > 0) {
       $box = $('.oneself_box');
    }
    var $li = $box.find('li#' + this._id);
    var $urls = $li.find('.url .urls');
    var $labels = $li.find('.url .urls-1-item');
    var $show = $li.find('.show_more');
    

    if ($urls.find('div._close').length > 0 || $labels.find('div._close').length > 0){
      $show.html('<i class="fa fa-angle-up"></i>');
      $urls.find('.url_container').removeClass('_close');
      $labels.find('.url_container').removeClass('_close');
      $box.trigger("scroll");
      $box.scrollTop($box.scrollTop()+1);
    } else {
      $show.html('<i class="fa fa-angle-right"></i>');
      $urls.find('.url_container').addClass('_close');
      $labels.find('.url_container').addClass('_close');
    }
  }
});


Template._simpleChatToChatItemUrl.events({
  'click .url_container':function(e,t){
    var ref = cordova.ThemeableBrowser.open(this.url, '_blank', {
      closeButton: {
        image: 'back',
        imagePressed: 'back_pressed',
        align: 'left',
        event: 'closePressed'
      },
      statusbar: {
        color: '#000000'
      },
      toolbar: {
        height: 44,
        color: '#F0F0F0'
      }
    });

    ref.addEventListener('closePressed', function(event) {
      return ref.close();
    });
  }
});

onMqttNLPMessage = function(topic,msgObj){
  var insertMsg = function(msgObj, type){
    console.log(type, msgObj._id);
    Messages.insert(msgObj, function(err, _id){
      if (err)
        console.log('insert msg error:', err);
    });
    if (msgObj.class_name) {
      Meteor.call('set-class-name',msgObj.to.id,msgObj.class_name);
    }
  };
  var whereTime = new Date();whereTime.setHours(0);whereTime.setMinutes(0);whereTime.setSeconds(0);
  var msgType = topic.split('/')[2];
  var where = {
    to_type: msgObj.to_type,
    wait_lable: msgObj.wait_lable,
    label_complete: {$ne: true},
    label_start: {$ne: true},
    'to.id': msgObj.to.id,
    urls: {$exists: true},
    create_time: {$gte: whereTime},
    type: 'url'
  };

  msgObj.msg_ids = [{id: msgObj._id}];
  msgObj.create_time = msgObj.create_time ? new Date(msgObj.create_time) : new Date();

  if (Messages.find({_id: msgObj._id}).count() > 0)
    return console.log('已存在此消息:', msgObj._id);


  if (!msgObj.wait_lable && msgObj.urls && msgObj.urls.length > 0) {where['urls.label'] = msgObj.urls[0].label
  }
  else {
    return Messages.insert(msgObj)
  }

  console.log('SimpleChat.SimpleChat where:', where);
  var targetMsg = Messages.findOne(where, {sort: {create_time: -1}});
  // TODO: 还存在问题
  // if (withMessageHisEnable && !targetMsg){
  //   targetMsg = MessagesHis.findOne(where, {sort: {create_time: -1}});
  //   targetMsg.hasFromHistory = true;
  // }

  if (!targetMsg || !targetMsg.urls || targetMsg.urls.length <= 0)
    return insertMsg(msgObj, '无需合并消息');
  if (targetMsg.urls && targetMsg.urls.length >= 20)
    return insertMsg(msgObj, '单行链接超过 20 条');
  if (!msgObj.urls || msgObj.urls.length <= 0)
    return insertMsg(msgObj, '不是NLP消息');
  if (msgObj.to_type != 'group')
    return insertMsg(msgObj, '不是 Group 消息');

  var setObj = {/*create_time: new Date(),*/ 'form.name': msgObj.form.name, hasFromHistory: false};
  if (msgObj.wait_lable){
    var count = 0;
    for(var i=0;i<targetMsg.urls.length;i++){
      if (!targetMsg.urls[i].label && !targetMsg.urls[i].remove && !targetMsg.urls[i].error)
        count += 1;
    }
    for(var i=0;i<msgObj.urls.length;i++){
      if (!msgObj.urls[i].label && !msgObj.urls[i].remove && !msgObj.urls[i].error)
        count += 1;
    }
    if (count > 0)
      setObj.text = count + ' 个链接需要标注';
  } else {
    setObj.text = msgObj.urls[0].label + '：';
  }

  if (targetMsg.hasFromHistory){
    MessagesHis.update({_id: targetMsg._id}, {
      $set: setObj,
      $push: {urls: {$each: msgObj.urls}, msg_ids: {id: msgObj._id}}
    }, function(err, num){
      if (err || num <= 0)
        return insertMsg(msgObj, 'update 失败');

      var model = MessagesHis.findOne({_id: targetMsg._id});
      model && Messages.insert(model);
    });
  } else{
    Messages.update({_id: targetMsg._id}, {
      $set: setObj,
      $push: {urls: {$each: msgObj.urls}, msg_ids: {id: msgObj._id}}
    }, function(err, num){
      if (err || num <= 0)
        insertMsg(msgObj, 'update 失败');
    });
  }
};

onNLPClassifyMessage = function(topic,msgObj){
  console.log('onNLPClassifyMessage!');
  if (Messages.find({_id: msgObj._id}).count() > 0){
    var setObj = {type:msgObj.type,text:msgObj.text,urls:msgObj.urls,wait_classify:msgObj.wait_classify,wait_lable:msgObj.wait_lable}
    Messages.update({_id: msgObj._id}, {
      $set: setObj
    }, function(err){
      if (err)
        console.log('message update failed!');
    });
    if (msgObj.wait_lable == false) {
      Meteor.call('set-class-name',msgObj.to.id,msgObj.urls[0].label);
    }
  }
}
