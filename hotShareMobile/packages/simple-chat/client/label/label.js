var view = null;
var images = new ReactiveVar([]);
var message = new ReactiveVar(null);

Template._simpleChatLabelLabel.open = function(msgObj){
  if (view)
    Template._simpleChatLabelLabel.close();

  var imgs = [];
  message.set(msgObj);
  for(var i=0;i<msgObj.images.length;i++){
    msgObj.images[i].selected = msgObj.images[i].error ? true : false;
    if (_.pluck(imgs, '_id').indexOf(msgObj.images[i]._id) === -1)
      imgs.push(msgObj.images[i]);
  }
  images.set(imgs);

  view = Blaze.render(Template._simpleChatLabelLabel, document.body);
};

Template._simpleChatLabelLabel.close = function(){
  if (view)
    Blaze.remove(view);
  view = null;
};

Template._simpleChatLabelLabel.helpers({
  images: function(){
    return images.get();
  },
  label: function(){
    return message.get().images[0].label;
  }
});

Template._simpleChatLabelLabel.events({
  'click .leftButton': function(){
    Template._simpleChatLabelLabel.close();
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
            removes.push({uudi: msgObj.people_uuid, id: msgObj.images[ii].id});
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
      Meteor.call('remove-persons', removes)

    for (var i=0;i<updateObj.images.length;i++){
      if (updateObj.images[i].error)
        var trainsetObj = {group_id: msgObj.to.id, type: 'trainset', url: updateObj.images[i].url, drop: true};
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        sendMqttMessage('/device/'+msgObj.to.id, trainsetObj);
        // sendMqttMessage('trainset', {url: updateObj.images[i].url, person_id: '', device_id: updateObj.images[i].id, drop: true});
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
      PUB.toast('操作成功~');
    });
    Template._simpleChatLabelLabel.close();
    Meteor.setTimeout(function(){
      var $box = $('.box');
      $box.scrollTop($box.scrollTop()+10);
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