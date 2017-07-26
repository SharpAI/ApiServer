var view = null;
var urls = new ReactiveVar([]);
var message = new ReactiveVar(null);

Template._NLPTextLabelRemove.open = function(msgObj){
  if (view)
    Template._NLPTextLabelRemove.close();

  var containers = [];
  message.set(msgObj);
  for(var i=0;i<msgObj.urls.length;i++){
    //var class_id = msgObj.urls[i].class_id;
    if (msgObj.urls[i].remove || msgObj.urls[i].label)
      continue;
    msgObj.urls[i].selected = false;
    //if (_.pluck(containers, 'class_id').indexOf(class_id) === -1)
    containers.push(msgObj.urls[i]);
  }
  urls.set(containers);

  view = Blaze.render(Template._NLPTextLabelRemove, document.body);

  if (containers.length === 1){
    show_nlp_remove(function(text){
      if (!text)
        return;
      t.$('#remove-input-name').val(text);
    });
  }
};

Template._NLPTextLabelRemove.close = function(){
  if (view)
    Blaze.remove(view);
  view = null;
};

Template._NLPTextLabelRemove.helpers({
  urls: function(){
    return urls.get();
  }
});

Template._NLPTextLabelRemove.events({
  'click .leftButton': function(){
    Template._NLPTextLabelRemove.close();
  },
  'click .rightButton.remove': function(e, t){
    if (!t.$('#remove-input-name').val())
      return PUB.toast('请输入或选择删除的原因~');

    var msgObj = message.get();
    var updateObj = {};
    var containers = urls.get();
    var removes = [];

    var selectedCount = 0;
    for (var i=0;i<containers.length;i++){
      if (containers[i].selected)
        selectedCount++;
    }
    if (selectedCount <= 0) {
      return PUB.toast('请选择需要删除的链接~');
    }

    // set remove url
    for (var i=0;i<containers.length;i++){
      if (containers[i].selected) {
        removes.push({url:msgObj.urls[i].url, class_name: null});
        msgObj.urls[i].remove = true;
      }
    }

    // set wait label count
    var count = 0;
    for(var i=0;i<msgObj.urls.length;i++){
      if (!msgObj.urls[i].label && !msgObj.urls[i].remove && !msgObj.urls[i].error)
        count += 1;
    }
    if (count > 0)
      msgObj.text = count + ' 个链接需要标注';
    else
      msgObj.text =  msgObj.urls.length + ' 个链接已标注';

    if (count <= 0)
      updateObj.label_complete = true;
    updateObj.urls = msgObj.urls;
    updateObj.text = msgObj.text;
    // updateObj.create_time = new Date();

    // if (removes.length > 0)
    //   Meteor.call('remove-classes', removes)

    for (var i=0;i<updateObj.urls.length;i++){
      if (updateObj.urls[i].remove)
        var trainsetObj = {group_id: msgObj.to.id, type: 'trainset', url: updateObj.urls[i].url, class_name: null};
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        sendMqttMessage('/nlp_trainset', trainsetObj);
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
        text: '删除了 '+removes.length+' 个链接',
        create_time: new Date(),
        is_read: false
      };
      Messages.insert(msg);
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
    Template._NLPTextLabelRemove.close();
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
  },
  'click .select': function(e, t){
    show_nlp_remove(function(text){
      if (!text)
        return;
      t.$('#remove-input-name').val(text);
    });
  }
});


Template._NLPTextRemoveReason.events({
  'click li': function(e, t){
    $('#label-input-name').val($(e.currentTarget).find('.userName').text());
    // t.$('li img').removeAttr('style');
    // $(e.currentTarget).find('img').attr('style', 'border: 1px solid #39a8fe;');
  },
  'click .leftButton': function(){
    Blaze.remove(nlp_remove_view);
    nlp_remove_view = null;
  },
  'click .rightButton': function(e, t){
    if (!$('#label-input-name').val())
      return PUB.toast('请输入删除链接的原因~');;

    t.data.callback && t.data.callback($('#label-input-name').val());
    Blaze.remove(nlp_remove_view);
    nlp_remove_view = null;
  }
});
