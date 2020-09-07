var view = null;
var images = new ReactiveVar([]);
var message = new ReactiveVar(null);

Template._simpleChatLabelLabel.open = function(msgObj){
  if (view)
    Template._simpleChatLabelLabel.close();

  var imgs = [];
  message.set(msgObj);
  for(var i=0;i<msgObj.images.length;i++){
    var id = msgObj.images[i].id || msgObj.people_id;
    msgObj.images[i].selected = msgObj.images[i].error ? true : false;
    if (_.pluck(imgs, '_id').indexOf(id) === -1)
      imgs.push(msgObj.images[i]);
  }
  images.set(imgs);

  view = Blaze.render(Template._simpleChatLabelLabel, document.body);
  simple_chat_page_stack.push(view);
};

Template._simpleChatLabelLabel.close = function(){
  if (view) {
    Blaze.remove(view);
    simple_chat_page_stack.pop();
  }
  view = null;
};

Template._simpleChatLabelLabel.helpers({
  images: function(){
    return images.get();
  },
  label: function(){
    return message.get().images[0].label;
  },
  imgs_url: function(){
    return Session.get("imgUrl")
  },
  user_name: function(){
    return Session.get("userName")
  }
});

Template._simpleChatLabelLabel.events({
  'click .leftButton': function(){
    Template._simpleChatLabelLabel.close();
  },
   'click #imgRemoveLabelSelectAll': function(e, t){
    var imgs = images.get();
    for(var i=0;i<imgs.length;i++){
      imgs[i].selected = true;
    }
    images.set(imgs);
  },
  'click .rightButton.remove': function(e, t){
    var msgObj = message.get();
    var updateObj = {};
    var imgs = images.get();
    var removes = [];
    
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
            removes.push({uuid: msgObj.people_uuid, id: msgObj.images[ii].id, img_url: imgs[i].url});
          msgObj.images[ii].error = true;
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

    updateObj.label_complete = true;
    updateObj.images = msgObj.images;
    // updateObj.create_time = new Date();

    // remove
    if (removes.length > 0)
      Meteor.call('remove-persons1',msgObj.to.id,removes)

    var relabelImages = [];
    var newImageId = new Mongo.ObjectID()._str;

    for (var i=0;i<updateObj.images.length;i++){
      if (updateObj.images[i].error) {
        var trainsetObj = {
          group_id: msgObj.to.id,
          type: 'trainset',
          url: updateObj.images[i].url,
          device_id: msgObj.people_uuid,
          face_id: msgObj.people_id ? msgObj.people_id : updateObj.images[i].id,
          drop: true,
          img_type: updateObj.images[i].img_type,
          raw_face_id: updateObj.images[i].id,
          style:updateObj.images[i].style,
          sqlid: updateObj.images[i].sqlid ? updateObj.images[i].sqlid : 0
        };
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        sendMqttMessage('/device/'+msgObj.to.id, trainsetObj);
        // sendMqttMessage('trainset', {url: updateObj.images[i].url, person_id: '', device_id: updateObj.images[i].id, drop: true});
        var image = updateObj.images[i];
        var relabelObj = {
          _id: new Mongo.ObjectID()._str,
          id: newImageId,
          people_his_id:image.people_his_id,
          url: image.url,
          label: null,
          img_type: image.img_type,
          // accuracy: image.accuracy,
          // fuzziness: image.fuzziness
          style:image.style,
          sqlid: image.sqlid ? image.sqlid : 0
        };
        relabelImages.push(relabelObj);

      }
    }

    //生成重新可标记的数据
    function sendReLabelMsg(){
      if (relabelImages.length == 0) {
        return;
      }
      var id = new Mongo.ObjectID()._str;

      Messages.insert({
        _id: id,
        form:{
            id: Meteor.userId(),
            name: AppConfig.get_user_name(Meteor.user()),
            icon: AppConfig.get_user_icon(Meteor.user())
        },
        to: msgObj.to,
        to_type: msgObj.to_type,
        type: 'text',
        images:relabelImages,
        create_time: new Date(),
        people_uuid:msgObj.people_uuid,
        people_id: msgObj.people_id,
        people_his_id:msgObj.people_his_id,
        wait_lable:true,
        is_read: false//,
        //send_status: 'sending'
      }, function(err, id){
        console.log('insert id:', id);
        //$('.box').scrollTop($('.box ul').height());
      });
    }
    // update collection
    Messages.update({_id: msgObj._id}, {$set: updateObj}, function(){
      var user = Meteor.user();
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
      //像消息界面发送一条消息
      //sendReLabelMsg();
      PUB.toast('操作成功~');
    });
    Template._simpleChatLabelLabel.close();
    Meteor.setTimeout(function(){
      var $box = $('.box');
      if ($('.oneself_box').length > 0) {
         $box = $('.oneself_box');
      }
      $box.scrollTop($box.scrollTop()+10);
      $box.trigger("scroll");
    }, 500);
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
  }
});
