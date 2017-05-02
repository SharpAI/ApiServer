var list_limit_val = 20;
var is_loading = new ReactiveVar(false);
var list_limit = new ReactiveVar(list_limit_val);
var page_title = new ReactiveVar('AI训练群');
var list_data = new ReactiveVar([]);
var message_list = new ReactiveVar([]);
var page_data = null;

Router.route(AppConfig.path + '/to/:type', {
  layoutTemplate: '_simpleChatToChatLayout',
  template: '_simpleChatToChat',
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
          {'form.id': Meteor.userId(), 'to.id': to, to_type: type}, // me -> ta
          {'form.id': to, 'to.id': Meteor.userId(), to_type: type}  // ta -> me
        ]
      };

    console.log('where:', where);
    return {
      id: slef.params.query['id'],
      title: function(){
        return page_title.get();
      },
      is_group: function(){
        return slef.params.type === 'group';
      },
      query: Messages.find(where, {sort: {create_time: -1}}),
      type: slef.params.type,
      where: where,
      messages: function(){
        // return Messages.find(where, {limit: list_limit.get(), sort: {create_time: -1}}).fetch().reverse();
        var res = [];
        Messages.find(where, {limit: list_limit.get(), sort: {create_time: -1}}).forEach(function (doc) {
          doc.show_time_str = get_diff_time((new Date(doc.create_time)).getTime());
          doc.has_show_time = true;

          if (res.length > 0){
            for(var i=res.length-1;i>=0;i--){
              if (res[i].show_time_str === doc.show_time_str)
                res[i].has_show_time = false;
            }
          }

          res.splice(0, 0, doc);
        });
        return res;
      },
      loading: is_loading.get()
    };
  }
});

// lazyload
Template._simpleChatToChatItemImg.onRendered(function(){
  this.$("img.lazy:not([src])").lazyload({
    container: $(".box")
  });
});
Template._simpleChatToChatItemIcon.onRendered(function(){
  this.$("img.lazy:not([src])").lazyload({
    container: $(".box")
  });
});
Template._simpleChatToChatItemIcon2.onRendered(function(){
  this.$("img.lazy:not([src])").lazyload({
    container: $(".box")
  });
});


Template._simpleChatToChatLayout.onRendered(function(){
  page_data = this.data;
});
Template._simpleChatToChatLayout.onDestroyed(function(){
  page_data = null;
});

var time_list = [];
var init_page = false;
// var fix_data_timeInterval = null;
// var fix_data = function(){
//   var data = page_data.messages();// message_list.get(); //Blaze.getData($('.simple-chat')[0]).messages.fetch();
//   data.sort(function(a, b){
//     return a.create_time - b.create_time;
//   });
//   if(data.length > 0){
//     for(var i=0;i<data.length;i++){
//       data[i].show_time_str = get_diff_time(data[i].create_time);
//       if(i===0)
//         data[i].show_time = true;
//       else if(data[i].show_time_str != data[i-1].show_time_str)
//         data[i].show_time = true;
//       else
//         data[i].show_time = false;
//     }
//   }
//   list_data.set(data);
// };
var get_people_names = function(){
  var names = People.find({}, {sort: {updateTime: -1}, limit: 50}).fetch();
  var result = [];
  if(names.length > 0){
    for(var i=0;i<names.length;i++){
      if(result.indexOf(names[i].name) === -1)
        result.push(names[i].name);
    }
  }

  return result;
};

var onFixName = function(id, uuid, his_id, url, to, value, type){
  var user = Meteor.user();
  var images = [];

  if (url && Object.prototype.toString.call(url) === '[object Array]'){
    for(var i=0;i<url.length;i++)
      images.push({
        _id: new Mongo.ObjectID()._str,
        people_his_id: his_id,
        url: url[i].url
      });
  }

  var msg = {
    _id: new Mongo.ObjectID()._str,
    form: {
      id: user._id,
      name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
      icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png'
    },
    to: to,
    images: images,
    to_type: "group",
    type: "text",
    create_time: new Date(),
    people_id: id,
    people_uuid: uuid,
    people_his_id: his_id,
    is_read: false
  };

  switch(type){
    case 'label':
      msg.text = '此照片是"' + value + '" ~';
      Messages.insert(msg);
      sendMqttGroupMessage(msg.to.id, msg);
      // sendMqttMessage('workai', msg);
      // sendMqttMessage('trainset', {url: url, person_id: '', device_id: uuid, face_id: id});
      break;
    case 'check':
      msg.text = '此照片是"' + value + '" ~';
      Messages.insert(msg);
      sendMqttGroupMessage(msg.to.id, msg);
      // sendMqttMessage('workai', msg);
      // sendMqttMessage('trainset', {url: url, person_id: '', device_id: uuid, face_id: id});
      break;
    case 'remove':
      msg.text = '删除照片: ' + value;
      Messages.insert(msg);
      sendMqttGroupMessage(msg.to.id, msg);
      // sendMqttMessage('workai', msg);
      if (url && Object.prototype.toString.call(url) === '[object Array]'){
        url.forEach(function(img){
          sendMqttMessage('trainset', {url: img.url, person_id: '', device_id: uuid, face_id: id, drop: true});
        });
      }else{
        sendMqttMessage('trainset', {url: url, person_id: '', device_id: uuid, face_id: id, drop: true});
      }
      break;
  };
  Meteor.setTimeout(function() {
    $('.simple-chat-label').remove();
    $('#swipebox-overlay').remove();
  }, 500);
};

