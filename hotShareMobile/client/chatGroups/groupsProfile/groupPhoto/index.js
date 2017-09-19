var view = null;
var dadaset_view = null;
var type = new ReactiveVar('');
var limit1 = new ReactiveVar(0);
var limit2 = new ReactiveVar(0);
var limit3 = new ReactiveVar(0);
var selected = new ReactiveVar([]);
var selected2 = new ReactiveVar([]);
var lebeledPreLists = new ReactiveVar([]);
var limitSetp = 10;

Template.groupPhoto.helpers({
  is_type: function(val){
    return type.get() === val;
  },
  isLoading:function(){
    return Session.get('group_person_loaded') != true;
  },
  is_hover: function(val){
    return type.get() === val ? 'hover' : '';
  },
  is_selected: function(){
    return selected.get().length > 0 ;
  },
  is_selected2: function(){
    return selected2.get().length > 0 ;
  },
  list1: function(id){
    return SimpleChat.Messages.find({is_people: true, 'to.id': id, admin_label: {$ne: true}}, {limit: limit1.get(), sort: {create_time: 1}})
  },
  list2: function(id){
    // return SimpleChat.GroupPhotoLabel.find({group_id: id}, {limit: limit2.get(), sort: {create_time: 1}})
    return Person.find({group_id: id},{limit: limit2.get(), sort:{createAt: -1}}).fetch();
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
    var type = '';
    var call_back_handle = function(nameOrReason){
      if (!nameOrReason) {
        $('.btn-default').show();
        return;
      }

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
                label:img.label,
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
              uuid:msgObj.people_uuid,
              create_time:msgObj.create_time,
              group_id: t.data.id
            });
          }
        });
      });

      console.log('nameOrReason:', nameOrReason, 'labels:', wait_labels);
      console.log('local task:', localTask);

      Meteor.call('upLabels', t.data.id, nameOrReason, wait_labels,type, function(err, res){
        var flag = type === 'label' ? '标注' : '删除';
        if (err || !res){
          $(e.currentTarget).html(flag);
          $('.btn-default').show();
          return alert(flag + '失败~');
        }

        localTask.map(function(task){
          var $set = JSON.parse('{"images.'+task.index+'.admin_label": true}');
          console.log('update local db:', $set, 'id:', task._id);
          SimpleChat.Messages.update({_id: task._id}, {$set: $set}, function(err, num){
            if (err || num <= 0)
              return;
            var flag_label = type === 'label' ? nameOrReason : '已删';
            var is_delete = type === 'label' ? false : true;
            // 生成群相册的标注信息（一张照片一条）
            SimpleChat.GroupPhotoLabel.insert({
              msg_id: task._id,
              img__id: task.obj._id,
              img_id: task.obj.id,
              img_uuid: task.uuid,
              img_type: task.obj.img_type,
              img_style: task.obj.style,
              img_sqlid: task.obj.sqlid,
              img_index: task.index,
              img_label: flag_label,
              img_url: task.obj.url,
              is_delete:is_delete,
              group_id: task.group_id,
              create_time: new Date()
            });
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
            if (is_delete) {
              return;
            }
            try {
              if(task.obj.img_type && task.obj.img_type == 'face') {
                var person_info = {
                  //'id': res[updateObj.images[i].label].faceId,
                  'uuid': task.uuid,
                  'name': nameOrReason,
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

          });
        });
        $(e.currentTarget).html(flag);
        $('.btn-default').show();
        selected.set([]);
        alert(flag+'完成~');
        loadMoreImg();
      });

    };
    if (e.currentTarget.id == 'not-label-del'){
      type = 'delete';
      $('.label-btn').hide();
      SimpleChat.show_remove(call_back_handle);
      return;
    }
    if (e.currentTarget.id == 'not-label-label') {
      type = 'label';
      $('.del-btn').hide();
      SimpleChat.show_label(t.data.id, call_back_handle);
      return;
    }

    if (e.currentTarget.id == 'labeled-label'){
      console.log('a is not b');
      var lists = lebeledPreLists.get();
      console.log(lists);
      // To DO
      return;
    }
    if (e.currentTarget.id == 'labeled-del') {
      console.log('is not a');
      var lists = lebeledPreLists.get();
      console.log(lists);
      // 从person 表中删除相应face
      Meteor.call('remove-person-face',lists, function(err, res){
        if(err){
          console.log('groupPhoto labeled del Err:'+err);
          return PUB.toast('删除失败，请重试!');
        }
        for(var i=0; i < lists.length; i++) {
          // 告诉平板， 这不是a
          var trainsetObj = {
            group_id: lists[i].group_id,
            type: 'trainset',
            url: lists[i].face_url,
            person_id: '',
            device_id: lists[i].device_id,
            face_id: lists[i].face_id,
            drop: true,
            img_type: 'face',
            style:'front',
            sqlid: 0
          }
          console.log('groupPhoto labeled del trainsetObj='+JSON.stringify(trainsetObj));
          sendMqttMessage('/device/'+lists[i].group_id, trainsetObj);
          try{
            $('#'+lists[i].face_id).remove();
          } catch (err){}
        };
        selected2.set([]);
        lebeledPreLists.set([]);
      });
      return;
    }
  }
});


