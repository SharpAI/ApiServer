var view = null;
var type = new ReactiveVar('');
var limit1 = new ReactiveVar(0);
var limit2 = new ReactiveVar(0);
var selected = new ReactiveVar([]);
var limitSetp = 10;

Template.groupPhoto.helpers({
  is_type: function(val){
    return type.get() === val;
  },
  is_hover: function(val){
    return type.get() === val ? 'hover' : '';
  },
  is_selected: function(){
    return selected.get().length > 0 ;
  },
  list1: function(id){
    return SimpleChat.Messages.find({is_people: true, 'to.id': id, admin_label: {$ne: true}}, {limit: limit1.get(), sort: {create_time: 1}})
  },
  list2: function(id){
    return SimpleChat.GroupPhotoLabel.find({group_id: id}, {limit: limit2.get(), sort: {create_time: 1}})
  }
});

Template.groupPhoto.events({
  'click .back': function(){
    Template.groupPhoto.close();
  },
  'click .nav li': function(e){
    type.set($(e.currentTarget).html());
  },
  'click .btn-default': function(e, t){
    if ($(e.currentTarget).html() != '标注')
      return;

    SimpleChat.show_label(t.data.id, function(name){
      if(!name)
        return;

      var localTask = [];
      var wait_labels = [];

      $(e.currentTarget).html('处理中...');
      var select = selected.get();
      select.map(function(item){
        var ids = item.split('|');
        var msgObj = SimpleChat.Messages.findOne({_id: ids[0]});
        msgObj.images.map(function(img, i){
          if (img._id === ids[1]){
            if(_.pluck(wait_labels, '_id').indexOf(msgObj.people_uuid + '|' + msgObj.people_id) === -1){
              wait_labels.push({
                _id: msgObj.people_uuid + '|' + msgObj.people_id,
                id: msgObj.people_id,
                uuid: msgObj.people_uuid,
                url: img.url,
                img_type: img.img_type,
                style: img.style,
                sqlid: img.sqlid
              });
            }

            // update local da
            console.log('label', i);
            localTask.push({
              _id: ids[0],
              index: i,
              obj: img,
              group_id: t.data.id
            });
          }
        });
      });

      console.log('name:', name, 'labels:', wait_labels);
      console.log('local task:', localTask);

      Meteor.call('upLabels', t.data.id, name, wait_labels, function(err, res){
        if (err || !res){
          $(e.currentTarget).html('标注');
          return alert('标注失败~');
        }

        localTask.map(function(task){
          var $set = JSON.parse('{"images.'+task.index+'.admin_label": true}');
          console.log('update local db:', $set, 'id:', task._id);
          SimpleChat.Messages.update({_id: task._id}, {$set: $set}, function(err, num){
            if (err || num <= 0)
              return;

            // 生成群相册的标注信息（一张照片一条）
            SimpleChat.GroupPhotoLabel.insert({
              msg_id: task._id,
              img__id: task.obj._id,
              img_id: task.obj.id,
              img_uuid: task.obj.uuid,
              img_type: task.obj.img_type,
              img_style: task.obj.style,
              img_sqlid: task.obj.sqlid,
              img_index: task.index,
              img_label: name,
              img_url: task.obj.url,
              group_id: task.group_id,
              create_time: new Date()
            });
            
            try {
              if(task.obj.img_type && task.obj.img_type == 'face') {
                var person_info = {
                  //'id': res[updateObj.images[i].label].faceId,
                  'uuid': task.obj,
                  'name': name,
                  'group_id': task.group_id,
                  'img_url': task.obj.url,
                  'type': task.obj.img_type,
                  'ts': new Date(task.create_time).getTime(),
                  'accuracy': 1,
                  'fuzziness': 1
                };
                var data = {
                  face_id:task.obj.id,
                  person_info: person_info,
                  formLabel:true //是否是聊天室标记
                };
                //Meteor.call('send-person-to-web', person_info, function(err, res){});
                Meteor.call('ai-checkin-out',data,function(err,res){});
              }
            } catch(e){}

            // 处理是否已经全部标注
            var obj = SimpleChat.Messages.findOne({_id: task._id});
            if (obj && obj.images && obj.images){
              obj.admin_label = true;
              obj.images.map(function(img){
                if (!img.admin_label)
                  obj.admin_label = false;
              });
              if (obj.admin_label === true)
                SimpleChat.Messages.update({_id: task._id}, {$set: {admin_label: true}});
            }
          });
        });
        $(e.currentTarget).html('标注');
        selected.set([]);
        alert('标注完成~');
      });
    });
  }
});

