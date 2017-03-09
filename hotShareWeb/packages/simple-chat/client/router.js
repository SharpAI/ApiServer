var is_loading = new ReactiveVar(false);
var list_limit = new ReactiveVar(20);
var init_page = new ReactiveVar(false);
var page_title = new ReactiveVar('聊天室');

Router.route(AppConfig.path + '/to/:type', {
  layoutTemplate: '_simpleChatToChatLayout',
  template: '_simpleChatToChat',
  waitOn: function(){
    is_loading.set(true);
    return Meteor.subscribe('get-messages', this.params.type, this.params.query['id'], list_limit.get(), function(){
      is_loading.set(false);
      Meteor.setTimeout(function(){
        if(init_page.get()){
          //$('.box').scrollTop($('.box ul').height());
          init_page.set(false);
        }
      }, 500);
    });
  },
  data: function () {
    var slef = this;
    var to = slef.params.query['id'];
    var type = slef.params.type
    var where = null;

    if(type === 'group')
      where = {'to.id': to, to_type: type}; // 没有判断是否在群的处理。自动加群
    else
      where = {
        $or: [
          {'form.id': slef.userId, 'to.id': to, to_type: type}, // me -> ta
          {'form.id': to, 'to.id': slef.userId, to_type: type}  // ta -> me
        ]
      };

    if(slef.params.type != 'user'){
      page_title.set(Groups.findOne({_id: slef.params.query['id']}) ? Groups.findOne({_id: slef.params.query['id']}).name : '聊天室');
    }else{
      var user = Meteor.users.find({_id: slef.params.query['id']});
      page_title.set(AppConfig.get_user_name(user));
    }

    return {
      id: slef.params.query['id'],
      // title: function(){
      //   if(slef.params.type != 'user')
      //     return Groups.findOne({_id: slef.params.query['id']}).name || '聊天室';
        
      //   var user = Meteor.users.find({_id: slef.params.query['id']});
      //   return AppConfig.get_user_name(user);
      // },
      is_group: function(){
        return slef.params.type === 'group';
      },
      type: slef.params.type,
      messages: Messages.find(where, {limit: list_limit.get(), sort: {create_time: 1}}),
      loading: is_loading.get()
    };
  }
});

var time_list = [];

Template._simpleChatToChat.onRendered(function(){
  init_page.set(true);
  is_loading.set(false);
  list_limit.set(20);
  time_list = [];

  $('.box').scroll(function () {
    if($('.box').scrollTop() === 0 && !is_loading.get()){
      list_limit.set(list_limit.get()+20);
      console.log('load more data');
    }
  });

  // jQuery.getScript("/packages/feiwu_simple-chat/client/lib/plupload-2.1.2/js/plupload.full.min.js", function(){
  //   jQuery.getScript("/packages/feiwu_simple-chat/client/upload.js", function(){
  //     console.log('load file: upload.js');
  //   });
  // });
});

Template._simpleChatToChatLayout.onRendered(function(){
  Meteor.setTimeout(function(){
    $('body').css('overflow', 'hidden');
  }, 500);
});
Template._simpleChatToChatLayout.onDestroyed(function(){
  $('body').css('overflow', 'auto');
});

Template._simpleChatToChatLayout.helpers({
  title: function(){
    return page_title.get();
  },
  loading: function(){
    return is_loading.get();
  }
});

Template._simpleChatToChatLayout.events({
  'submit .input-form': function(e, t){
    var data = Blaze.getData(Blaze.getView(document.getElementsByClassName('simple-chat')[0]));
    var text = $('.input-text').val();
    var to = null;
    
    if(!text){
      $('.box').scrollTop($('.box ul').height());
      return false;
    }
    if(data.type === 'group'){
      var obj = Groups.findOne({_id: data.id});
      to = {
        id: data.id,
        name: obj.name,
        icon: obj.icon
      };
    }else{
      var obj = Meteor.users.findOne({_id: data.id});
      to = {
        id: t.data.id,
        name: AppConfig.get_user_name(obj),
        icon: AppConfig.get_user_icon(obj)
      };
    }

    Messages.insert({
      form:{
        id: Meteor.userId(),
        name: AppConfig.get_user_name(Meteor.user()),
        icon: AppConfig.get_user_icon(Meteor.user())
      },
      to: to,
      to_type: data.type,
      type: 'text',
      text: text,
      create_time: new Date(),
      is_read: false
    }, function(){
      $('.box').scrollTop($('.box ul').height());
    });    

    $('.input-text').val('');
    return false;
  }
});

Template._simpleChatToChatItem.helpers({
  ta_me: function(id){
    return id != Meteor.userId() ? 'ta' : 'me';
  },
  is_show_time: function(time){
    var str = get_diff_time(time);
    return time_list.indexOf(str) === -1;
  },
  get_time: function(time){
    var str = get_diff_time(time);
    if(time_list.indexOf(str) >= 0)
      return '';
    
    time_list.push(str);
    return str;
  }
});

window.___message = {
  insert: function(id){
    var data = Blaze.getData(Blaze.getView(document.getElementsByClassName('simple-chat')[0]));
    var to = null;

    if(data.type === 'group'){
      var obj = Groups.findOne({_id: data.id});
      to = {
        id: data.id,
        name: obj.name,
        icon: obj.icon
      };
    }else{
      var obj = Meteor.users.findOne({_id: data.id});
      to = {
        id: data.id,
        name: AppConfig.get_user_name(obj),
        icon: AppConfig.get_user_icon(obj)
      };
    }

    Messages.insert({
      _id: id,
      form:{
          id: Meteor.userId(),
          name: AppConfig.get_user_name(Meteor.user()),
          icon: AppConfig.get_user_icon(Meteor.user())
      },
      to: to,
      to_type: data.type,
      type: 'image',
      thumbnail: '/packages/feiwu_simple-chat/images/sendingBmp.gif',
      create_time: new Date(),
      is_read: false
    }, function(err, id){
      console.log('insert id:', id);
      $('.box').scrollTop($('.box ul').height());
    });
  },
  update: function(id, url){
    Messages.update({_id: id}, {$set: {
      image: url
    }}, function(){
      console.log('update id:', id);
      $('.box').scrollTop($('.box ul').height());
    });
  },  
  remove: function(id){
    Messages.remove({_id: id}, function(){
      console.log('remove id:', id);
      $('.box').scrollTop($('.box ul').height());
    });
  }
};