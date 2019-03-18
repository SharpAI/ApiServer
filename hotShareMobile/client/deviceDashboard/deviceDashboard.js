var date = new ReactiveVar(null);
var today         = new ReactiveVar(null);
var time_offset = new ReactiveVar(8);

var lists         = new ReactiveVar([]);
var isOut        = new ReactiveVar(false);
var limit = new ReactiveVar(200);
var ckeckInNames = new ReactiveVar([]);
var theCurrentDay = new ReactiveVar(null);
var theDisplayDay = new ReactiveVar(null);
var popObj = new ReactiveVar({});
var isLoading = new ReactiveVar(false);
var dateList = new ReactiveVar([]);
var curTime = new ReactiveVar(null);
 //前7天加入dateList
var _dateList = [];
for(var i=7;i>-2;i--){
   var t = moment().subtract(i, 'day');
   var weekStr = t.format('ddd');
   var d = t.format('MM/DD');
   var utc = Date.UTC(t.year(),t.month(),t.date(),0,0,0,0);
   _dateList.push({
     week:weekStr,
     date:d,
     utc:utc,
     id:(7-i)+'date'
   })
 }
 dateList.set(_dateList);
 curTime.set(dateList.get()[7]);
var parseDate = function(currentDay){
  //var today = new Date(Session.get('today'));
  var year = currentDay.getFullYear();
  var month = currentDay.getMonth() + 1;
  var date = year + '-' + month + '-' +currentDay.getDate();
  // if (currentDay.getDate() === today.getDate()) {
  //   date = date + ' 今天';
  // }
  // else if (currentDay.getDate() - today.getDate() === -1 ) {
  //   date = date + ' 昨天';
  // }
  //else {
    var day = '';
    switch(currentDay.getDay())
    {
    case 0:
      day = '周日';
      break;
    case 1:
      day = '周一';
      break;
    case 2:
      day = '周二';
      break;
    case 3:
      day = '周三';
      break;
    case 4:
      day = '周四';
      break;
    case 5:
      day = '周五';
      break;
    case 6:
      day = '周六';
      break;
    default:
      break;
    }
    date = date + ' ' +day;
  //}
  return date;
};
Template.deviceDashboard.onRendered(function () {
  var group_id = Router.current().params.group_id;
  isOut.set(false);
  isLoading.set(true);
  var now = new Date();
  var swiper = new Swiper('#slideDate',{
    slidesPerView :'auto',
    resistanceRatio : 0,
    onInit: function(s){
      //Swiper初始化了
    },
    onClick: function(s){
      var index = s.clickedIndex;
      var _curTime = dateList.get()[index];
      isLoading.set(true);
      Meteor.subscribe('WorkStatusByGroup',_curTime.utc, group_id,{
        onReady:function(){
         isLoading.set(false);
       }
      });
      // alert(s.clickedIndex);
      $('#'+curTime.get().id).removeClass('selected');
      curTime.set(_curTime);
      $('#'+_curTime.id).addClass('selected');
      $('#'+_curTime.id).find(".week_whet").addClass('back_bottom');
    }
  });
  swiper.slideTo(7,0,false);
  curTime.set(dateList.get()[7]);
  $('#'+curTime.get().id).addClass('selected');
  $('#'+curTime.get().id).find(".week_whet").addClass('back_bottom');
  var _today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var _date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,
      0, 0, 0, 0);
  date.set(_date); //UTC日期
  today.set(_today);
  theDisplayDay.set(_today); // 当前显示日期
  theCurrentDay.set(_date); // UTC日期

  Meteor.subscribe('device_by_groupId', group_id);

  Meteor.subscribe('get-group', group_id,{
    onReady: function(){
      var _group = SimpleChat.Groups.findOne({_id: group_id});
      if(_group && _group.offsetTimeZone){
        time_offset.set(_group.offsetTimeZone);
      }
    }
  });
  Meteor.subscribe('WorkStatusByGroup',curTime.get().utc, group_id,{
     onReady:function(){
      isLoading.set(false);
      var checkin_names = ckeckInNames.get();
      WorkStatus.find({group_id: group_id, date: curTime.get().utc}).forEach(function(item) {
        if(!item.in_time && !item.out_time) {
          checkin_names.push(item.person_name);
        }
      });

      ckeckInNames.set(checkin_names);
    }
  });

  Meteor.subscribe('group_person',group_id, limit.get(),{
    onReady: function(){
      Session.set('group_person_loaded',true);
    },
    onStop: function(err){
      console.log(err);
    }
  });
  
});

