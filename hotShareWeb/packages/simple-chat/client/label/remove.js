var view = null;
var images = new ReactiveVar([]);
var message = new ReactiveVar(null);

Template._simpleChatLabelRemove.open = function(msgObj){
  if (view)
    Template._simpleChatLabelRemove.close();

  var imgs = [];
  message.set(msgObj);
  for(var i=0;i<msgObj.images.length;i++){
    var id = msgObj.images[i].id || msgObj.people_id;
    if (msgObj.images[i].remove || msgObj.images[i].label)
      continue;
    msgObj.images[i].selected = false;
    if (_.pluck(imgs, '_id').indexOf(id) === -1)
      imgs.push(msgObj.images[i]);
  }
  images.set(imgs);

  view = Blaze.render(Template._simpleChatLabelRemove, document.body);
  simple_chat_page_stack.push(view);
};

Template._simpleChatLabelRemove.onRendered(function(){
  this.$("#remove-input-name").bind("input propertychange",function (e) {
        var length = $(e.currentTarget).val().length;
        if (length === 0) {
          $(e.currentTarget).attr('placeholder','请选择或输入删除的原因~');
        }
    });
});

Template._simpleChatLabelRemove.close = function(){
  if (view) {
    Blaze.remove(view);
    simple_chat_page_stack.pop();
  }
  view = null;
};

Template._simpleChatLabelRemove.helpers({
  images: function(){
    return images.get();
  }
});

Template._simpleChatLabelRemove.events({
  'click .leftButton': function(){
    Template._simpleChatLabelRemove.close();
  },
  'click #imgRemoveSelectAll': function(e, t){
    var imgs = images.get();
    for(var i=0;i<imgs.length;i++){
      imgs[i].selected = true;
    }
    images.set(imgs);
  },
  // 聊天室，对照片进行删除
  'click .rightButton.remove': function(e, t){
    if (!t.$('#remove-input-name').val())
      return PUB.toast('请输入或选择删除的原因~');

    var msgObj = message.get();
    var updateObj = {};
    var imgs = images.get();
    var removes = [];

    var selectedCount = 0;
    for (var i=0;i<imgs.length;i++){
      if (imgs[i].selected)
        selectedCount++;
    }
    if (selectedCount <= 0) {
      return PUB.toast('请选择需要删除的图片~');
    }

    isRemoving = true;
    // set remove img
    for (var i=0;i<imgs.length;i++){
      for(var ii=0;ii<msgObj.images.length;ii++){
        if (imgs[i].selected && imgs[i]._id === msgObj.images[ii]._id){
          var isPush = true;
          for(var i1=0;i1<removes.length;i1++){
            if (removes[i1].uuid === msgObj.people_uuid && removes[i1].id === msgObj.images[ii].id){
              isPush = false;
              break;
            }
          }
          if (isPush)
            removes.push({uuid: msgObj.people_uuid, id: msgObj.images[ii].id, img_url: msgObj.images[ii].url});
          msgObj.images[ii].remove = true;
          break;
        }
      }
    }

    // set wait label count
    var count = 0;
    for(var i=0;i<msgObj.images.length;i++){
      if (!msgObj.images[i].label && !msgObj.images[i].remove && !msgObj.images[i].error)
        count += 1;
    }
    if (count > 0)
      msgObj.text = count + ' 张照片需要标注';
    else
      msgObj.text =  msgObj.images.length + ' 张照片已标注';

    if (count <= 0)
      updateObj.label_complete = true;
    updateObj.images = msgObj.images;
    updateObj.text = msgObj.text;
    // updateObj.create_time = new Date();
    console.log('will remove ', JSON.stringify(removes))

    if (removes.length > 0)
      Meteor.call('remove-persons1',msgObj.to.id,removes)

    for (var i=0;i<updateObj.images.length;i++){
      if (updateObj.images[i].remove){
        var trainsetObj = {
          group_id: msgObj.to.id,
          type: 'trainset',
          url: updateObj.images[i].url,
          drop: true,
          img_type: updateObj.images[i].img_type,
          style:updateObj.images[i].style,
          sqlid:updateObj.images[i].sqlid,
          rm_reson:t.$('#remove-input-name').val()
        };
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        sendMqttMessage('/device/'+msgObj.to.id, trainsetObj);
      }
    }

    // update collection
    Messages.update({_id: msgObj._id}, {$set: updateObj}, function(){
      var user = Meteor.user();
      var msg = {
        _id: new Mongo.ObjectID()._str,
        form: {
          id: user._id,
          name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
          icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png'
        },
        to: msgObj.to,
        to_type: "group",
        type: "text",
        text: '删除了 '+selectedCount+' 张照片',
        create_time: new Date(),
        is_read: false
      };
      Messages.insert(msg);
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
          admin_remove: true,
          createAt: new Date()
        });
      } else {
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
      }
      sendMqttGroupMessage(msg.to.id, msg);
    });
    Template._simpleChatLabelRemove.close();
    // Meteor.setTimeout(function(){
    //   var $box = $('.box');
    //   if ($('.oneself_box').length > 0) {
    //      $box = $('.oneself_box');
    //   }
    //   $box.scrollTop($box.scrollTop()+10);
    //   $box.trigger("scroll");
    // }, 500);
  },
  'click li': function(){
    var imgs = images.get();
    for(var i=0;i<imgs.length;i++){
      if (imgs[i]._id === this._id){
        imgs[i].selected = !imgs[i].selected;
        images.set(imgs);
        break;
      }
    }
  },
  'click .select': function(e, t){
    show_remove(function(text){
      if (!text)
        return;
      t.$('#remove-input-name').val(text);
      t.$('#remove-input-name').attr('placeholder','');
    });
  }
});
