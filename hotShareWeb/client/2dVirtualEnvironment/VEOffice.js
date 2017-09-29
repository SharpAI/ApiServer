// 自动估算位置(随机)
var calcPosition = function(max_X,min_X, max_Y,min_Y){
  console.log(max_Y)
  console.log(max_X)
  var cL = function(max, min){
    return  Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return {
    left: cL(max_X, min_X),
    bottom: cL(max_Y, min_Y)
  };
}
// 设置相应的缩放， 构建立体感
var calcScale = function(){
  var max = 8;
  var min = 5;
  var scale = Math.floor(Math.random() * (max - min + 1)) + min;
  return parseFloat(scale / 10);
}
Template.VEOffice.onRendered(function () {
  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);

  Session.set('theCurrentDay',date); //UTC日期
  Session.set('today',displayDate); //今天

  var group_id = Router.current().params._id;
  Meteor.subscribe('WorkStatusByGroup',date,group_id,'in');
  Meteor.subscribe('get-group',group_id);

  // 设置相应box的大小
  var cH = window.innerHeight;
  var cW = window.innerWidth;
  var halfHeight = cH / 2;
  var halfWidth = cW / 2;

  $('.cubeBox').css({
    width: cH + 'px',
    height: cH + 'px'
  });

  $('.cube').css({
    width: cH + 'px',
    height: cH + 'px'
  });


  $('#cube-left').css({
    height: halfHeight + 'px',
  });
  $('#cube-right').css({
    height: halfHeight + 'px'
  });

  $('#cube-front').css({
    height: halfHeight + 'px'
  });
  $('#cube-back').css({
    height: halfHeight + 'px'
  });

});

Template.VEOffice.helpers({
  lists: function(){
    var group_id = Router.current().params._id;
    var date = Session.get('theCurrentDay')
    return WorkStatus.find({date: date,group_id: group_id, status:'in'}).fetch();
  },
  calcPosition: function(){
    var max_X = $('body').height(),
        min_X = 0,
        max_Y = $('body').height(),
        min_Y = 0;

        // max_X = 400;
        // max_Y = 400;
    var position = calcPosition(max_X,min_X, max_Y,min_Y);
    var scale = calcScale();
    return 'left:'+ position.left + 'px;bottom:'+ position.bottom + 'px;transform:rotateX(-90deg) rotateY(180deg) scale('+scale+')';
    return 'left:'+ position.left + 'px;bottom:'+ position.bottom + 'px;';
  },
  getPersonImg: function(){
    return this.in_image || this.out_image
  },
  getGroupName: function(){
    var group_id = Router.current().params._id;
    var group = SimpleChat.Groups.findOne({_id: group_id});
    if(group && group.name){
      return group.name;
    }
    return '办公室';
  },
  transSide: function(side){
    var cH = window.innerHeight;
    var cW = window.innerWidth;
    var halfHeight = cH / 2;
    var halfWidth = cW / 2;

    switch (side){
      case 'top':
        return 'transform:rotateX(90deg) translateZ('+halfHeight/2+'px) rotateZ(360deg);';
        break;
      case 'bottom':
        return 'transform: rotateX(90deg) translateZ(-'+halfHeight/2+'px) rotateZ(180deg);';
        break;
      case 'left':
        return 'transform: rotateY(90deg) translateZ(-'+halfHeight+'px) translateY('+halfHeight/2+'px);';
        break;
      case 'right':
        return 'transform: rotateY(90deg) translateZ('+halfHeight+'px) translateY('+halfHeight/2+'px);';
        break;
      case 'front':
        return 'transform:rotateX(0deg) translateZ('+halfHeight+'px) translateY('+halfHeight/2+'px);';
        break;
      case 'back':
        return 'transform:rotateX(0deg) translateZ(-'+halfHeight+'px) rotateZ(180deg) translateY(-'+halfHeight/2+'px);';
        break;
      defalut:
        return '';
    }
  }
});

Template.VEOffice.events({
  // 返回上级页面
  'click .backBtn': function(e){
    return Router.go('/VEWorld');
  },
  // 处理点击时，提高显示层级
  'click .officeItem': function(e){
    $('.officeItem').css('z-index','0').find('.person').removeClass('selected');
    $(e.currentTarget).css('z-index','9').find('.person').addClass('selected');
  }
});