Template.deviceDashboard.helpers({
  dateList:function(){
    return dateList.get();
  },
  showHint:function(){
    return Session.get('showHint');
  },
  has_day_before:function(group_id){
    var lastday =  today.get() - 7 * 24 * 60 * 60 *1000; //7天前
    return theDisplayDay.get() > lastday;
  },
  day_title:function(){
    var currentDay = new Date(theDisplayDay.get());
    return parseDate(currentDay);
  },
  has_day_after:function(group_id){
    // 可以查看后面两天天数据
    var _today = new Date(today.get());
    _today.setDate(_today.getDate() + 2);
    _today = new Date(_today.getFullYear(), _today.getMonth(), _today.getDate()).getTime();
    return theDisplayDay.get() < _today;
  },
  isLoading: function() {
    return isLoading.get();
  },
  checkInLists: function() {
    // var now = new Date();
    // var _today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    // var _date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,
    //     0, 0, 0, 0);

    var group_id = Router.current().params.group_id;

    // date.set(_date); //UTC日期
    // today.set(_today);

    var frList =[];
    //查询今日出现的人 并且存在frList数组中
    WorkStatus.find({group_id: group_id, date:curTime.get().utc}).forEach(function(item){
      if (item.in_time || item.out_time) {
        frList.push(item);
      }
    })
    //查找重复出现的人并且删除此人
    WorkStatus.find({group_id: group_id, date:curTime.get().utc}).forEach( function (item,index) {
      if (item.in_time || item.out_time) {
        for (var i = index + 1; i < frList.length; i++) {
          if(item.person_name && item.person_name == frList[i].person_name){
            //删除重复出现的人
            frList.splice(i,1)
          }
        }
      }
    });
    return frList;
  },
  zeroLists: function() {
    if (isOut.get()) {
      lists = Template.deviceDashboard.__helpers.get('unCkeckLists').call();
    }
    else {
      lists = Template.deviceDashboard.__helpers.get('checkInLists').call();
    }
    return lists.length == 0;
  },
  unCkeckLists: function() {
    // var now = new Date();
    // var _today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    // var _date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,
    //     0, 0, 0, 0);

    var group_id = Router.current().params.group_id;

    var lists = [];
    WorkStatus.find({group_id: group_id, date:curTime.get().utc}).forEach( function (item) {
      if (item.in_time || item.out_time) {
        lists.push(item.person_name);
      }
    });

    return Person.find({group_id: group_id, name: {$nin: lists}},{limit: limit.get(), sort:{createAt: -1}}).fetch();
  },
  groupName: function(){
    return Session.get('deviceDashboardTitle');
  },
  isOut: function(){
    return isOut.get();
  },
  getCheckInImage: function() {
    if(this.in_time && this.in_image) {
      return this.in_image;
    }
    if(this.out_time && this.out_image) {
      return this.out_image;
    }
  },
  getTime: function(){
    var ts = null;
    if(this.in_time) {
      ts = this.in_time;
    }
    else if(this.out_time) {
      ts = this.out_time;
    }

    if(!ts || ts == null || ts == 0){
      return '-/-';
    }

    // var time = new Date(ts);
    // return time.shortTime(time_offset.get());
    return moment(ts).utcOffset(time_offset.get()).format('ahh:mm');
  }
});

Template.deviceDashboard.events({
  'click #goHint':function(e,t){
    Session.set('notice-from','deviceDashboard');
    Session.set('showHint',true);
  },
  'click .leftButton': function(){
    return PUB.back();
  },
  // 'click .rightButton': function(){
  //   if(isOut.get()){
  //     isOut.set(false);
  //   } else {
  //     isOut.set(true);
  //   }
  // },
  'click .SignNo': function(){
    isOut.set(true);
    $(".SignNo").css({"color":"#39A8FE","background":"#ffffff"})
    $(".SignYes").css({"color":"#ffffff","background":"#148CE9"})
  },
  'click .SignYes':function(){
    isOut.set(false);
    $(".SignNo").css({"color":"#ffffff","background":"#148CE9"})
    $(".SignYes").css({"color":"#39A8FE","background":"#ffffff"})
  },
  'click .popItem': function(e) {
    popObj.set(this);
    $('.deviceDashPoppage').fadeIn();
  },
  // goNextDay
  'click .nextDay': function(e) {
    e.stopImmediatePropagation();
    var currentDay = theCurrentDay.get() + 24 * 60 * 60 * 1000;
    theCurrentDay.set(currentDay);

    var displayDay = theDisplayDay.get() + 24 * 60 * 60 * 1000;
    theDisplayDay.set(displayDay);
    var group_id = Router.current().params.group_id;
    isLoading.set(true);
    Meteor.subscribe('WorkStatusByGroup',theCurrentDay.get(), group_id,{
      onReady:function(){
       isLoading.set(false);
     }
    });
  },
  // goPrevDay
  'click .prevDay': function(e) {
    e.stopImmediatePropagation();
    var currentDay = theCurrentDay.get() - 24 * 60 * 60 * 1000;
    theCurrentDay.set(currentDay);

    var displayDay = theDisplayDay.get() - 24 * 60 * 60 * 1000;
    theDisplayDay.set(displayDay);
    var group_id = Router.current().params.group_id;
    isLoading.set(true);
    Meteor.subscribe('WorkStatusByGroup',theCurrentDay.get(), group_id,{
      onReady:function(){
       isLoading.set(false);
     }
    });
  },
});

