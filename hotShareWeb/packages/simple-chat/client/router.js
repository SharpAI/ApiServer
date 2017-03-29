var list_limit_val = 20;
var is_loading = new ReactiveVar(false);
var list_limit = new ReactiveVar(list_limit_val);
var page_title = new ReactiveVar('聊天室');
var list_data = new ReactiveVar([]);

Router.route(AppConfig.path + '/to/:type', {
  layoutTemplate: '_simpleChatToChatLayout',
  template: '_simpleChatToChat',
  // waitOn: function(){
  //   is_loading.set(true);
  //   return Meteor.subscribe('get-messages', this.params.type, this.params.query['id'], Session.get('simple-chat-limit'), function(){
  //     is_loading.set(false);
  //     Meteor.setTimeout(function(){
  //       if(init_page.get()){
  //         //$('.box').scrollTop($('.box ul').height());
  //         init_page.set(false);
  //       }
  //     }, 500);
  //   });
  // },
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
      query: Messages.find(where, {sort: {create_time: 1}}),
      type: slef.params.type,
      messages: Messages.find(where, {limit: list_limit.get(), sort: {create_time: 1}}),
      loading: is_loading.get()
    };
  }
});

var time_list = [];
var init_page = false;
var fix_data_timeInterval = null;
var fix_data = function(){
  var data = Blaze.getData($('.simple-chat')[0]).messages.fetch();
  data.sort(function(a, b){
    return a.create_time - b.create_time;
  });
  if(data.length > 0){
    for(var i=0;i<data.length;i++){
      data[i].show_time_str = get_diff_time(data[i].create_time);
      if(i===0)
        data[i].show_time = true;
      else if(data[i].show_time_str != data[i-1].show_time_str)
        data[i].show_time = true;
      else
        data[i].show_time = false;
    }
  }
  list_data.set(data);
};

Template._simpleChatToChat.onDestroyed(function(){
  if(fix_data_timeInterval){
    Meteor.clearInterval(fix_data_timeInterval);
    fix_data_timeInterval = null;
  }
});

Template._simpleChatToChat.onRendered(function(){
  is_loading.set(false);
  list_limit.set(list_limit_val);
  time_list = [];
  init_page = false;
  list_data.set([]);
  var slef = this;

  slef.data.query.observeChanges({
    added: function(id, fields){
      fix_data();
    },
    changed: function(id, fields){
      fix_data();
    },
    removed: function(id){
      fix_data();
    }
  });

  if(fix_data_timeInterval){
    Meteor.clearInterval(fix_data_timeInterval);
    fix_data_timeInterval = null;
  }
  fix_data_timeInterval = Meteor.setInterval(fix_data, 1000*60);

  slef.autorun(function(){
    if(list_limit.get()){
      is_loading.set(true);
      Meteor.subscribe('get-messages', slef.data.type, slef.data.id, list_limit.get(), function(){
        is_loading.set(false);

        if(slef.data.messages.count() <= list_limit_val && !init_page){
          init_page = true;
          $('.box').scrollTop($('.box ul').height());
        }
      });
      console.log('load more data:', list_limit.get());
    }
  });

  $('.box').scroll(function () {
    if($('.box').scrollTop() === 0 && !is_loading.get()){
      if(slef.data.messages.count() >= list_limit.get())
        list_limit.set(list_limit.get()+list_limit_val)
    }
  });
});

Template._simpleChatToChatItem.events({
  'click li img.swipebox': function(e){
    var imgs = []
    var index = 0;
    var selected = 0;
    var data = Blaze.getData($(e.currentTarget).attr('data-type') === 'images' ? $(e.currentTarget).parent().parent().parent()[0] : $('#'+this._id)[0]);
    
    console.log('data:', data);
    $('li#' + data._id + ' img.swipebox').each(function(){
      imgs.push({
        href: $(this).attr('src'),
        title: ''
      });
      if($(e.currentTarget).attr('src') === $(this).attr('src'))
        selected = index;
      index += 1;
    });
    if(imgs.length > 0){
      console.log('imgs:', imgs);
      var labelView = null;

      $.swipebox(imgs, {
        initialIndexOnArray: selected,
        hideCloseButtonOnMobile : true,
        loopAtEnd: false,
        beforeOpen: function(){
          if (data.people_id)
            labelView = Blaze.renderWithData(Template._simpleChatToChatLabel, data, document.body);
        },
        afterClose: function(){
          if (data.people_id)
            Blaze.remove(labelView);
        }
      });
    }
  },
  'click li div.showmore':function(e){
    console.log(e.currentTarget.id);
    id = e.currentTarget.id;
    $('li#' + id + ' div.showmore').hide();
    $('li#' + id + ' div.text').removeAttr('style');
  }
});

Template._simpleChatToChatLabel.events({
  'click .btn-label': function(){
    var $img = $('#swipebox-overlay .slide.current img');
    var data = this;
    var name = prompt('此照片是谁？');

    if(name){
      PeopleHis.update({_id: data.people_his_id}, {
        $set: {fix_name: name},
        $push: {fix_names: {
          _id: new Mongo.ObjectID()._str,
          name: name,
          userId: Meteor.userId,
          userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
          userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
          fixTime: new Date()
        }}
      }, function(err, num){
        if(err || num <= 0){
          console.log(err);
          return PUB.toast('标记失败，请重试~');
        }
        PUB.toast('标记成功~');
      });
    }
  }
});

var loadScript = function(url, callback){
  if($("script[src='"+url+"']").length > 0)
    return callback && callback();

  var script = document.createElement('script');
  script.type = 'text/javascript';
  if(script.readyState){
    script.onreadystatechange = function(){
      if(script.readyState === 'loaded' || script.readyState === 'complete'){
        script.onreadystatechange = null;
        callback && callback();
      }
    }
  }else{
    script.onload = function(){
      callback && callback();
    };
  }

  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

Template._simpleChatToChatLayout.onRendered(function(){
  if(Meteor.isCordova){
    $('#container').click(function(){
      selectMediaFromAblum(1, function(cancel, result, currentCount, totalCount){
        if(cancel)
          return;
        if(result){
          var id = new Mongo.ObjectID()._str;
          window.___message.insert(id); // result.smallImage
          multiThreadUploadFile_new([{
            type: 'image',
            filename: result.filename,
            URI: result.URI
          }], 1, function(err, res){
            if(err || res.length <= 0){
              window.___message.remove(id);
              return PUB.toast('上传图片失败~');
            }
            window.___message.update(id, res[0].imgUrl);
          });
        }
      });
    });
  }else{
    // load upload.js
    loadScript('/packages/feiwu_simple-chat/client/upload.js', function(){
      var uploader = SimpleChat.createPlupload('selectfiles');
      uploader.init();
    });
  }

  Meteor.setTimeout(function(){
    $('body').css('overflow', 'hidden');
    var DHeight = $('.group-list').outerHeight();
    $('.box').scrollTop(DHeight);
  }, 600);
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
  'focus .input-text': function(){
    Meteor.setTimeout(function(){
      $('body').scrollTop(999999);
    }, 500);
  },
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
  show_images: function(images){
    if(images && images.length > 9){
      $('li#' + this._id + ' div.text').css('height', '130px');
      $('li#' + this._id + ' div.text').css('overflow', 'hidden');
      $('li#' + this._id + ' div.showmore').show();
    }
    return images && images.length > 0;
  },
  is_show_time: function(id){
    var data = list_data.get();
    return data[_.pluck(data, '_id').indexOf(id)].show_time;
  },
  get_time: function(id){
    var data = list_data.get();
    return data[_.pluck(data, '_id').indexOf(id)].show_time_str;
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