var showBoxView = null;
var showBox = function(title, btns, list, tips, callback){
  if(showBoxView)
    Blaze.remove(showBoxView);
  showBoxView = Blaze.renderWithData(Template._simpleChatToChatLabelBox, {
    title: title,
    btns: btns || ['知道了'],
    list: list,
    tips: tips,
    callback: callback || function(){},
    remove: function(){Blaze.remove(showBoxView);}
  }, document.body);
};
Template._simpleChatToChatLabelBox.events({
  'click .mask': function(e, t){
    t.data.remove();
  },
  'click .my-btn': function(e, t){
    var index = 0;
    var btns = t.$('.my-btn');
    var value = t.$('select').val() || t.$('input').val();

    for(var i=0;i<btns.length;i++){
      if(btns[i].innerHTML === $(e.currentTarget).html()){
        index = i;
        break;
      }
    }
    console.log('selected:', index, value);
    t.data.remove();
    t.data.callback(index, value);
  },
  'change select': function(e, t){
    var $input = t.$('input');
    var $select = t.$('select');

    if($(e.currentTarget).val() === ''){
      $select.hide();
      $input.show();
    }else{
      $input.hide();
      $select.show();
    }
  }
});

// Template._simpleChatToChat.onDestroyed(function(){
//   if(fix_data_timeInterval){
//     Meteor.clearInterval(fix_data_timeInterval);
//     fix_data_timeInterval = null;
//   }
// });

var setMsgList = function(where, action){
  if(action === 'insert' || action === 'remove'){Meteor.setTimeout(function(){$('.box').scrollTop($('.box ul').height());}, 200);}
};