// lazyload
var lazyloadInitTimeout = {'未标注': null, '已标注': null};
var lazyloadInit = function($ul, type){
  lazyloadInitTimeout[type] && Meteor.clearTimeout(lazyloadInitTimeout[type]);
  lazyloadInitTimeout[type] = Meteor.setTimeout(function(){
    $ul.find('img.lazy:not([src])').lazyload({
      container: $ul.parent()
    });
    lazyloadInitTimeout[type] && Meteor.clearTimeout(lazyloadInitTimeout[type]);
  }, 600);
};

Template.groupPhoto.onRendered(function(){
  SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({is_people: true, 'to.id': data.id}, {limit: limitSetp, sort: {create_time: -1}}, limitSetp);

  var data = this.data;
  this.$('.photos').each(function(){
    $(this).scroll(function(){
      var height = $(this).find('> ul').height();
      var top = $(this).scrollTop();
      if ($(this).scrollTop() <= 0){
        var limit = 0;
        if (type.get() === '未标注'){
          limit = limit1.get() + limitSetp;
          limit1.set(limit);
          SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({is_people: true, 'to.id': data.id}, {limit: limit, sort: {create_time: -1}}, limit);
        } else {
          limit = limit2.get() + 100;
          limit2.set(limit);
        }
        console.log('==已经滚动到顶部了 '+type.get()+' ==');
      } else if (height-top <= $(this).height() -20){
        if (type.get() === '未标注')
          limit1.set(limit1.get()+limitSetp);
        else
          limit2.set(limit2.get()+100);
        console.log('==已经滚动到底部了 '+type.get()+' ==');
      }
    });
  });
});

Template.groupPhotoImg.onRendered(function(){
  var $img = this.$('img');
  // console.log($img, $img.parent().parent(), $img.parent().parent().attr('data-type'));
  lazyloadInit($img.parent().parent(), $img.parent().parent().attr('data-type'));
});

Template.groupPhotoImg1.onRendered(function(){
  var $img = this.$('img');
  // console.log($img, $img.parent().parent(), $img.parent().parent().attr('data-type'));
  lazyloadInit($img.parent().parent(), $img.parent().parent().attr('data-type'));
});

Template.groupPhotoImg.helpers({
  has_selected: function(val1, val2){
    var id = val1 + '|' + val2; 
    return selected.get().indexOf(id) >= 0;
  },
  is_type: function(val){
    return type.get() === val;
  }
});

Template.groupPhotoImg.events({
  'click li': function(e, t){
    if (type.get() != '未标注')
      return;

    var id = e.currentTarget.id + '|' + this._id;
    var res = selected.get();
    var index = res.indexOf(id);
    if (index >= 0)
      res.splice(index, 1);
    else
      res.push(id);
    selected.set(res);
    console.log(id);
  }
});

Template.groupPhoto.open = function(id){
  view && Blaze.remove(view);
  type.set('未标注');
  limit1.set(limitSetp);
  limit2.set(100);
  selected.set([]);

  var data = {
    id: id,
    limit: type.get() === '未标注' ? limit1.get() : limit2.get(),
    // list1: SimpleChat.Messages.find({is_people: true, 'to.id': id}, {limit: limit1.get(), sort: {create_time: 1}}),
    // list2: SimpleChat.Messages.find({is_people: true, 'to.id': id}, {limit: limit1.get(), sort: {create_time: 1}}),
    type: type.get()
  };
  view = Blaze.renderWithData(Template.groupPhoto, data, document.body);
  $('body').css('overflow', 'hidden');
  $('.groupsProfile').hide();
};

Template.groupPhoto.close = function(){
  view && Blaze.remove(view);
  view = null;
  $('body').css('overflow', 'auto');
  $('.groupsProfile').show();
};