Template.deviceDashPoppage.helpers({
  showFollowButton: function (){
    return withFollowFeature;
  },
  isFollowing: function(){
    if(Meteor.userId() && popObj && popObj.get() && popObj.get().person_id[0].id ){
      var followDoc = NotificationFollowList.findOne({_id: Meteor.userId()})
      return followDoc && followDoc.hasOwnProperty(popObj.get().person_id[0].id)
    } else {
      return false;
    }
  },
  data: function() {
    var obj = popObj.get();
    var url = obj.in_image?obj.in_image:obj.out_image;

    var diff = 0;
    var out_time = obj.out_time;
    if (!obj.out_time) {
      var now_time = Date.now();
      out_time = now_time;
    }

    if (obj.in_time && out_time){
      diff = out_time - obj.in_time;
    }

    if(diff > 24*60*60*1000){
      diff = 24*60*60*1000;
    } else if(diff < 0) {
      diff = 0;
    }

    var min = diff / 1000 / 60 ;
    var in_company_tlen = Math.floor(min/60)+' h '+Math.floor(min%60) + ' min';
    if(min < 60){
      in_company_tlen = Math.floor(min%60) + ' min';
    }
    if(diff == 0){
      in_company_tlen = '0 min';
    }
    var person_id = obj.person_id[0].id;

    return {
      _id: obj._id,
      url: url,
      person_id: person_id,
      name: obj.person_name,
      in_company_tlen: in_company_tlen,
      // in_time: obj.in_time? (new Date(obj.in_time)).shortTime(time_offset.get()): null,
      // out_time: obj.out_time? (new Date(obj.out_time)).shortTime(time_offset.get()): null
      in_time: obj.in_time? (moment(obj.in_time).utcOffset(time_offset.get()).format('ahh:mm')): null,
      out_time: obj.out_time? (moment(obj.out_time).utcOffset(time_offset.get()).format('ahh:mm')): null
    }
  }
});