Template._simpleChatToChat.onRendered(function(){
  is_loading.set(true);
  list_limit.set(list_limit_val);
  time_list = [];
  init_page = false;
  list_data.set([]);
  message_list.set([]);
  var slef = this;

  if (!Messages.onBefore){
    Messages.after.insert(function (userId, doc) {
      if (!page_data)
        return;
      if (doc.to_type === page_data.type && doc.to.id === page_data.id){
        console.log('message insert');
        setMsgList(page_data.where, 'insert');
      }
    });
    Messages.after.update(function (userId, doc, fieldNames, modifier, options) {
      if (!page_data)
        return;
      if (doc.to_type === page_data.type && doc.to.id === page_data.id){
        console.log('message update');
        setMsgList(page_data.where, 'update');
      }
    });
    Messages.after.remove(function (userId, doc){
      console.log('message remove');
      if (!page_data)
        return;
      if (doc.to_type === page_data.type && doc.to.id === page_data.id){
        console.log('message update');
        setMsgList(page_data.where, 'remove');
      }
    });
    Messages.onBefore = true;
  }

  // if(fix_data_timeInterval){
  //   Meteor.clearInterval(fix_data_timeInterval);
  //   fix_data_timeInterval = null;
  // }
  // fix_data_timeInterval = Meteor.setInterval(fix_data, 1000*60);
  Meteor.subscribe('people_new', function(){});

  Meteor.subscribe('get-messages', slef.data.type, slef.data.id, function(){
    if(slef.data.type != 'user'){
      page_title.set(Groups.findOne({_id: slef.data.id}) ? Groups.findOne({_id: slef.data.id}).name : 'AI训练群');
    }else{
      var user = Meteor.users.findOne({_id: slef.data.id});
      page_title.set(AppConfig.get_user_name(user));
    }

    init_page = true;
    $('.box').scrollTop($('.box ul').height());
    is_loading.set(false);
  });

  $('.box').scroll(function () {
    if($('.box').scrollTop() === 0 && !is_loading.get()){
      // if(slef.data.messages.count() >= list_limit.get())
      is_loading.set(true);
      list_limit.set(list_limit.get()+list_limit_val);
      Meteor.setTimeout(function(){is_loading.set(false);}, 500);
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
    // $('li#' + data._id + ' img.swipebox').each(function(){
    //   imgs.push({
    //     href: $(this).attr('src'),
    //     title: ''
    //   });
    //   if($(e.currentTarget).attr('src') === $(this).attr('src'))
    //     selected = index;
    //   index += 1;
    // });
    if(data.images.length > 0){
      for(var i=0;i<data.images.length;i++){
        imgs.push({
          href: data.images[i].url,
          title: ''
        });
        if(data.images[i].url === $(e.currentTarget).attr('src'))
          selected = i;
      }
    }
    if(imgs.length > 0){
      console.log('imgs:', imgs);
      var labelView = null;

      $.swipebox(imgs, {
        initialIndexOnArray: selected,
        hideCloseButtonOnMobile : true,
        loopAtEnd: false,
        beforeOpen: function(){
          if (data.people_id)
            Session.set('SimpleChatToChatLabelImage', data.images[selected]);
            labelView = Blaze.renderWithData(Template._simleChatToSwipeBox, data, document.body);
        },
        afterClose: function(){
          if (data.people_id)
            Blaze.remove(labelView);
        },
        indexChanged: function(index){
          var data = Blaze.getData($('.simple-chat-swipe-box')[0]);
          var $img = $('#swipebox-overlay .slide.current img');

          console.log($img.attr('src'));
          console.log(_.pluck(data.images, 'url'));
          Session.set('SimpleChatToChatLabelImage', data.images[index]);
        }
      });
    }
  },
  'click li div.showmore':function(e){
    console.log(e.currentTarget.id);
    id = e.currentTarget.id;
    $('li#' + id + ' div.showmore').hide();
    $('li#' + id + ' div.text .imgs').removeAttr('style');
    $('li#' + id + ' div.text .imgs-1-box').removeAttr('style');
  },
  'click .check': function(){
    Template._simpleChatLabelDevice.open(this);
    // var data = this;
    // var names = get_people_names();

    // show_label(function(name){
    //   Meteor.call('get-id-by-name', data.people_uuid, name, function(err, res){
    //     if(err)
    //       return PUB.toast('标记失败，请重试~');

    //     console.log(res);
    //     PeopleHis.update({_id: data.people_his_id}, {
    //       $set: {fix_name: name, msg_to: data.to},
    //       $push: {fix_names: {
    //         _id: new Mongo.ObjectID()._str,
    //         name: name,
    //         userId: Meteor.userId(),
    //         userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
    //         userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
    //         fixTime: new Date()
    //       }}
    //     }, function(err, num){
    //       if(err || num <= 0){
    //         return PUB.toast('标记失败，请重试~');
    //       }

    //       data.images.forEach(function(img) {
    //         Messages.update({_id: data.msg_id, 'images.url': img.url}, {
    //           $set: {
    //             'images.$.label': name,
    //             'images.$.result': ''
    //           }
    //         });
    //         sendMqttMessage('trainset', {url: img.url, person_id: res.id ? res.id : '', device_id: data.people_uuid, face_id: res ? res.faceId : data.people_id, drop: false});
    //       });

    //       onFixName(data.people_id, data.people_uuid, data.people_his_id, data.images, data.to, name, 'label');
    //       PUB.toast('标记成功~');
    //     });
    //   });
    // });
  },
  'click .crop':function(){
    Template._simpleChatLabelCrop.open(this);
  },
  'click .remove': function(){
    Template._simpleChatLabelRemove.open(this);
  },
  'click .yes': function(){
    // update label
    var setNames = [];
    for (var i=0;i<this.images.length;i++){
      if (this.images[i].label) {
        var trainsetObj = {group_id: this.to.id, type: 'trainset', url: this.images[i].url, person_id: '', device_id: this.people_uuid, face_id: this.images[i].id, drop: false};
        console.log("##RDBG trainsetObj: " + JSON.stringify(trainsetObj));
        sendMqttMessage('/device/'+this.to.id, trainsetObj);
      }

      if (_.pluck(setNames, 'id').indexOf(this.images[i].id) === -1)
        setNames.push({uuid: this.people_uuid, id: this.images[i].id, url: this.images[i].url, name: this.images[i].label});
    }
    if (setNames.length > 0)
      Meteor.call('set-person-names', this.to.id, setNames);

    var user = Meteor.user();
    sendMqttGroupLabelMessage(this.to.id, {
      _id: new Mongo.ObjectID()._str,
      msgId: this._id,
      user: {
        id: user._id,
        name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
        icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
      },
      createAt: new Date()
    });

    // update collection
    Messages.update({_id: this._id}, {$set: {label_complete: true}});

    Meteor.setTimeout(function(){
      var $box = $('.box');
      $box.scrollTop($box.scrollTop()+10);
      $box.trigger("scroll");
    }, 500);

    // var data = this;
    // var names = get_people_names();
    // var name = data.images[0].label;

    // Meteor.call('get-id-by-name', data.people_uuid, name, function(err, res){
    //   if(err)
    //     return PUB.toast('标记失败，请重试~');

    //   console.log(res);
    //   PeopleHis.update({_id: data.people_his_id}, {
    //     $set: {fix_name: name, msg_to: data.to},
    //     $push: {fix_names: {
    //       _id: new Mongo.ObjectID()._str,
    //       name: name,
    //       userId: Meteor.userId(),
    //       userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
    //       userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
    //       fixTime: new Date()
    //     }}
    //   }, function(err, num){
    //     if(err || num <= 0){
    //       return PUB.toast('标记失败，请重试~');
    //     }

    //     data.images.forEach(function(img) {
    //       Messages.update({_id: data.msg_id, 'images.url': img.url}, {
    //         $set: {
    //           'images.$.label': name,
    //           'images.$.result': ''
    //         }
    //       });
    //       sendMqttMessage('trainset', {url: img.url, person_id: res.id ? res.id : '', device_id: data.people_uuid, face_id: res ? res.faceId : data.people_id, drop: false});
    //     });

    //     onFixName(data.people_id, data.people_uuid, data.people_his_id, data.images, data.to, name, 'label');
    //     PUB.toast('标记成功~');
    //   });
    // });
  },
  'click .no': function(){
    Template._simpleChatLabelLabel.open(this);
    // var data = this;
    // var names = get_people_names();

    // showBox('提示', ['重新标记', '删除'], null, '你要重新标记照片还是删除？', function(index){
    //   if(index === 0)
    //     show_label(function(name){
    //       Meteor.call('get-id-by-name', data.people_uuid, name, function(err, res){
    //         if(err)
    //           return PUB.toast('标记失败，请重试~');

    //         PeopleHis.update({_id: data.people_his_id}, {
    //           $set: {fix_name: name, msg_to: data.to},
    //           $push: {fix_names: {
    //             _id: new Mongo.ObjectID()._str,
    //             name: name,
    //             userId: Meteor.userId(),
    //             userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
    //             userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
    //             fixTime: new Date()
    //           }}
    //         }, function(err, num){
    //           if(err || num <= 0){
    //             return PUB.toast('标记失败，请重试~');
    //           }

    //           data.images.forEach(function(img) {
    //             Messages.update({_id: data.msg_id, 'images.url': img.url}, {
    //               $set: {
    //                 'images.$.label': name,
    //                 'images.$.result': ''
    //               }
    //             });
    //             sendMqttMessage('trainset', {url: img.url, person_id: res.id ? res.id : '', device_id: data.people_uuid, face_id: res ? res.faceId : data.people_id, drop: false});
    //           });

    //           onFixName(data.people_id, data.people_uuid, data.people_his_id, data.images, data.to, name, 'label');
    //           PUB.toast('标记成功~');
    //         });
    //       });
    //     });
    //   else
    //     show_remove(function(text){
    //       PeopleHis.update({_id: data.people_his_id}, {
    //         $set: {msg_to: data.to},
    //         $push: {fix_names: {
    //           _id: new Mongo.ObjectID()._str,
    //           userId: Meteor.userId(),
    //           userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
    //           userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
    //           fixTime: new Date(),
    //           fixType: 'remove',
    //           removeText: text
    //         }}
    //       }, function(err, num){
    //         if(err || num <= 0){
    //           console.log(err);
    //           return PUB.toast('删除失败，请重试~');
    //         }

    //         data.images.forEach(function(img) {
    //           Messages.update({_id: data.msg_id, 'images.url': img.url}, {
    //             $set: {
    //               'images.$.result': 'remove'
    //             }
    //           });
    //         });

    //         onFixName(data.people_id, data.people_uuid, data.people_his_id, data.images, data.to, text, 'remove');
    //         PUB.toast('删除成功~');
    //       });
    //     });
    // });
  },
  'click .show_more': function(e, t){
    var $li = $('li#' + this._id);
    var $imgs = $li.find('.text .imgs');
    var $labels = $li.find('.text .imgs-1-item');
    var $show = $li.find('.show_more');
    var $box = $('.box');

    if ($imgs.find('div._close').length > 0 || $labels.find('div._close').length > 0){
      $show.html('<i class="fa fa-angle-up"></i>');
      $imgs.find('.img_container').removeClass('_close');
      $labels.find('.img_container').removeClass('_close');
      $box.trigger("scroll");
      $box.scrollTop($box.scrollTop()+1);
      // $box.scrollTop($box.scrollTop()-1);
    } else {
      $show.html('<i class="fa fa-angle-right"></i>');
      $imgs.find('.img_container').addClass('_close');
      $labels.find('.img_container').addClass('_close');
    }
  }
});

Template._simpleChatToChatLabel.helpers({
  data: function(){
    return Session.get('SimpleChatToChatLabelImage');
  }
});

Template._simpleChatToChatLabel.events({
  'click .btn-label.yes': function(){
    var $img = $('#swipebox-overlay .slide.current img');
    var data = this;
    var names = get_people_names();

    show_label(data.to.id, function(name){
      Meteor.call('get-id-by-name', data.people_uuid, name, function(err, res){
        if(err)
          return PUB.toast('标记失败，请重试~');

        console.log(res);
        PeopleHis.update({_id: data.people_his_id}, {
          $set: {fix_name: name, msg_to: data.to},
          $push: {fix_names: {
            _id: new Mongo.ObjectID()._str,
            name: name,
            userId: Meteor.userId(),
            userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
            userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
            fixTime: new Date()
          }}
        }, function(err, num){
          if(err || num <= 0){
            return PUB.toast('标记失败，请重试~');
          }

          Messages.update({_id: data.msg_id, 'images.url': $img.attr('src')}, {
            $set: {
              'images.$.label': name,
              'images.$.result': ''
            }
          });

          onFixName(data.people_id, data.people_uuid, data.people_his_id, $img.attr('src'), data.to, name, 'label');
          sendMqttMessage('trainset', {url: $img.attr('src'), person_id: res.id ? res.id : '', device_id: data.people_uuid, face_id: res ? res.faceId : data.people_id, drop: false});
          PUB.toast('标记成功~');
        });
      });
    });
  },
  'click .btn-yes': function(){
    var $img = $('#swipebox-overlay .slide.current img');
    var data = this;
    var name = data.images[0].label;

    Meteor.call('get-id-by-name', data.people_uuid, name, function(err, res){
      if(err)
        return PUB.toast('标记失败，请重试~');

      PeopleHis.update({_id: data.people_his_id}, {
        $set: {fix_name: name, msg_to: data.to},
        $push: {fix_names: {
          _id: new Mongo.ObjectID()._str,
          name: name,
          userId: Meteor.userId(),
          userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
          userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
          fixTime: new Date()
        }}
      }, function(err, num){
        if(err || num <= 0){
          return PUB.toast('标记失败，请重试~');
        }

        Messages.update({_id: data.msg_id, 'images.url': $img.attr('src')}, {
          $set: {
            'images.$.label': name,
            'images.$.result': ''
          }
        });

        onFixName(data.people_id, data.people_uuid, data.people_his_id, $img.attr('src'), data.to, name, 'label');
        sendMqttMessage('trainset', {url: $img.attr('src'), person_id: res.id ? res.id : '', device_id: data.people_uuid, face_id: res ? res.faceId : data.people_id, drop: false});
        PUB.toast('标记成功~');
      });
    });
  },
  'click .btn-no': function(){
    var $img = $('#swipebox-overlay .slide.current img');
    var data = this;
    var name = Session.get('SimpleChatToChatLabelImage').label;
    var names = get_people_names();

    showBox('提示', ['重新标记', '删除'], null, '你要重新标记照片还是删除？', function(index){
      if(index === 0)
        show_label(data.to.id, function(name){
          Meteor.call('get-id-by-name', data.people_uuid, name, function(err, res){
            if(err)
              return PUB.toast('标记失败，请重试~');

            PeopleHis.update({_id: data.people_his_id}, {
              $set: {fix_name: name, msg_to: data.to},
              $push: {fix_names: {
                _id: new Mongo.ObjectID()._str,
                name: name,
                userId: Meteor.userId(),
                userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
                userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
                fixTime: new Date()
              }}
            }, function(err, num){
              if(err || num <= 0){
                return PUB.toast('标记失败，请重试~');
              }

              Messages.update({_id: data.msg_id, 'images.url': $img.attr('src')}, {
                $set: {
                  'images.$.label': name,
                  'images.$.result': ''
                }
              });

              onFixName(data.people_id, data.people_uuid, data.people_his_id, $img.attr('src'), data.to, name, 'label');
              sendMqttMessage('trainset', {url: $img.attr('src'), person_id: res.id ? res.id : '', device_id: data.people_uuid, face_id: res ? res.faceId : data.people_id, drop: false});
              PUB.toast('标记成功~');
            });
          });
        });
      else
        show_remove(function(text){
          PeopleHis.update({_id: data.people_his_id}, {
            $set: {msg_to: data.to},
            $push: {fix_names: {
              _id: new Mongo.ObjectID()._str,
              userId: Meteor.userId(),
              userName: Meteor.user().profile && Meteor.user().profile.fullname ? Meteor.user().profile.fullname : Meteor.user().username,
              userIcon: Meteor.user().profile && Meteor.user().profile.icon ? Meteor.user().profile.icon : '/userPicture.png',
              fixTime: new Date(),
              fixType: 'remove',
              removeText: text
            }}
          }, function(err, num){
            if(err || num <= 0){
              console.log(err);
              return PUB.toast('删除失败，请重试~');
            }

            Messages.update({_id: data.msg_id, 'images.url': $img.attr('src')}, {
              $set: {
                'images.$.result': 'remove'
              }
            });

            onFixName(data.people_id, data.people_uuid, data.people_his_id, $img.attr('src'), data.to, text, 'remove');
            PUB.toast('删除成功~');
          });
        });
    });
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

var selectMediaFromAblumWithSize = function(max_number,width, height,callback) {
    window.imagePicker.getPictures(
        function(results) {

            if (results === undefined) {
                return;
            }

            var length = 0;
            try {
                length = results.length;
            } catch (error) {
                length = results.length;
            }
            if (length === 0) {
                callback('cancel');
                return;
            }

            for (var i = 0; i < length; i++) {
                var timestamp = new Date().getTime();
                var originalFilename = results[i].replace(/^.*[\\\/]/, '');
                var filename = Meteor.userId() + '_' + timestamp + '_' + originalFilename;
                console.log('File name ' + filename);
                console.log('Original full path ' + results[i]);
                var params = '';
                if (device.platform === 'Android') {
                    params = { filename: filename, URI: results[i], smallImage: 'cdvfile://localhost/cache/' + originalFilename };
                } else {
                    params = { filename: filename, URI: results[i], smallImage: 'cdvfile://localhost/persistent/drafts/' + originalFilename };
                }
                callback(null, params, (i + 1), length);
            }
        },
        function(error) {
            console.log('Pick Image Error ' + error);
            if (callback) {
                callback(null);
            }
        }, {
            maximumImagesCount: max_number,
            width: width || 480,
            height: height || 640,
            quality: 20,
            storage: 'persistent'
        });
};


Template._simpleChatToChatLayout.onRendered(function(){
  if(Meteor.isCordova){
    $('#container').click(function(){
      selectMediaFromAblumWithSize(1,480,640,function(cancel, result, currentCount, totalCount){
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
  },
  isGroups:function(){
    var data = Blaze.getData(Blaze.getView(document.getElementsByClassName('simple-chat')[0]));
    return data.is_group();
  }
});

Template._simpleChatToChatLayout.events({
  'focus .input-text': function(){
    Meteor.setTimeout(function(){
      $('body').scrollTop(999999);
    }, 500);
  },
  'submit .input-form': function(e, t){
    try{
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

      var msg = {
        _id: new Mongo.ObjectID()._str,
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
      };
      Messages.insert(msg, function(){
        if(data.type === 'group')
          sendMqttGroupMessage(msg.to.id, msg);
        else
          sendMqttUserMessage(msg.to.id, msg);
        Meteor.setTimeout(function(){$('.box').scrollTop($('.box ul').height());}, 200);
      });

      $('.input-text').val('');
      return false;
    }catch(ex){console.log(ex); return false;}
  },
  'click .groupsProfile':function(e,t){
    var data = Blaze.getData(Blaze.getView(document.getElementsByClassName('simple-chat')[0]));
    Router.go('/groupsProfile/'+data.type+'/'+data.id);
  },
  'click .userProfile':function(e,t){
    var data = Blaze.getData(Blaze.getView(document.getElementsByClassName('simple-chat')[0]));
    Router.go('/groupsProfile/'+data.type+'/'+data.id);
    //PUB.page('/simpleUserProfile/'+data.id);
  }

});

// Template._simpleChatToChatItem.initLazyLoad = function($li){
//   // 默认图像
//   $li.find('.text > .imgs img.lazy').lazyload({
//     container: $('.box')
//   });

//   // 标注过的图
//   $li.find('.text > .imgs-1-box img.lazy').lazyload({
//     container: $('.box')
//   });

//   // 有裁剪按钮的图
//   $li.find('.img > .imgs img.lazy').lazyload({
//     container: $('.box')
//   });

//   // 标注者头像
//   $li.find('.text > .label_complete .imgs img.lazy').lazyload({
//     container: $('.box')
//   });

//   // 用户头像
//   $li.find('.icon img.lazy').lazyload({
//     container: $('.box')
//   });
// };

// Template._simpleChatToChatItem.onRendered(function(){
//   var t = this;
//   Template._simpleChatToChatItem.initLazyLoad(t.$('li'));
// });

Template._simpleChatToChatItem.helpers({
  is_system_message:function(){
    if (this.type === 'system') {
      return true;
    }
    return false;
  },
  is_error: function(images){
    for(var i=0;i<images.length;i++){
      if (images[i].error)
        return true;
    }
    return false;
  },
  is_remove: function(images){
    for(var i=0;i<images.length;i++){
      if (images[i].remove)
        return true;
    }
    return false;
  },
  is_label: function(images){
    for(var i=0;i<images.length;i++){
      if (images[i].label)
        return true;
    }
    return false;
  },
  is_remove_label: function(images){
    for(var i=0;i<images.length;i++){
      if (images[i].remove || images[i].label)
        return true;
    }
    return false;
  },
  is_wait_img: function(images){
    for(var i=0;i<images.length;i++){
      if (!images[i].remove && !images[i].label && !images[i].error)
        return true;
    }
    return false;
  },
  is_wait_item: function(item){
    return !item.remove && !item.label && !item.error;
  },
  ta_me: function(id){
    return id != Meteor.userId() ? 'ta' : 'me';
  },
  show_images: function(images){
    var $li = $('li#' + this._id);
    var is_more = false;

    // 默认图像
    var $imgs = $li.find('.text > .imgs img');
    if ($imgs.length >= 4){
      is_more = true;
    }

    // 标注过的图
    $imgs = $li.find('.text > .imgs-1-box img');
    if ($imgs.length >= 5){
      is_more = true;
    }

    // 有裁剪按钮的图
    $imgs = $li.find('.img > .imgs img');
    if ($imgs.length >= 4){
      is_more = true;
    }

    if (is_more)
      $li.find('.show_more').show();
  },
  is_show_time: function(id){
    try{
      var data = list_data.get();
      return data[_.pluck(data, '_id').indexOf(id)].show_time;
    }catch(ex){return false;}
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
      images:[
        {
          _id: new Mongo.ObjectID()._str,
          id:'',
          url:null,
          label:null,
          people_his_id:id,
          thumbnail: '/packages/feiwu_simple-chat/images/sendingBmp.gif'
        }
      ],
      //thumbnail: '/packages/feiwu_simple-chat/images/sendingBmp.gif',
      create_time: new Date(),
      people_uuid:'',
      people_his_id:id,
      wait_lable:true,
      is_read: false
    }, function(err, id){
      console.log('insert id:', id);
      $('.box').scrollTop($('.box ul').height());
    });
  },
  update: function(id, url){
    var msg = Messages.findOne({_id: id});
    var images = msg.images;
    for (var i = 0; i < images.length; i++) {
      images[i].url = url;
    }
    Messages.update({_id: id}, {$set: {
      images: images
    }}, function(){
      console.log('update id:', id);
      $('.box').scrollTop($('.box ul').height());
      if (msg.to_type === 'group')
        sendMqttGroupMessage(msg.to.id, Messages.findOne({_id: id}));
      else
        sendMqttUserMessage(msg.to.id, Messages.findOne({_id: id}));
    });
  },
  remove: function(id){
    Messages.remove({_id: id}, function(){
      console.log('remove id:', id);
      $('.box').scrollTop($('.box ul').height());
    });
  }
};

var updateMessageForTemp = function(id){
  console.log('update message from temp:', id);

  MessageTemp.find({'msg.to.id': id}, {sort: {createAt: -1}, limit: 20}).fetch().forEach(function(item){
    Meteor.setTimeout(function(){
      MessageTemp.remove({_id: item._id});
      onMqttMessage(item.topic, JSON.stringify(item.msg));
    }, 0);
  });
};

var msgGroup = [];
var updateNewMessageInterval = null;
var updateNewMessage = function(id){
  if (msgGroup.indexOf(id) === -1)
    msgGroup.push(id);
  if (updateNewMessageInterval)
    return;

  updateNewMessageInterval = Meteor.setInterval(function(){
    if (MessageTemp.find({}).count() <= 0){
      if (updateNewMessageInterval)
        Meteor.clearInterval(updateNewMessageInterval);
      msgGroup = [];
      updateNewMessageInterval = null;
    } else {
      msgGroup.forEach(function(item){
        updateMessageForTemp(item)
      });
    }
  }, 1000*30); // 30 秒取一次最新消息
};

//删除本地数据库过多的老的聊天数据
var clearMsgTime = null;
var clearMsgLastTime = null;
var clearMsgForGroundDB = function(){
  if (Meteor.userId()) {
    Meteor.subscribe('get-my-group',Meteor.userId(), {
      onReady: function() {
        var myGroup = GroupUsers.find({user_id: Meteor.userId()});
        if (myGroup) {
          myGroup.forEach(function(item){
            var msg = Messages.find({'to.id': item.group_id}).fetch();
            if (msg && msg.length > 100) {
              for (var i = 0; i < msg.length - 100; i++) {
                Messages.remove({_id:msg[i]._id});
              }
            }
          });
        }
      }
    });
  }
}
var clearMoreOldMessage = function(){
   if (clearMsgTime) {
    Meteor.clearTimeout(clearMsgTime);
    clearMsgTime = null;
   }
   if (clearMsgLastTime && new Date() - clearMsgLastTime > 1000*300) {
    clearMsgForGroundDB();
    clearMsgLastTime = new Date();
   }
   else{
    clearMsgTime = Meteor.setTimeout(function(){
      clearMsgForGroundDB();
      clearMsgLastTime = new Date();
      clearMsgTime = null;
    },1000*60);
   }
}

SimpleChat.onMqttMessage = function(topic, msg) {
  var msgObj = JSON.parse(msg);

  if (!(topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/')))
    return;
  clearMoreOldMessage();
  if (!msgObj.is_people)
    return Messages.insert(msgObj);

  MessageTemp.insert({
    topic: topic,
    msg: msgObj,
    createAt: msgObj.create_time || new Date()
  }, function(err){
    if (!err)
      updateNewMessage(msgObj.to.id);
  });
  //onMqttMessage(topic, msg);
};

var onMqttMessage = function(topic, msg) {
  var insertMsg = function(msgObj, type){
    console.log(type, msgObj._id);
    Messages.insert(msgObj, function(err, _id){
      if (err)
        console.log('insert msg error:', err);
    });
  };

  if (!(topic.startsWith('/msg/g/') || topic.startsWith('/msg/u/')))
    return;

  Session.set('hasNewLabelMsg', true);
  var msgObj = JSON.parse(msg);

  if (msgObj.to_type == 'group') {
    var record = GroupUsers.findOne({group_id: msgObj.to.id, user_id: Meteor.userId()});
    if (!record) {
      console.log('receive group message from group that i am not in: ' + msgObj.to.id);
      return;
    }
  }


  var whereTime = new Date();whereTime.setHours(0);whereTime.setMinutes(0);whereTime.setSeconds(0);
  var msgType = topic.split('/')[2];
  var where = {
    to_type: msgObj.to_type,
    wait_lable: msgObj.wait_lable,
    label_complete: {$ne: true},
    label_start: {$ne: true},
    'to.id': msgObj.to.id,
    images: {$exists: true},
    create_time: {$gte: whereTime},
    type: 'text'
  };

  msgObj.msg_ids = [{id: msgObj._id}];
  msgObj.create_time = msgObj.create_time ? new Date(msgObj.create_time) : new Date();
  if (msgObj.images && msgObj.length > 0 && msgObj.is_people && msgObj.people_id){
    for(var i=0;i<msgObj.images.length;i++)
      msgObj.images[i].id = msgObj.people_id;
  }

  if (msgObj.wait_lable){where.people_uuid = msgObj.people_uuid; where.people_id = msgObj.people_id;}
  else if (!msgObj.wait_lable && msgObj.images && msgObj.images.length > 0) {where['images.label'] = msgObj.images[0].label}
  else {return Messages.insert(msgObj)}

  console.log('SimpleChat.SimpleChat where:', where);
  var targetMsg = Messages.findOne(where, {sort: {create_time: -1}});

  if (Messages.find({_id: msgObj._id}).count() > 0)
    return console.log('已存在此消息:', msgObj._id);
  if (!targetMsg || !targetMsg.images || targetMsg.images.length <= 0)
    return insertMsg(msgObj, '无需合并消息');
  if (targetMsg.images && targetMsg.images.length >= 40)
    return insertMsg(msgObj, '单行照片超过 40 张');
  if (!msgObj.images || msgObj.images.length <= 0)
    return insertMsg(msgObj, '不是图片消息');
  if (msgObj.to_type != 'group' || !msgObj.is_people)
    return insertMsg(msgObj, '不是 Group 或人脸消息');

  var setObj = {/*create_time: new Date(),*/ 'form.name': msgObj.form.name};
  if (msgObj.wait_lable){
    var count = 0;
    for(var i=0;i<targetMsg.images.length;i++){
      if (!targetMsg.images[i].label && !targetMsg.images[i].remove && !targetMsg.images[i].error)
        count += 1;
    }
    for(var i=0;i<msgObj.images.length;i++){
      if (!msgObj.images[i].label && !msgObj.images[i].remove && !msgObj.images[i].error)
        count += 1;
    }
    if (count > 0)
      setObj.text = count + ' 张照片需要标注';
  } else {
    setObj.text = msgObj.images[0].label + '：';
  }

  Messages.update({_id: targetMsg._id}, {
    $set: setObj,
    $push: {images: {$each: msgObj.images}, msg_ids: {id: msgObj._id}}
  }, function(err, num){
    if (err || num <= 0)
      insertMsg(msgObj, 'update 失败');
  });
};

SimpleChat.onMqttLabelMessage = function(topic, msg) {
  if (!topic.startsWith('/msg/l/'))
    return;

  var msgObj = JSON.parse(msg);
  var msgId = topic.split('/')[3];
  var targetMsg = Messages.findOne({$or: [{'msg_ids.id': msgObj.msgId}, {_id: msgObj.msgId}]}, {sort: {create_time: -1}});

  if (!targetMsg)
    return;
  if (targetMsg.label_users && targetMsg.label_users.length > 0 && _.pluck(targetMsg.label_users, 'id').indexOf(msgObj.user.id) >= 0)
    return;
  Messages.update({_id: targetMsg._id}, {
    $push: {label_users: msgObj.user},
   //  $set: {create_time: new Date()}
  }, function(){
    Meteor.setTimeout(function(){
      var $box = $('.box');
      $box.scrollTop($box.scrollTop()+1);
      $box.trigger("scroll");
    }, 100);
  });
};

// SimpleChat.onMqttMessage('/msg/g/b82cc56c599e4c143442c6d0', JSON.stringify({
//   "_id":new Mongo.ObjectID()._str,
//   "form":{"id":"u5DuPhJYW5raAQYuh","name":"7YRBBDB722002717","icon":"/userPicture.png"},
//   "to":{"id":"b82cc56c599e4c143442c6d0","name":"群聊 2","icon":""},
//   "images":[{"_id":new Mongo.ObjectID()._str,"id":"17","people_his_id":"56rqonm3FNssmh6cR","url":"http://onm4mnb4w.bkt.clouddn.com/eb2a15d6-2310-11e7-9ce5-d065caa81a04","label":null}],
//   "to_type":"group",
//   "type":"text",
//   "text":"[设备 4,17]: -> 需要标注",
//   "create_time": new Date(),
//   "people_id":"17",
//   "people_uuid":"7YRBBDB722002717",
//   "people_his_id":"56rqonm3FNssmh6cR",
//   "wait_lable":true,
//   "is_people":true,
//   "is_read":false
// });

last_msg = null;
// SimpleChat.onMqttMessage = function(topic, msg) {
//   console.log('SimpleChat.onMqttMessage, topic: ' + topic + ', msg: ' + msg);
//   var group = topic.substring(topic.lastIndexOf('/') + 1);
//   var msgObj = JSON.parse(msg);
//   //var last_msg = Messages.findOne({}, {sort: {create_time: -1}});
//   if(msgObj.form.id === Meteor.userId()){
//     return;
//   }
//   if(last_msg && last_msg._id === msgObj._id){
//     return;
//   }
//   last_msg = msgObj;

//   if(Messages.find({_id: msgObj._id}).count() > 0){
//     // 自己发送的消息且本地已经存在
//     //if (msgObj && msgObj.form.id === Meteor.userId())
//     //  return;

//     //msgObj._id = new Mongo.ObjectID()._str;
//     return
//   }

//   try{
//     console.log('last_msg:', last_msg);
//     msgObj.create_time = msgObj.create_time ? new Date(msgObj.create_time) : new Date();
//     var group_msg = last_msg && msgObj && msgObj.to_type === 'group' && msgObj.to.id === last_msg.to.id; // 当前组消息
//     if (!group_msg)
//       return Messages.insert(msgObj);

//     if (last_msg && last_msg.is_people === true && last_msg.images && last_msg.images.length > 0 && msgObj.images && msgObj.images.length > 0){
//       if(!msgObj.wait_lable && msgObj.images[0].label === last_msg.images[0].label){
//         Messages.update({_id: last_msg._id}, {
//           $set: {create_time: msgObj.create_time},
//           $push: {images: msgObj.images[0]}
//         }, function(err, num){
//           if (err || num <= 0)
//             Messages.insert(msgObj);
//         });
//       }else if(msgObj.wait_lable && msgObj.people_id === last_msg.people_id && msgObj.people_uuid === last_msg.people_uuid){
//         Messages.update({_id: last_msg._id}, {
//           $set: {create_time: msgObj.create_time},
//           $push: {images: msgObj.images[0]}
//         }, function(err, num){
//           if (err || num <= 0)
//             Messages.insert(msgObj);
//         });
//       }else{
//         Messages.insert(msgObj);
//       }
//     }else{
//       Messages.insert(msgObj);
//     }
//   }catch(ex){
//     console.log(ex);
//     Messages.insert(msgObj);
//   }
// };


// label
var label_view = null;
var label_limit = new ReactiveVar(0);
show_label = function(group_id, callback){
  if (label_view)
    Blaze.remove(label_view);
  label_view = Blaze.renderWithData(Template._simpleChatToChatLabelName, {
    group_id: group_id,
    callback : callback || function(){}
  }, document.body)
}

Template._simpleChatToChatLabelNameImg.onRendered(function(){
  this.$("img.lazy:not([src])").lazyload({
    threshold: 100,
    container: $(".simple-chat-to-chat-label-name")
  });
});
Template._simpleChatToChatLabelName.onRendered(function(){
  label_limit.set(40);
  Meteor.subscribe('get-label-names', this.data.group_id, label_limit.get()); // TODO：
  var $box = this.$(".simple-chat-to-chat-label-name");
  $box.scroll(function(){
    if ($box.scrollTop() + $box[0].offsetHeight >= $box[0].scrollHeight){
      label_limit.set(label_limit.get()+20);
      Meteor.subscribe('get-label-names', this.data.group_id, label_limit.get()); // TODO：
      console.log('load more');
    }
  });
});
Template._simpleChatToChatLabelName.helpers({
  names: function(){
    return PersonNames.find({group_id: this.group_id}, {sort: {createAt: 1}, limit: label_limit.get()});
  }
});
Template._simpleChatToChatLabelName.events({
  'click li': function(e, t){
    $('#label-input-name').val(this.name);
    t.$('li img').removeAttr('style');
    $(e.currentTarget).find('img').attr('style', 'border: 1px solid #39a8fe;');
  },
  'click .leftButton': function(){
    Blaze.remove(label_view);
    label_view = null;
  },
  'click .rightButton': function(e, t){
    if (!$('#label-input-name').val())
      return PUB.toast('请选择或输入名字~');;

    t.data.callback && t.data.callback($('#label-input-name').val());
    Blaze.remove(label_view);
    label_view = null;
  }
});

// remove
var remove_view = null;
show_remove = function(callback){
  if (remove_view)
    Blaze.remove(remove_view);
  remove_view = Blaze.renderWithData(Template._simpleChatToChatLabelRemove, {
    callback : callback || function(){}
  }, document.body)
}

Template._simpleChatToChatLabelRemove.events({
  'click li': function(e, t){
    $('#label-input-name').val($(e.currentTarget).find('.userName').text());
    // t.$('li img').removeAttr('style');
    // $(e.currentTarget).find('img').attr('style', 'border: 1px solid #39a8fe;');
  },
  'click .leftButton': function(){
    Blaze.remove(remove_view);
    remove_view = null;
  },
  'click .rightButton': function(e, t){
    if (!$('#label-input-name').val())
      return PUB.toast('请输入删除照片的原因~');;

    t.data.callback && t.data.callback($('#label-input-name').val());
    Blaze.remove(remove_view);
    remove_view = null;
  }
});

Template._simpleChatToChatItemImg.helpers({
  hasAccAndFuzz:function(){
    return this.accuracy && this.fuzziness;
  }
})

Template._simleChatToSwipeBox.helpers({
  data:function(){
    return Session.get('SimpleChatToChatLabelImage');
  },
  hasAccAndFuzz:function(){
    var data = Session.get('SimpleChatToChatLabelImage');
    return data.accuracy && data.fuzziness;
  }
})
