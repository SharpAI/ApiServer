var view = null;
var page_data = null;
var list_limit_val = 5;
var is_loading = new ReactiveVar(false);
var list_limit = new ReactiveVar(list_limit_val);
var $box = null;
var $box_ul = null;
var where = null;

Template._simpleChatOneSelfMsg.open = function(msgObj){
  if (view)
    Template._simpleChatOneSelfMsg.close();

  page_data = msgObj;
  where = {'to.id': msgObj.to.id,'form.id':msgObj.form.id, to_type: msgObj.to_type};

  view = Blaze.render(Template._simpleChatOneSelfMsg, document.body);
  simple_chat_page_stack.push(view);
};

Template._simpleChatOneSelfMsg.close = function(){
  if (view) {
    Blaze.remove(view);
    simple_chat_page_stack.pop();
  }
  view = null;
};

var setScrollToBottomTimeout = null;
var setScrollToBottom = function(){
  if (setScrollToBottomTimeout)
    Meteor.clearTimeout(setScrollToBottomTimeout);
  setScrollToBottomTimeout = Meteor.setTimeout(function(){
    console.log('set scrollTop to end');
    $box.scrollTop($box_ul.height());
  }, 200);
};

Template._simpleChatOneSelfMsg.onRendered(function(){
  console.log('_simpleChatOneSelfMsg view rendered');
  if(!page_data)
    return;
  var id = page_data.form.id;
  var user = Meteor.users.findOne({_id:id});
  if (!user) {
    Meteor.subscribe('usersById',id);
  }
  Meteor.setTimeout(function(){
    $box = $('.oneself_box');
    $box_ul = $('.oneself_box ul');

    $box.scroll(function () {
      if($box.scrollTop() === 0 && !is_loading.get()){
        is_loading.set(true);
        list_limit.set(list_limit.get()+list_limit_val);
        Meteor.setTimeout(function(){is_loading.set(false);}, 500);
        loadMoreMesage(where, {limit: list_limit.get(), sort: {create_time: -1}}, list_limit.get());
      }
    });

    Meteor.setTimeout(function(){
      setScrollToBottom();
    }, 600);
  }, 200);
  loadMoreMesage(where, {limit: list_limit.get(), sort: {create_time: -1}}, list_limit.get());
});

Template._simpleChatOneSelfMsg.helpers({
  title: function(){
    return page_data.form.name;
  },
  loading:function(){
    return is_loading.get();
  },
  is_device:function(){
    var id = page_data.form.id;
    var user = Meteor.users.findOne({_id:id});
    if (user && user.is_device) {
      return true;
    }
    return false;
  },
  getMsg: function(){
    if (!page_data)
      return [];

    var now = new Date();
    var res = [];

    is_loading.set(true);
    var messages =  Messages.find(where, {limit: list_limit.get(), sort: {create_time: -1}});
    messages.forEach(function (doc) {
      //doc.show_time_str = get_diff_time((new Date(doc.create_time)).getTime());
      var date = new Date(doc.create_time);
      doc.show_time_str = date.shortTime();
      doc.has_show_time = true;

      if (res.length > 0){
        for(var i=res.length-1;i>=0;i--){
          if (res[i].show_time_str === doc.show_time_str)
            res[i].has_show_time = false;
        }
      }

      res.splice(0, 0, doc);
      //res.push(doc);
    });
    if(page_data.to_type != 'group')
      res.sort(function(da, db) {
        return new Date(da.create_time).getTime() - new Date(db.create_time).getTime();
      });
    console.log('load message:', new Date() - now, 'ms');
    is_loading.set(false);

    return res;
  }
});

var renameView = null;
set_device_name = function(name, callback){
  if (renameView)
    Blaze.remove(renameView);
  renameView = Blaze.renderWithData(Template._simpleChatSetDeviceName, {
    name: name,
    callback : callback || function(){}
  }, document.body);
  simple_chat_page_stack.push(renameView);
}

Template._simpleChatOneSelfMsg.events({
  'click .header .back': function(){
    Template._simpleChatOneSelfMsg.close();
  },
  'click .header .rename':function(){
    set_device_name(page_data.form.name,function(newName){
      try{
        console.log('update msg from name :' + newName);
        page_data.form.name = newName;
        $('.oneselfmsg .header span').html(newName);
        SimpleChat.Messages.update(where,{$set:{'form.name':newName}},{multi: true, upsert:false});
      }
      catch(error){
        console.log('update msg from name error!');
      }
    });
  }
});

Template._simpleChatSetDeviceName.events({
  'click .left-btn': function(){
    Blaze.remove(renameView);
    simple_chat_page_stack.pop();
    renameView = null;
  },
  'click .right-btn': function(e,t){
    $('.setNickname-form').submit();
  },
  'submit .setNickname-form': function(e,t){
    e.preventDefault();
    var newName = $('#device_nickname').val();
    console.log('Change device name to ' + newName);
    if (newName !== '') {
      if (Session.equals('isUpdating',true)) {
        PUB.toast('正在更新请稍候！');
      }
      Session.set('isUpdating',true);
      console.log('Meteor.call update-device-name');

      Meteor.call('update-device-name',page_data.form.id,newName,Meteor.userId(),function(err,res){
        console.log('update-device-name callback!');
        if (err) {
          PUB.toast('更改设备名称失败~请重试！');
          return;
        }
        t.data.callback && t.data.callback(newName);
        Meteor.setTimeout(function(){
          Blaze.remove(renameView);
          simple_chat_page_stack.pop();
          renameView = null;
          Session.set('isUpdating',false);
        },300);
      });
    }
    else{
      PUB.toast('设备名不能为空！');
    }
    false
  }
});
