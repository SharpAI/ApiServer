var view = null;
var urls = new ReactiveVar([]);
var index = new ReactiveVar(0);
var message = new ReactiveVar(null);
var names = new ReactiveVar([]);

Template._NLPTextDevice.open = function(msgObj){
  if (view)
    Template._NLPTextDevice.close();

  message.set(msgObj);
  var containers = [];
  for(var i=0;i<msgObj.urls.length;i++){
    var class_name = msgObj.urls[i].class_name;
    if (msgObj.urls[i].label || msgObj.urls[i].remove)
      continue;
    msgObj.urls[i].selected = true;
    if (_.pluck(containers, 'class_name').indexOf(class_name) != -1)
      containers[_.pluck(containers, 'class_name').indexOf(class_name)].urls.push(msgObj.urls[i]);
    else
      containers.push({class_name: class_name, urls: [msgObj.urls[i]]});
  }

  var nas = [];
  for(var i=0;i<containers.length;i++)
    nas.push('');
  names.set(nas);

  urls.set(containers);
  index.set(0);

  view = Blaze.render(Template._NLPTextDevice, document.body);

  if (nas.length === 1 && containers[0].urls.length <= 1){
    show_nlp_label(msgObj.to.id, function(name){
      if (!name)
        return;
      $('#device-input-name').val(name);
      Template._NLPTextDevice.save();
    });
  }
};

Template._NLPTextDevice.close = function(){
  if (view)
    Blaze.remove(view);
  view = null;
};

Template._NLPTextDevice.save = function(){
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
    return PUB.toast('你没有标注任何内容~');
  }

  var msgObj = message.get();
  var updateObj = {};
  var containers = urls.get();
  var setNames = [];

  // set label name
  for (var i=0;i<msgObj.urls.length;i++){
    for(var ii=0;ii<containers.length;ii++){
      var is_break = false;
      for (var iii=0;iii<containers[ii].urls.length;iii++){
        if (containers[ii].urls[iii]._id === msgObj.urls[i]._id && containers[ii].urls[iii].selected){
          if (nas[ii]){
            msgObj.urls[i].label = nas[ii];
            if (_.pluck(setNames, 'class_name').indexOf(msgObj.urls[i].class_name) === -1)
              setNames.push({class_name: msgObj.urls[i].class_name});
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

  // update label
  if (setNames.length > 0)
    Meteor.call('set-class-names', msgObj.to.id, setNames);

  //console.log('names:', res);
  for (var i=0;i<updateObj.urls.length;i++){
    if (updateObj.urls[i].label) {
      var labelMsgSent = updateObj.urls[i].labelMsgSent;
      if (labelMsgSent == null || labelMsgSent == undefined)
        labelMsgSent = false;
      if (labelMsgSent) {
        console.log('already labeled, ignore:' + updateObj.urls[i].url);
        continue;
      }
      var trainsetObj = {group_id: msgObj.to.id, type: 'trainset', url: updateObj.urls[i].url,  class_name: updateObj.urls[i].label};
      console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
      sendMqttMessage('/nlp_trainset', trainsetObj);
      updateObj.urls[i].labelMsgSent = true;

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
      text: '标注了 '+(msgObj.urls.length-count)+' 个链接',
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
  Template._NLPTextDevice.close();
  Meteor.setTimeout(function(){
    var $box = $('.box');
      if ($('.oneself_box').length > 0) {
         $box = $('.oneself_box');
      }
    $box.scrollTop($box.scrollTop()+10);
    $box.trigger("scroll");
  }, 500);
}

Template._NLPTextDevice.helpers({
  is_next: function(){
    return index.get() < urls.get().length - 1;
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
    return urls.get().length;
  },
  urls: function(){
    return urls.get()[index.get()].urls;
  }
});

Template._NLPTextDevice.events({
  'click .leftButton': function(){
    Template._NLPTextDevice.close();
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
    Template._NLPTextDevice.save();
  },
  'click li': function(){
    var containers = urls.get();
    var indx = index.get();
    for(var i=0;i<containers[indx].urls.length;i++){
      if (containers[indx].urls[i]._id === this._id){
        containers[indx].urls[i].selected = !containers[indx].urls[i].selected;
        urls.set(containers);
        break;
      }
    }
  },
  'click .select': function(e, t){
    var msg = message.get();
    show_nlp_label(msg.to.id, function(name){
      if (!name)
        return;
      t.$('#device-input-name').val(name);
    });
  }
});


Template._NLPItemUrl.onRendered(function(){
  this.$("img.lazy:not([src])").lazyload({
    threshold: 100,
    container: $(".nlp_box .content")
  });
});
