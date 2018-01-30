var view = null;
var images = new ReactiveVar([]);
var index = new ReactiveVar(0);
var message = new ReactiveVar(null);
var names = new ReactiveVar([]);
var isSelectedAll = new ReactiveVar(true);
var input_name_direct = new ReactiveVar(true);

Template._simpleChatLabelDevice.open = function(msgObj){
  if (view)
    Template._simpleChatLabelDevice.close();

  console.log("FrankDebug: set msgObj="+JSON.stringify(msgObj));
  message.set(msgObj);
  var imgs = [];
  for(var i=0;i<msgObj.images.length;i++){
    var id = msgObj.tid || msgObj.images[i].id || msgObj.people_id;
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

  //已经选择过人了，平板判断的最大可能的三个人中选择了某个人
  if (msgObj.label_name) {
    nas[index.get()] = msgObj.label_name;
    names.set(nas);
    Template._simpleChatLabelDevice.save();
    return;
  }

  // 标注新人， 直接显示输入name
  if (msgObj.input_name_direct){
    input_name_direct.set(true);
    view = Blaze.render(Template._simpleChatLabelDevice, document.body);
    simple_chat_page_stack.push(view);
    return;
  } else {
    input_name_direct.set(false);
  }


  view = Blaze.render(Template._simpleChatLabelDevice, document.body);
  simple_chat_page_stack.push(view);

  if ( msgObj.need_show_label_now || (nas.length === 1 && imgs[0].images.length <= 1)){
    show_label(msgObj.to.id, msgObj.images[0].url, function(name){
      if (!name)
        return;
      $('#device-input-name').val(name);
      $('#device-input-name').attr('placeholder','');
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
  PUB.hideWaitLoading();
  $('#selectPerson').modal('hide');
};

Template._simpleChatLabelDevice.save = function(){
  PUB.showWaitLoading('正在处理')
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
  if (is_save != true){
    PUB.hideWaitLoading();
    return PUB.toast('你没有标注任何内容~');
  }

  var msgObj = message.get();
  Meteor.call('get-id-by-names1', msgObj.people_uuid, nas, msgObj.to.id, function(err, res){
    PUB.hideWaitLoading()
    if (err || !res)
      return PUB.toast('标注失败，请重试~');

    var updateObj = {};
    var imgs = images.get();
    var setNames = [];

    // set label name
    console.log("FrankDebug: get msgObj="+JSON.stringify(msgObj));
    for (var i=0;i<msgObj.images.length;i++){
      for(var ii=0;ii<imgs.length;ii++){
        var is_break = false;
        for (var iii=0;iii<imgs[ii].images.length;iii++){
          if (imgs[ii].images[iii]._id === msgObj.images[i]._id && imgs[ii].images[iii].selected){
            if (nas[ii]){
              // msgObj.images[i].label = nas[ii];
              var id = msgObj.tid || msgObj.images[i].id
              console.log("FrankDebug: i="+i+", nas[ii]="+nas[ii]+", id="+id);
              if (_.pluck(setNames, 'id').indexOf(id) === -1) {
                //有name说明是识别了，但是识别错了，管理员要修改这个人的name, 把这次修改记录到person的已标注里面
                var setNameObj = {uuid: msgObj.people_uuid, id: msgObj.images[i].id, url: msgObj.images[i].url, name: nas[ii], sqlid: msgObj.images[i].sqlid, style: msgObj.images[i].style};
                if(msgObj && msgObj.images /*&& msgObj.images[i].label*/) {
                  if(nas && nas[ii] && res && res[nas[ii]] && res[nas[ii]].faceId){
                    setNameObj.id = res[nas[ii]].faceId;
                  } else {
                    setNameObj.id = (setNames[0] && setNames[0].id) ? setNames[0].id : new Mongo.ObjectID()._str;
                  }
                }
                console.log("FrankDebug: i="+i+", setNameObj="+JSON.stringify(setNameObj));
                setNames.push(setNameObj);
                msgObj.images[i].label = nas[ii];
              }
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

    console.log('setNames', JSON.stringify(setNames));
    console.log('setNames', setNames);
    console.log('names:', res);

    var labeld_images = [];
    var wait_label_images = [];

    for (var i=0;i<updateObj.images.length;i++){
      if (updateObj.images[i].label) {

        labeld_images.push(updateObj.images[i]);

        var labelMsgSent = updateObj.images[i].labelMsgSent;
        if (labelMsgSent == null || labelMsgSent == undefined)
          labelMsgSent = false;
        if (labelMsgSent) {
          console.log('already labeled, ignore:' + updateObj.images[i].url);
          continue;
        }
        console.log('res item obj:', res[updateObj.images[i].label]); 
        var trainsetObj = {};
        var theFaceId = '';
        if(res && res[updateObj.images[i].label] && res[updateObj.images[i].label].faceId){
          theFaceId = res[updateObj.images[i].label].faceId;
        } else {
          theFaceId = setNames[0].id;
        }
        try {
          trainsetObj = {
            group_id: msgObj.to.id,
            type: 'trainset',
            url: updateObj.images[i].url,
            person_id: res && res[updateObj.images[i].label].id ? res[updateObj.images[i].label].id : '',
            device_id: msgObj.people_uuid,
            face_id: theFaceId,
            drop: false,
            img_type: updateObj.images[i].img_type,
            style:updateObj.images[i].style,
            sqlid:updateObj.images[i].sqlid
          };
        } catch (ex) {
          trainsetObj = {
            group_id: msgObj.to.id,
            type: 'trainset',
            url: updateObj.images[i].url,
            person_id: '',
            device_id: msgObj.people_uuid,
            face_id: theFaceId,
            drop: false,
            img_type: updateObj.images[i].img_type,
            style:updateObj.images[i].style,
            sqlid:updateObj.images[i].sqlid
          };
        }
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        if(trainsetObj.face_id){
          sendMqttMessage('/device/'+msgObj.to.id, trainsetObj);
        }
        updateObj.images[i].labelMsgSent = true;

        try {
          if(updateObj.images[i].img_type && updateObj.images[i].img_type == 'face') {
            var person_info = {
              //'id': res[updateObj.images[i].label].faceId,
              'uuid': msgObj.people_uuid,
              'name': nas[0],
              'group_id': msgObj.to.id,
              'img_url': updateObj.images[i].url,
              'type': updateObj.images[i].img_type,
              'ts': new Date(msgObj.create_time).getTime(),
              'accuracy': 1,
              'fuzziness': 1,
              'sqlid': updateObj.images[i].sqlid,
              'style': updateObj.images[i].style
            };
            var data = {
              // face_id:updateObj.images[i].id, // 这里也有问题
              face_id: theFaceId,
              person_info: person_info,
              formLabel:true //是否是聊天室标记
            };
            //Meteor.call('send-person-to-web', person_info, function(err, res){});
            console.log('data in device.js is: ',JSON.stringify(data));
            Meteor.call('ai-checkin-out',data,function(err,res){});
          }
        } catch(e){}
      } else {
        wait_label_images.push(updateObj.images[i]);
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
        text: '标注了 '+(setNames.length)+' 张照片',
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
          labeldImages: labeld_images,
          waitLabelImages: wait_label_images,
          admin_label_unknown: true,
          createAt: new Date()
        });
        return;
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
    // Meteor.setTimeout(function(){
    //   var $box = $('.box');
    //   if ($('.oneself_box').length > 0) {
    //      $box = $('.oneself_box');
    //   }
    //   $box.scrollTop($box.scrollTop()+10);
    //   $box.trigger("scroll");
    // }, 500);
  });
}

Template._simpleChatLabelDevice.onRendered(function(){
  this.$("#device-input-name").bind("input propertychange",function (e) {
        var length = $(e.currentTarget).val().length;
        if (length === 0) {
          $(e.currentTarget).attr('placeholder','为这组照片取个名字~');
        }
    });
});

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
  },
  isSelectedAll: function(){
    return isSelectedAll.get();
  },
  input_name_direct: function(){
    return input_name_direct.get();
  }
});

Template._simpleChatLabelDevice.events({
  'click #imgRemoveLabelSelectAll': function(e, t){
    var imgs = images.get();
    var indx = index.get();
    for(var i=0;i<imgs[indx].images.length;i++){
      if(isSelectedAll.get()){
        imgs[indx].images[i].selected = false;
      } else {
        imgs[indx].images[i].selected = true;
      }
    }
    images.set(imgs);
    isSelectedAll.set(!isSelectedAll.get());
  },
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
    show_label(msg.to.id, msg.images[0].url, function(name){
      if (!name)
        return;
      t.$('#device-input-name').val(name);
      t.$('#device-input-name').attr('placeholder','');
    });
  }
});
