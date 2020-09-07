var view = null;
var urls = new ReactiveVar([]);
var message = new ReactiveVar(null);

Template._NLPTextLabelError.open = function(msgObj){
  if (view)
    Template._NLPTextLabelError.close();

  var containers = [];
  message.set(msgObj);
  for(var i=0;i<msgObj.urls.length;i++){
    //var class_name = msgObj.urls[i].class_name;
    msgObj.urls[i].selected = msgObj.urls[i].error ? true : false;
    //if (_.pluck(containers, 'class_name').indexOf(class_name) === -1)
    containers.push(msgObj.urls[i]);
  }
  urls.set(containers);

  view = Blaze.render(Template._NLPTextLabelError, document.body);
};

Template._NLPTextLabelError.close = function(){
  if (view)
    Blaze.remove(view);
  view = null;
};

Template._NLPTextLabelError.helpers({
  urls: function(){
    return urls.get();
  },
  label: function(){
    return message.get().urls[0].label;
  }
});

Template._NLPTextLabelError.events({
  'click .leftButton': function(){
    Template._NLPTextLabelError.close();
  },
  'click .rightButton.remove': function(e, t){
    var msgObj = message.get();
    var updateObj = {};
    var containers = urls.get();
    var removes = [];

    // set remove url label
    for (var i=0;i<containers.length;i++){
      if (containers[i].selected) {
        //removes.push({url:msgObj.urls[i].url, class_name: null});
        msgObj.urls[i].error = true;
      }
    }

    // set wait label count
    var count = 0;
    for(var i=0;i<msgObj.urls.length;i++){
      if (!msgObj.urls[i].label && !msgObj.urls[i].remove && !msgObj.urls[i].error)
        count += 1;
    }

    updateObj.label_complete = true;
    updateObj.urls = msgObj.urls;
    // updateObj.create_time = new Date();

    // remove
    // if (removes.length > 0)
    //   Meteor.call('remove-classes', removes)

    for (var i=0;i<updateObj.urls.length;i++){
      if (updateObj.urls[i].error)
        var trainsetObj = {group_id: msgObj.to.id, type: 'trainset', url: updateObj.urls[i].url, class_name: null};
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        sendMqttMessage('/nlp_trainset', trainsetObj);
        // sendMqttMessage('trainset', {url: updateObj.urls[i].url, person_id: '', device_id: updateObj.urls[i].id, drop: true});
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
    Template._NLPTextLabelError.close();
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
    var containers = urls.get();
    for(var i=0;i<containers.length;i++){
      if (containers[i]._id === this._id){
        containers[i].selected = !containers[i].selected;
        urls.set(containers);
        break;
      }
    }
  }
});
