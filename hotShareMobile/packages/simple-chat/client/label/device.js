var view = null;
var images = new ReactiveVar([]);
var index = new ReactiveVar(0);
var message = new ReactiveVar(null);
var names = new ReactiveVar([]);

Template._simpleChatLabelDevice.open = function(msgObj){
  if (view)
    Template._simpleChatLabelDevice.close();

  message.set(msgObj);
  var imgs = [];
  for(var i=0;i<msgObj.images.length;i++){
    var id = msgObj.images[i].id || msgObj.people_id;
    if (msgObj.images[i].label || msgObj.images[i].remove)
      continue;
    msgObj.images[i].selected = true;
    if (_.pluck(imgs, 'id').indexOf(id) != -1)
      imgs[_.pluck(imgs, 'id').indexOf(id)].images.push(msgObj.images[i]);
    else
      imgs.push({id: id, images: [msgObj.images[i]]});
  }

  var nas = [];
  for(var i=0;i<imgs.length;i++)
    nas.push('');
  names.set(nas);

  images.set(imgs);
  index.set(0);

  view = Blaze.render(Template._simpleChatLabelDevice, document.body);
  simple_chat_page_stack.push(view);

  if (nas.length === 1 && imgs[0].images.length <= 1){
    show_label(msgObj.to.id, function(name){
      if (!name)
        return;
      $('#device-input-name').val(name);
      Template._simpleChatLabelDevice.save();
    });
  }
};

Template._simpleChatLabelDevice.close = function(){
  if (view) {
    Blaze.remove(view);
    simple_chat_page_stack.pop();
  }
  view = null;
};

Template._simpleChatLabelDevice.save = function(){
  var nas = names.get();
  if ($('#device-input-name').val()){
    nas[index.get()] = $('#device-input-name').val();
    names.set(nas);
  }

  var is_save = false;
  for(var i=0;i<nas.length;i++){
    if (nas[i]){
      is_save = true;
      break;
    }
  }
  if (is_save != true)
    return PUB.toast('你没有标注任何内容~');

  var msgObj = message.get();
  Meteor.call('get-id-by-names1', msgObj.people_uuid, nas, msgObj.to.id, function(err, res){
    if (err || !res)
      return PUB.toast('标注失败，请重试~');

    var updateObj = {};
    var imgs = images.get();
    var setNames = [];

    // set label name
    for (var i=0;i<msgObj.images.length;i++){
      for(var ii=0;ii<imgs.length;ii++){
        var is_break = false;
        for (var iii=0;iii<imgs[ii].images.length;iii++){
          if (imgs[ii].images[iii]._id === msgObj.images[i]._id && imgs[ii].images[iii].selected){
            if (nas[ii]){
              msgObj.images[i].label = nas[ii];
              if (_.pluck(setNames, 'id').indexOf(msgObj.images[i].id) === -1)
                setNames.push({uuid: msgObj.people_uuid, id: msgObj.images[i].id, url: msgObj.images[i].url, name: nas[ii]});
            }
            is_break = true;
            break;
          }
        }
        if (is_break)
          break;
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

    // update label
    if (setNames.length > 0)
      Meteor.call('set-person-names', msgObj.to.id, setNames);

    console.log('names:', res);
    for (var i=0;i<updateObj.images.length;i++){
      if (updateObj.images[i].label) {
        var labelMsgSent = updateObj.images[i].labelMsgSent;
        if (labelMsgSent == null || labelMsgSent == undefined)
          labelMsgSent = false;
        if (labelMsgSent) {
          console.log('already labeled, ignore:' + updateObj.images[i].url);
          continue;
        }
        console.log('res item obj:', res[updateObj.images[i].label]);
        var trainsetObj = {};
        try{trainsetObj={group_id: msgObj.to.id, type: 'trainset', url: updateObj.images[i].url, person_id: res && res[updateObj.images[i].label].id ? res[updateObj.images[i].label].id : '', device_id: msgObj.people_uuid, face_id: res && res[updateObj.images[i].label].faceId ? res[updateObj.images[i].label].faceId : updateObj.images[i].id, drop: false, img_type: updateObj.images[i].img_type};}
        catch(ex){trainsetObj={group_id: msgObj.to.id, type: 'trainset', url: updateObj.images[i].url, person_id: '', device_id: msgObj.people_uuid, face_id: updateObj.images[i].id, drop: false, img_type: updateObj.images[i].img_type};}
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        sendMqttMessage('/device/'+msgObj.to.id, trainsetObj);
        updateObj.images[i].labelMsgSent = true;

        try {
          if(updateObj.images[i].img_type && updateObj.images[i].img_type == 'face') {
            var person_info = {
              'id': res && res[updateObj.images[i].label].faceId ? res[updateObj.images[i].label].faceId : updateObj.images[i].id,
              'uuid': msgObj.people_uuid,
              'group_id': msgObj.to.id,
              'img_url': updateObj.images[i].url,
              'type': updateObj.images[i].img_type,
              'ts': new Date(updateObj.create_time).getTime(),
              'accuracy': 1,
              'fuzziness': 1
            }
            Meteor.call('send-person-to-web', person_info, function(err, res){});
          }
        } catch(e){}
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
        text: '标注了 '+(msgObj.images.length-count)+' 张照片',
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
          setNames: setNames,
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
      sendMqttGroupMessage(msg.to.id, msg);
    });
    Template._simpleChatLabelDevice.close();
    Meteor.setTimeout(function(){
      var $box = $('.box');
      $box.scrollTop($box.scrollTop()+10);
      $box.trigger("scroll");
    }, 500);
  });
}

Template._simpleChatLabelDevice.helpers({
  is_next: function(){
    return index.get() < images.get().length - 1;
  },
  is_prev: function(){
    return index.get() >= 1;
  },
  name: function(){
    console.log(names.get());
    return names.get()[index.get()];
  },
  index: function(){
    return index.get() + 1;
  },
  length: function(){
    return images.get().length;
  },
  images: function(){
    return images.get()[index.get()].images;
  },
  id: function(){
    return images.get()[index.get()].images[0].id;
  }
});

Template._simpleChatLabelDevice.events({
  'click .leftButton': function(){
    Template._simpleChatLabelDevice.close();
  },
  'click .next-group': function(e, t){
    if (t.$('#device-input-name').val()){
      var nas = names.get();
      nas[index.get()] = t.$('#device-input-name').val();
      names.set(nas);
    }
    t.$('#device-input-name').val('');
    index.set(index.get()+1);
  },
  'click .prev-group': function(e, t){
    if (t.$('#device-input-name').val()){
      var nas = names.get();
      nas[index.get()] = t.$('#device-input-name').val();
      names.set(nas);
    }
    t.$('#device-input-name').val('');
    index.set(index.get()-1);
  },
  'click .rightButton.save': function(e, t){
    Template._simpleChatLabelDevice.save();
  },
  'click li': function(){
    var imgs = images.get();
    var indx = index.get();
    for(var i=0;i<imgs[indx].images.length;i++){
      if (imgs[indx].images[i]._id === this._id){
        imgs[indx].images[i].selected = !imgs[indx].images[i].selected;
        images.set(imgs);
        break;
      }
    }
  },
  'click .select': function(e, t){
    var msg = message.get();
    show_label(msg.to.id, function(name){
      if (!name)
        return;
      t.$('#device-input-name').val(name);
    });
  }
});
