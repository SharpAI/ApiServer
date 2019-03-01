var view = null;
var dadaset_view = null;
var limit = new ReactiveVar(0);

Template.groupPerson.helpers({
  is_type: function(val){
    return type.get() === val;
  },
  isLoading:function(){
    return Session.get('group_person_loaded') != true;
  },
  list: function(id){
    var arrEnglish = [];
    var arrPinyin = [];
    var group_id = Router.current().params._id;
    /*
    Person.find(selector, {sort: {name: 1}, limit: label_limit.get()}).forEach(function(item){
        arrEnglish.push(item);
    });
    */
    
    Person.find({group_id: group_id},{limit: limit.get(), sort:{name: 1}}).forEach(function(item){
        if(Session.get('is_human_shape') && !!item.human_shape){
          arrEnglish.push(item);
        }else if(!Session.get('is_human_shape') && !!item.faces){
          arrEnglish.push(item);
        }
    });
    
    /*
    Person.find({group_id: group_id},{limit: limit.get(), sort:{createAt: -1}}).forEach(function(item){
      if(item.name && item.name.charCodeAt(0) > 255){
        item.pinyin = makePy(item.name)[0];
        arrPinyin.push(item);
      } else {
        arrEnglish.push(item);
      }
    });
    var compare = function (prop) {
        return function (obj1, obj2) {
            var val1 = obj1[prop];
            var val2 = obj2[prop];
            // 移除首尾空格
            val1 = val1.replace(/(^\s*)|(\s*$)/g, ""); 
            val2 = val2.replace(/(^\s*)|(\s*$)/g, ""); 
            // 统一英文字符为大写
            val1 = val1.toLocaleUpperCase();
            val2 = val2.toLocaleUpperCase();
            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }            
        } 
    }
    arrEnglish = arrEnglish.sort(compare("name"));
    arrPinyin = arrPinyin.sort(compare("pinyin"));
    arrEnglish = arrEnglish.concat(arrPinyin);
    */
    
    return arrEnglish;
  },
  is_human_shape:function(){
    return Session.get('is_human_shape');
  }
});

Template.groupPerson.events({
  'click .back': function(){
    limit.set(0);
    return PUB.back();
  },
  'click .human_bth': function(){
    Session.set('is_human_shape', true);
  },
  'click .face_bth': function(){
    Session.set('is_human_shape', false);
  }
});

Template.groupPerson.onRendered(function(){
  var group_id = Router.current().params._id;

  Meteor.subscribe('device_by_groupId',group_id);

  Meteor.subscribe('group_person',group_id, limit.get(),{
    onReady: function(){
      Session.set('group_person_loaded',true);
    },
    onStop: function(err){
      console.log(err);
    }
  });
  this.$('.photos').each(function(){
    $(this).scroll(function(){
      var height = $(this).find('> ul').height();
      var top = $(this).scrollTop();

      if ($(this).scrollTop() <= 0){
        var _limit = 0;
        _limit = limit.get() + 20;
        limit.set(_limit);
        //Meteor.subscribe('group_person',group_id, limit.get());
        console.log('==已经滚动到顶部了 ==');
      } else if (height - top <= $(this).height() - 20){
        limit.set(limit.get()+20);
        console.log('==已经滚动到底部了 ==');
        Meteor.subscribe('group_person',group_id, limit.get());
      }
    });
  });

  // disable img longpress default events
  //this blocks android's image click event, disable it on android
  if (device.platform != 'Android') {
    $(document).on('touchstart','img', function(e){
      e.stopPropagation();
      e.preventDefault();
    }); 
  }
});