var loadMoreImg = function(){
  var img_item_count = $('.wait-label-item').length;
  if (img_item_count >= 20) {
    return;
  }
  limit = limit1.get() + limitSetp;
  limit1.set(limit);
  SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({is_people: true, 'to.id': data.id,admin_label: {$ne: true}}, {limit: limit, sort: {create_time: -1}}, limit);
}

// lazyload
var lazyloadInitTimeout = {'未标注': null, '已标注': null,'labelDataset':null};
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
  var group_id = Router.current().params._id;
  Meteor.subscribe('group_person',group_id, limit2.get(),{
    onReady: function(){
      Session.set('group_person_loaded',true);
    },
    onStop: function(err){
      console.log(err);
    }
  });
  var data = this.data;
  SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({is_people: true, 'to.id': data.id,admin_label: {$ne: true}}, {limit: limitSetp, sort: {create_time: -1}}, limitSetp);

  this.$('.photos').each(function(){
    $(this).scroll(function(){
      var height = $(this).find('> ul').height();
      var top = $(this).scrollTop();
      if ($(this).scrollTop() <= 0){
        var limit = 0;
        if (type.get() === '未标注'){
          limit = limit1.get() + limitSetp;
          limit1.set(limit);
          SimpleChat.withMessageHisEnable && SimpleChat.loadMoreMesage({is_people: true, 'to.id': data.id,admin_label: {$ne: true}}, {limit: limit, sort: {create_time: -1}}, limit);
        } else {
          limit = limit2.get() + 50;
          limit2.set(limit);
          Meteor.subscribe('group_person',group_id, limit2.get());
        }
        console.log('==已经滚动到顶部了 '+type.get()+' ==');
      } else if (height-top <= $(this).height() -20){
        if (type.get() === '未标注')
          limit1.set(limit1.get()+limitSetp);
        else
          limit2.set(limit2.get()+50);
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
  limit2.set(50);
  selected.set([]);

  var data = {
    id: id,
    limit: type.get() === '未标注' ? limit1.get() : limit2.get(),
    // list1: SimpleChat.Messages.find({is_people: true, 'to.id': id}, {limit: limit1.get(), sort: {create_time: 1}}),
    // list2: SimpleChat.Messages.find({is_people: true, 'to.id': id}, {limit: limit1.get(), sort: {create_time: 1}}),
    type: type.get()
  };
  Session.set('group_person_loaded',false);
  view = Blaze.renderWithData(Template.groupPhoto, data, document.body);
  $('body').css('overflow', 'hidden');
  $('.groupsProfile').hide();
};

Template.groupPhoto.close = function(){
  // 释放变量
  limit1.set(0);
  limit2.set(0);
  selected.set([]);
  selected2.set([]);
  lebeledPreLists.set([]);
  
  view && Blaze.remove(view);
  view = null;
  $('body').css('overflow', 'auto');
  $('.groupsProfile').show();
};


// Template.groupPhotoImg1.helpers({
//   has_selected: function(id){
//     return selected2.get().indexOf(id) >= 0;
//   },
// });

Template.groupPhotoImg1.events({
  'click li': function(e){
    var name = this.name;
    var group_id = this.group_id;
    return Template.person_labelDataset.open(group_id,name);
    /*var id = this.id;
    var res = selected2.get();
    var index = res.indexOf(id);
    var lists = lebeledPreLists.get();
    if(index >= 0){
      res.splice(index, 1);
      lists.splice(index,1);
    } else {
      res.push(id);
      lists.push({
        face_id: this.id,
        face_url: this.url,
        group_id: $(e.currentTarget).data('gid'),
        device_id: $(e.currentTarget).data('did'),
        faceId: $(e.currentTarget).data('fid'),
        name: $(e.currentTarget).data('name')
      });
    }
    console.log(res);
    console.log(lists);
    selected2.set(res);
    lebeledPreLists.set(lists);*/
  }
})

Template.labelDatasetImg.onRendered(function(){
  var $img = this.$('img');
  // console.log($img, $img.parent().parent(), $img.parent().parent().attr('data-type'));
  lazyloadInit($img.parent().parent(), $img.parent().parent().attr('data-type'));
});

Template.labelDatasetImg.helpers({
  has_selected: function(id){
    return selected2.get().indexOf(id) >= 0;
  },
});

Template.labelDatasetImg.events({
  'click li': function(e){
    var id = this._id;
    var res = selected2.get();
    var index = res.indexOf(id);
    var lists = lebeledPreLists.get();
    if(index >= 0){
      res.splice(index, 1);
      lists.splice(index,1);
    } else {
      res.push(id);
      lists.push({
        face_id: this.id,
        face_url: this.url,
        group_id: $(e.currentTarget).data('gid'),
        device_id: $(e.currentTarget).data('did'),
        faceId: $(e.currentTarget).data('fid'),
        name: $(e.currentTarget).data('name')
      });
    }
    console.log(res);
    console.log(lists);
    selected2.set(res);
    lebeledPreLists.set(lists);
  }
});

Template.person_labelDataset.open = function(group_id,name){
  dadaset_view && Blaze.remove(dadaset_view);
  limit3.set(50);
  selected2.set([]);

  var data = {
    group_id: group_id,
    name:name,
    limit: limit3.get(),
  };
  Session.set('lableDadaSetLoaded',false);
  dadaset_view = Blaze.renderWithData(Template.person_labelDataset, data, document.body);
};

Template.person_labelDataset.close = function(){
    // 释放变量
  limit3.set(0);
  selected2.set([]);
  lebeledPreLists.set([]);
  
  dadaset_view && Blaze.remove(dadaset_view);
  dadaset_view = null;
};

Template.person_labelDataset.onRendered(function(){
  var data = this.data;
  var group_id = data && data.group_id ;
  Meteor.subscribe('person_labelDataset',group_id,data.name, limit3.get(),{
    onReady: function(){
      Session.set('lableDadaSetLoaded',true);
    },
    onStop: function(err){
      console.log(err);
    }
  });
  $('.photos').scroll(function(){
    var height = $(this).find('> ul').height();
    var top = $(this).scrollTop();
    if (height-top <= $(this).height() -20){
      var limit = limit3.get() + 50;
      limit3.set(limit);
      Meteor.subscribe('person_labelDataset',group_id,data.name, limit3.get());
    }
  });
});

Template.person_labelDataset.helpers({
  list:function(){
    return LableDadaSet.find({group_id: this.group_id,name:this.name},{limit: limit3.get(), sort:{createAt: -1}}).fetch();
  },
  is_selected2:function(){
    return selected2.get().length > 0 ;
  },
  isLoading:function(){
    return Session.get('lableDadaSetLoaded') != true;
  }
});

Template.person_labelDataset.events({
  'click .back': function(){
    Template.person_labelDataset.close();
  },
  'click .btn-default': function(e, t){
    if (e.currentTarget.id == 'labeled-del') {
      console.log('is not a');
      var lists = lebeledPreLists.get();
      console.log(lists);
      // 从person 表中删除相应face
      Meteor.call('remove-person-face',lists, function(err, res){
        if(err){
          console.log('groupPhoto labeled del Err:'+err);
          return PUB.toast('删除失败，请重试!');
        }
        for(var i=0; i < lists.length; i++) {
          // 告诉平板， 这不是a
          var trainsetObj = {
            group_id: lists[i].group_id,
            type: 'trainset',
            url: lists[i].face_url,
            person_id: '',
            device_id: lists[i].device_id,
            face_id: lists[i].face_id,
            drop: true,
            img_type: 'face',
            style:'front',
            sqlid: 0
          }
          console.log('groupPhoto labeled del trainsetObj='+JSON.stringify(trainsetObj));
          sendMqttMessage('/device/'+lists[i].group_id, trainsetObj);
          try{
            $('#'+lists[i].face_id).remove();
          } catch (err){}
        };
        selected2.set([]);
        lebeledPreLists.set([]);
      });
      return;
    }
  }
});