Template.deviceDashPoppage.events({
  'click .follow': function(e){
    //var id = popObj.get()._id;
    //NotificationFollowList.update({user_id:Meteor.userId()},{ $set: {id: 1} },{upsert:true,multi,false})
    var isFollowing = e.target.dataset.following
    var userId = e.target.dataset.userid

    if(userId && Meteor.userId()){
      var hasFollowingList = NotificationFollowList.findOne({_id:Meteor.userId()})
      if(hasFollowingList){
        var field = {}
        field[userId] = 1
        if(isFollowing){
          NotificationFollowList.update({_id:Meteor.userId()},{ $unset: field })
        } else {
          NotificationFollowList.update({_id:Meteor.userId()},{ $set: field })
        }
      } else {
        if(isFollowing){
        } else {
          var doc = {
            _id:Meteor.userId()
          }
          doc[userId] = 1
          NotificationFollowList.insert(doc)
        }
      }
    }
    e.stopImmediatePropagation();
  },
  'click .deviceDashPoppage, click #closeDDPop': function (e) {
    return $('.deviceDashPoppage').fadeOut();
  },
  'click .resetWorkStatus': function (e) {
    e.stopImmediatePropagation();
      // PUB.confirm('是否要移除该成员当前出现信息？请确认！', function() {
      //   var obj = popObj.get();
      //   var personId = obj.person_id[0].id;

    //   Meteor.call('resetMemberWorkStatus',e.currentTarget.id, personId, function(error, result) {
    //     if (error) {
    //       return PUB.toast('请重试~');
    //     }
    //     $('.deviceDashPoppage').fadeOut();
    //     return PUB.toast('已移除');
    //   });
    // });
    var obj = popObj.get();
    var personId = obj.person_id[0].id;
    var group_id = obj.group_id;
    var url = obj.in_image?obj.in_image:obj.out_image;
    var uuid = obj.in_uuid?obj.in_uuid:obj.out_uuid;
    //直接转到标识人页面
    // Session.set('channel','device/dashboard/'+group_id);
    // Router.page('');
    //2.删除出现记录
    Meteor.call('resetMemberWorkStatus', e.currentTarget.id, personId, function (error, result) {
      if (error) {
        return PUB.toast('请重试~');
      }
      $('.deviceDashPoppage').fadeOut();

      // return PUB.toast('已移除');
      SimpleChat.show_label(group_id, url, function (name) {
        //1.将照片添加到name的训练集
        if (!name) {
          return;
        }
        // PUB.showWaitLoading('处理中');
        var setNames = [];
        Meteor.call('get-id-by-name1', uuid, name, group_id, function (err, res) {
          if (err || !res) {
            return PUB.toast('标注失败，请重试~');
          }
          var faceId = null;
          if (res && res.faceId) {
            faceId = res.faceId;
          } else {
            faceId = new Mongo.ObjectID()._str;
          }
          // 发送消息给平板
          var trainsetObj = {
            group_id: group_id,
            type: 'trainset',
            url: url,
            person_id: personId,
            device_id: uuid,
            face_id: faceId,
            drop: false,
            img_type: 'face',
            // style:item.style,
            // sqlid:item.sqlid
          };
          sendMqttMessage('/device/' + group_id, trainsetObj);

          setNames.push({
            uuid: uuid,
            id: faceId, //item.person_id,
            url: url,
            name: name,
          });

          if (setNames.length > 0) {
            Meteor.call('add-label-dataset', group_id, setNames);
          }
          // PUB.hideWaitLoading();
        })
      })
    });
  },
  'click .changeWorkStatus': function (e) {
    e.stopImmediatePropagation();
    var obj = popObj.get();
    var group_id = obj.group_id;
    var personId = obj.person_id[0].id;
    var url;
    var uuid;
    var ts = obj.in_time;
    var checkin_time;
    var checkout_time;
    if(obj.in_image&&obj.in_time){
      url = obj.in_image;
      checkin_time = obj.in_time;
      uuid = Devices.findOne({groupId:group_id,in_out:{$in: ['in', 'inout']}}).uuid;
    }else{
      url = obj.out_image;
      checkout_time = obj.out_time;
      uuid = Devices.findOne({groupId:group_id,in_out:{$in: ['out', 'inout']}}).uuid;
    }
    Meteor.call('get-guest-name',group_id,function(err,guest){
      Session.set('default-label-name',guest);
      changeLogic();
    })
    var changeLogic = function () {
      //修改:1.删除出现记录 2.加入训练集
      //屏蔽返回按钮
      // Session.set('no-back', true);
      SimpleChat.show_label(group_id, url, function (name) {
        Session.set('default-label-name', '');
        if (!name || name == '') {
          return;
        }
        // PUB.confirm('修改当前出现信息，并将它加入到' + name + '的训练集?', function () {
        Meteor.call('resetMemberWorkStatus', e.currentTarget.id, personId, function (error, result) {
          if (error) {
            return PUB.toast('请重试~');
          }
          $('.deviceDashPoppage').fadeOut();
          var setNames = [];
          Meteor.call('get-id-by-name1', uuid, name, group_id, function (err, res) {
            if (err || !res) {
              return PUB.toast('标注失败，请重试~');
            }
            var faceId = null;
            if (res && res.faceId) {
              faceId = res.faceId;
            } else {
              faceId = new Mongo.ObjectID()._str;
            }
            // 发送消息给平板
            var trainsetObj = {
              group_id: group_id,
              type: 'trainset',
              url: url,
              person_id: faceId,
              device_id: uuid,
              face_id: faceId,
              drop: false,
              img_type: 'face',
              // style:item.style,
              // sqlid:item.sqlid
            };
            sendMqttMessage('/device/' + group_id, trainsetObj);

            setNames.push({
              uuid: uuid,
              id: faceId, //item.person_id,
              url: url,
              name: name,
            });

            if (setNames.length > 0) {
              Meteor.call('set-person-names', group_id, setNames);
            }
            var person_info = {
              'uuid': uuid,
              'name': name,
              'group_id': group_id,
              'img_url': url,
              'type': 'face',
              'ts': ts,
              // 'accuracy': item.accuracy,
              // 'fuzziness': item.fuzziness,
              // 'sqlid':item.sqlid,
              // 'style':item.style
            };
            var data = {
              face_id: faceId,
              checkin_time: checkin_time,
              checkout_time: checkout_time,
              person_info: person_info,
              formLabel: true
            };

            Meteor.call('ai-checkin-out', data, function (err, res) { });
            //重新训练
            retrain(group_id);
          });
        })
      });
    }

  }
});
