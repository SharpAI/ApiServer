var view = null;
var type = new ReactiveVar('');
var limit1 = new ReactiveVar(0);
var limit2 = new ReactiveVar(0);
var selected = new ReactiveVar([]);

Template.groupPhoto.helpers({
  is_type: function(val){
    return type.get() === val;
  },
  is_hover: function(val){
    return type.get() === val ? 'hover' : '';
  },
  is_selected: function(){
    return selected.get().length > 0 ;
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
              index: i
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
          SimpleChat.Messages.update({_id: task._id}, {$set: $set});
        });
        $(e.currentTarget).html('标注');
        selected.set([]);
        alert('标注完成~');
      });
    });
  }
});

// lazyload
var lazyloadInitTimeout = null;
var lazyloadInit = function(t){
  if (lazyloadInitTimeout)
    Meteor.clearTimeout(lazyloadInitTimeout);
  lazyloadInitTimeout = Meteor.setTimeout(function(){
    t.$('img.lazy:not([src])').lazyload({
      container: t.$('img').parent()
    });
  }, 600);
};

Template.groupPhoto.onRendered(function(){
  this.$('.photos').each(function(){
    $(this).scroll(function(){
      var height = $(this).find('> ul').height();
      var top = $(this).scrollTop();
      if (height-top <= $(this).height() -20){
        if (type.get() === '未标注')
          limit1.set(limit1.get()+20);
        else
          limit2.set(limit2.get()+20);
        console.log('==已经滚动到底部了==');
      }
    });
  });
});

Template.groupPhotoImg.onRendered(function(){
  // lazyloadInit(this);
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
  limit1.set(20);
  limit2.set(20);

  var data = {
    id: id,
    limit: type.get() === '未标注' ? limit1.get() : limit2.get(),
    list1: SimpleChat.Messages.find({is_people: true, 'to.id': id}, {limit: limit1.get(), sort: {create_time: 1}}),
    list2: SimpleChat.Messages.find({is_people: true, 'to.id': id}, {limit: limit1.get(), sort: {create_time: 1}}),
    type: type.get()
  };
  view = Blaze.renderWithData(Template.groupPhoto, data, document.body);
  $('body').css('overflow', 'hidden');
};

Template.groupPhoto.close = function(){
  view && Blaze.remove(view);
  view = null;
  $('body').css('overflow', 'auto');
};