var mergedExtendLists = new ReactiveVar([]);
var isMultiSelect = new ReactiveVar(false);
var multiSelectIds = new ReactiveVar([]);
var multiSelectLists = new ReactiveVar([]);

var timeRange = new ReactiveVar([]);

var limit = new ReactiveVar(5);

var initTimeRangeSet = function() {
  var now = new Date();
  $('#timeRange').mobiscroll().range({
    defaultVaule: [new Date(),new Date()],
    theme: 'material',
    lang: 'zh',
    display: 'bottom',
    controls: ['calendar', 'time'],
    maxWidth: 100,
    setText: '设置',
    fromText: '开始时间',
    toText:'结束时间',
    defaultValue: [
        new Date(now.getFullYear(),now.getMonth(), now.getDate() - 7),new Date()
    ],
    onSet: function(value, inst){
      var val = value.valueText;

      var vals = val.split(' - ');
      var startArr =  new Date(vals[0]);
      var endArr = new Date(vals[1]);
      var range = timeRange.get();
      range[0] = new Date(startArr.getFullYear(),startArr.getMonth(), startArr.getDate(),startArr.getHours(),0,0,0);
      range[1] = new Date(endArr.getFullYear(),endArr.getMonth(), endArr.getDate(),endArr.getHours(),0,0,0);

      timeRange.set(range);
      // reset limit
      limit.set(5);
      // go back to top
      $('.content').scrollTop(0);

      var uuid = Router.current().params._uuid;
      var selector = getSelector();
      Session.set('timelineAlbumLoading',true);
      Meteor.subscribe('device-timeline2',uuid,selector,limit.get(),function(){
        Session.set('timelineAlbumLoading',false);
        lazyTimelineImg();
      });
    }
  });
};

// timelineAlbum 查询条件生成
var getSelector = function() {
  var uuid = Router.current().params._uuid;
  var device = Devices.findOne({uuid: uuid});
  
  var hour = Session.get('wantModifyTime');
  var range = timeRange.get();

  var selector = {
    uuid: uuid
  };

  if(device && device.groupId){
    selector['group_id'] = device.groupId;
  }

  if( hour ) {
    range[1] = hour;
  }

  if(range[0]) {
    selector['hour'] = selector['hour'] || {};
    selector['hour']['$gte'] = range[0]
  }

  if(range[1]) {
    selector['hour'] = selector['hour'] || {};
    selector['hour']['$lte'] = range[1]
  }

  return selector;
};

function LazyImg(option){
  this.settings = option || {};
  this.settings.selector = '.lazy';
  
  this.settings.src = 'data-original';
  this.settings.threshold = 100;
  this.container = this.settings.container || document.body;
  this.images = document.querySelectorAll(this.settings.selector);
  this.lazyedImages = document.querySelectorAll('.lazyed');
};

LazyImg.prototype.init = function() {
  var seeHeight = this.container.clientHeight + this.settings.threshold; // 可见区域高度
  var self = this;
  [].forEach.call(self.images,function(img){
    var src = img.getAttribute(self.settings.src);
    var rect = img.getBoundingClientRect()
    // console.log(rect.top + rect.height)
    // console.log(seeHeight)
    if( (rect.top + rect.height) > 0 && (rect.top + rect.height) < seeHeight){ // 处理在可见区域内的图片
      if("img" === img.tagName.toLowerCase()){
        img.src = src;
        img.className = 'lazyed';
      }
    }
  });
  // 处理data-original 和 src不一致的情况

  [].forEach.call(self.lazyedImages,function(img){
    var original = img.getAttribute(self.settings.src);
    var src = img.getAttribute('src');
    if(original !== src){
      img.src = original;
    }
  });
};

window.lazyTimelineImgTimeout = null;
var lazyTimelineImg = function(){
  if(lazyTimelineImgTimeout){
    window.clearTimeout(lazyTimelineImgTimeout)
  }
  lazyTimelineImgTimeout = window.setTimeout(function(){
    console.log('lazyTimelineImg call')
    // $("img.lazy").lazyload({
    //   threshold : 100
    // });
    // $('img.lazy').load(function() {
    //   console.log($(this).attr('src') + ' loaded');
    //   var self = $(this);
    //   if(self.attr('data-original') == self.attr('src')){
    //     self.addClass('img-loaded').removeClass('lazy');
    //   }
    // });
    lazyImg = new LazyImg(document.querySelector('.content'))
    lazyImg.init();
  },600);
}

var checkInOutWithOutName = function(type,name,taId,taName){
  var data = Session.get('setPicturePersonNameData');
  data.person_info.name = name;
  var taId = taId || Router.current().params.query.taId;
  var msgObj;
  if(taId){
    data.user_id = taId;
    if (taId !== Meteor.userId()) {
      var deviceUser = Meteor.users.findOne({username: Router.current().params._uuid});
      var taUser = Meteor.users.findOne({_id: taId});
      var person_info = data.person_info;
      var time_offset = 8;
      var group = SimpleChat.Groups.findOne({_id: person_info.group_id});
      console.log(group);
      if (group && group.offsetTimeZone) {
        time_offset = group.offsetTimeZone;
      }
      msgObj = {
        _id: new Mongo.ObjectID()._str,
        form:{
          id: deviceUser._id,
          name: deviceUser.profile.fullname,
          icon: deviceUser.profile.icon
        },
        to: {
          id: taId,
          name: taName,
          icon: taUser ? taUser.profile.icon : ''
        },
        to_type: 'user',
        type: 'text',
        text: data.msgText,
        images:[
          {
            id: data.face_id,
            url: person_info.img_url,
            label: person_info.name,
            img_type: person_info.type,
            video_src:person_info.video_src
          }
        ],
        people_uuid: person_info.uuid,
        checkin_time:data.checkin_time,
        checkout_time:data.checkout_time,
        is_agent_check:true, //是否是代签消息
        offsetTimeZone:time_offset,
        create_time: new Date(),
        is_read: false,
      };
    }

  }
  else{
    if (Session.get('fromUserInfomation')) { //个人信息，未打卡(没关联过)
      Session.set('fromUserInfomation',false);
      data.user_id = Meteor.userId();
    }
    else{
      data.user_id = null;
    }
  }

  console.log(data);
  PUB.showWaitLoading('正在处理');
  console.log('data is 2', JSON.stringify(data))
  Meteor.call('ai-checkin-out',data,function(err,res){
    PUB.hideWaitLoading();
    if(type === 'confirmPersonName'){
      $('#setPicturePersonName').modal('hide');
    }
    if(type == 'personItem'){
      $('#selectPerson').modal('hide');
    }
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    if(err){
      PUB.toast('请重试');
      console.log('ai-checkin-out error:' + err);
      return;
    }
    if(res && res.result == 'succ'){
      PUB.toast('已记录到每日出勤报告');
      // 发送代Ta 签到成功通知
      if(taId){
        console.log(msgObj)
        sendMqttUserMessage(taId,msgObj);
      }
      if (Router.current().params.query.form === 'timeline') {
        return;
      }
      return PUB.back();
    } else {
      return navigator.notification.confirm(res.text,function(index){

      },res.reason,['知道了']);
    }
  });
};

Template.timelineAlbum.onRendered(function(){
  initTimeRangeSet();

  var taId = Router.current().params.query.taId;
  if(taId){
    Meteor.subscribe('usersById',taId);
    Meteor.subscribe('get-workai-user-relation',taId);
  }
  Session.set('timelineAlbumMultiSelect',false);
  Session.set('timelineAlbumLimit',1);
  var uuid = Router.current().params._uuid;
  Meteor.subscribe('user-relations-bygroup',uuid);
  Session.set('timelineAlbumLoading',true);
  var hour = Session.get('wantModifyTime');

  var selector = getSelector();
  Meteor.subscribe('device-timeline2',uuid,selector,limit.get(),function(){
    Session.set('timelineAlbumLoading',false);
    lazyTimelineImg();
  });

  var isLoadMore = false;
  $('.content').scroll(function(){
    var height = $('.timeLine').height();
    var contentTop = $('.content').scrollTop();
    var contentHeight = $('.content').height();
    // console.log(contentTop+contentHeight)
    // console.log(height)

    var _limit = limit.get();

    if (-10 < contentTop < 0) {
      isLoadMore = false;
    }
    if((contentHeight + contentTop + 50 ) >= height){
      _limit += 1;
      console.log('loadMore and limit = ',_limit);
      var selector = getSelector();
      var counts = DeviceTimeLine.find(selector,{sort:{hour:-1},limit:limit.get()}).count();
      Meteor.subscribe('device-timeline2',uuid,selector,_limit,function(){
        Session.set('timelineAlbumLoading',false);
        if(DeviceTimeLine.find(selector,{sort:{hour:-1},limit:_limit}).count() > counts) {
          limit.set(_limit);
        }
      });
    }
    lazyTimelineImg();
  });

  Meteor.subscribe('devices-by-uuid',Router.current().params._uuid);

  // 有新img元素时触发lazyload
  Tracker.autorun(function(c) {
    if(Session.get('timelineAlbumCounts')){
      lazyTimelineImg();
    }
  })
});
Template.timelineAlbum.onDestroyed(function(){
  Session.set('wantModify',false);
  Session.set('wantModifyTime',null);
  Session.set('modifyMyStatus_ta_name',null);
  Session.set('setPicturePersonNameData',null);

});
Template.timelineAlbum.helpers({
  showAccAndFuzz: function(accuracy,fuzziness){
    if(!accuracy && !fuzziness){
      return false;
    }
    return withAccuracyFuzzinesssInTimeLine
  },
  isLoading:function(){
    if (Session.get('timelineAlbumLoading') === false) {
      return false;
    }
    return true;
  },
  uuid: function() {
    var uuid = Router.current().params._uuid;
    var device = Devices.findOne({uuid: uuid});
    return device.name;
  }, 
  lists: function(){
    var timelineAlbumCounts = 0;
    var uuid = Router.current().params._uuid;
    var lists = [];
    var hour = Session.get('wantModifyTime');

    var selector = getSelector();

    DeviceTimeLine.find(selector,{sort:{hour:-1},limit:limit.get()}).forEach(function(item){
      var tmpArr = [];
      for(x in item.perMin){
        var hour = new Date(item.hour)
        hour = hour.setMinutes(x);
        var tmpObj = {
          time: hour,
          images: []
        }
        var personIds = [];
        item.perMin[x].forEach(function(img){
          img._id = new Mongo.ObjectID()._str; // 用于多选时标记图片的唯一性
          var index = personIds.indexOf(img.person_id);
          if(index < 0){
            personIds.push(img.person_id)
            tmpObj.images.push(img);
          } else {
            var mergedImgs = tmpObj.images[index].mergedImgs || [];
            mergedImgs.push(img);
            tmpObj.images[index].mergedImgs = mergedImgs;
          }
        });
        if(tmpObj.images.length > 0){
          tmpArr.push(tmpObj);
          timelineAlbumCounts += tmpObj.images.length;
        }
      }
      tmpArr.reverse();
      lists = lists.concat(tmpArr);
    });
    
    personIds = [];
    Session.set('timelineAlbumCounts', timelineAlbumCounts);
    Session.set('timelineAlbumListsCounts',lists.length);
    return lists;
  },
  formatDate: function(time){
    var date = new Date(time);
    var device = Devices.findOne({uuid: Router.current().params._uuid});
    var group_id = device.groupId;
    var time_offset = 8;
    var group = SimpleChat.Groups.findOne({_id: group_id});
    console.log(group);
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }
    return date.shortTime(time_offset)
  },
  // 是否显示多选模式
  showMultiSelect: function() {
    var formPage = Router.current().params.query.from;
    // 只有直接从设备进入， 才启用多选
    if (formPage && formPage == 'timeline') {
      return true;
    }
    return false;
  },
  isMultiSelect: function(){
    // return Session.equals('timelineAlbumMultiSelect',true);
    return isMultiSelect.get();
  },
  relations: function(){
    var device = Devices.findOne({uuid: Router.current().params._uuid});
    var group_id = device.groupId;
    return WorkAIUserRelations.find({'group_id':group_id}).fetch();
  },
  getMergedImgsCount: function(arr){
    var arr = arr || [];
    return arr.length + 1;
  },
  mergedIsExtend: function(){
    var id = this.person_id +'_'+this.ts;
    if(mergedExtendLists.get().indexOf(id) > -1){
      return true;
    }
    return false;
  }

});

Template.timelineAlbum.events({
  'click .back': function(){
    return PUB.back();
  },
  // 展开合并的图片
  'click .images-merged': function(e){
    e.stopImmediatePropagation();
    var lists = mergedExtendLists.get();
    var id = this.person_id +'_'+this.ts;
    var index = lists.indexOf(id);
    if(lists.indexOf(id) < 0){
      lists.push(id);
    } 
    mergedExtendLists.set(lists);
    lazyTimelineImg();
  },
  'click .images-click-able, click .select-video-enable': function(e){
    e.stopImmediatePropagation();

    // 如果是多选模式
    if( isMultiSelect.get() ) {
      var ids = multiSelectIds.get();
      var lists = multiSelectLists.get();

      var index = ids.indexOf(this._id);
      // 多选模式, 不选择video
      if(this.img_type == 'video') {
        return PUB.toast('多选模式下，只能选择图片');
      }
      
      if(index < 0) { // 还没有被选择
        ids.push(this._id);
        lists.push(this);
        $(e.currentTarget).addClass('multi-selected');
      } else {
        ids.splice(index,1);
        lists.splice(index,1);
        $(e.currentTarget).removeClass('multi-selected');
      }
      console.log(lists);

      multiSelectIds.set(ids);
      multiSelectLists.set(lists);
      return;
    }

    // is_video
    var is_video = false;
    console.log($(e.currentTarget).data('isvideo'))
    if($(e.currentTarget).data('isvideo')){
      is_video = true;
    }
    var uuid = Router.current().params._uuid;
    device = Devices.findOne({uuid: uuid});
    var people_id = e.currentTarget.id,
        group_id  = device.groupId;
    var taName = Session.get('modifyMyStatus_ta_name');
    var person_name = taName ||'';
    var time_offset = 8;
    var group = SimpleChat.Groups.findOne({_id: group_id});
    console.log(group);
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }

    var confirm_text = '';
    var person_info = {
      'name': person_name,
      'uuid': uuid,
      'group_id': group_id,
      'img_url': $(e.currentTarget).data('imgurl'),
      'type': 'face',
      'ts': $(e.currentTarget).data('ts'),
      'accuracy': 1,
      'fuzziness': 1,
      'sqlid': $(e.currentTarget).data('sqlid'),
      'style': $(e.currentTarget).data('style')
    };
    console.log('person_info in timelineAlbum.js is: ',JSON.stringify(person_info));
    // 是video 的处理
    if(is_video){
      person_info.type = 'video';
      person_info.video_src = $(e.currentTarget).data('videosrc');
    }

    var data = {
      user_id:Meteor.userId(),
      face_id:people_id,
      person_info: person_info
    };

    var msgText = '「' + device.name + '」提醒你：';

    var date = new Date($(e.currentTarget).data('ts'));
    date = date.shortTime(time_offset);
    date = date.split(" ");
    date.splice(0,1);
    date = date.join(" ");

    if(device.in_out && device.in_out == 'in'){
      data.checkin_time =  new Date( $(e.currentTarget).data('ts')).getTime()
      data.checkin_image = $(e.currentTarget).data('imgurl');
      msgText = "您的上班时间是 " + date;
    } else {
      data.checkout_time =  new Date( $(e.currentTarget).data('ts')).getTime()
      data.checkout_image = $(e.currentTarget).data('imgurl');
      msgText = "您的下班时间是 " + date;
    }
    data.wantModify = Session.get('wantModify');

    // 帮别人签到
    var taId = Router.current().params.query.taId;
    var msgObj;
    if(taId){
      data.user_id = taId;

      // var user = Meteor.user();
      var deviceUser = Meteor.users.findOne({username: uuid});
      var taUser = Meteor.users.findOne({_id: taId});
      msgObj = {
        _id: new Mongo.ObjectID()._str,
        form:{
          id: deviceUser._id,
          name: deviceUser.profile.fullname,
          icon: deviceUser.profile.icon
        },
        to: {
          id:   taUser._id,
          name: taUser.profile.fullname? taUser.profile.fullname: taUser.username,
          icon: taUser.profile.icon
        },
        to_type: 'user',
        type: 'text',
        text: msgText,
        images:[
          {
            id: people_id,
            url: $(e.currentTarget).data('imgurl'),
            label: person_name,
            img_type: is_video ? 'video' : 'face',
            video_src:person_info.video_src
          }
        ],
        people_uuid: uuid,
        checkin_time:data.checkin_time,
        checkout_time:data.checkout_time,
        is_agent_check:true, //是否是代签消息
        offsetTimeZone:time_offset,
        create_time: new Date(),
        is_read: false,
      };
    }
    else if (taName) { //帮标识过但没关联的人代签
      data.user_id = null;
      data.wantModify = true;
    }
    console.log(data);
    // 检查是否标识过自己
    var relations = null;
    if (data.user_id) {
      relations = WorkAIUserRelations.findOne({'app_user_id':data.user_id,group_id:group_id});
    }
    var formPage = Router.current().params.query.from;
    var callbackRsu = function(res){

    };
    if(relations && relations.person_name !== $(e.currentTarget).data('name') && Router.current().params.query.form === 'timeline'){
      // 如果从设备列表过来，并且选择的不是自己， 提示关联到某个人
      data.msgText = msgText;
      Session.set('setPicturePersonNameData',data);
      return $('#selectPerson').modal('show');
    }
    if(relations || taName ){ // 标识过
      confirm_text = '是否将该时间记录到每日出勤报告？';
      person_name = relations ? relations.person_name : taName;
      if(person_name){
        confirm_text = '是否将该时间记录到「'+ person_name +'」每日出勤报告？'
      }
      PUB.confirm(confirm_text,function(){
        PUB.showWaitLoading('正在处理');
        console.log('data is 3', JSON.stringify(data))
        Meteor.call('ai-checkin-out',data,function(err, res){
          PUB.hideWaitLoading();
          if(err){
            PUB.toast('记录失败，请重试');
            console.log('ai-checkin-out error:' + err);
            return;
          }
          // if(timelineAlbumTimeout){
          //   window.clearTimeout(timelineAlbumTimeout);
          // }
          // timelineAlbumTimeout = setTimeout(function() {
          //   $("img.lazy").lazyload({});
          // }, 500);
          if(res && res.result == 'succ'){
            PUB.toast('已记录到每日出勤报告');
            // 发送代Ta 签到成功通知
            if(taId){
              console.log(msgObj)
              sendMqttUserMessage(taId,msgObj);
            }
            if (formPage && formPage === 'agentMsg') {
              var msgId = Router.current().params.query.msgId;
              var reCheckTime = data.checkin_time || data.checkout_time;
              SimpleChat.Messages.update({_id:msgId},{$set:{hadReCheck:true,is_right:false,reCheckTime:reCheckTime,offsetTimeZone:time_offset,text:''}});
              return Router.go('/simple-chat/to/user?id='+deviceUser._id);
            }
            return PUB.back();
          } else {
            return navigator.notification.confirm(res.text,function(index){

            },res.reason,['知道了']);
          }
        });
      });
    } else {
      var tips = is_video ? '视频' : '照片';
      confirm_text = '是否选择此' + tips +'？';
      if(person_name){
        confirm_text = '此' + tips +'是：「'+person_name+'」，是否选择？';
      }
      else{
        data.msgText = msgText;
        Session.set('setPicturePersonNameData',data);
        return $('#selectPerson').modal('show');
        // $('#picturePersonName').val("");
        // Meteor.setTimeout(function(){
        //   $('#picturePersonName').focus();
        // },800);
        // return $('#setPicturePersonName').modal('show');
        // confirm_text = '请选择一张有名字的照片或前往聊天室进行标记~';
        // var url = '/simple-chat/to/group?id='+ group_id;
        // try{
        //   navigator.notification.confirm(confirm_text,function
        //         (index){if (index === 2) {PUB.page(url);}},
        //         '提示',['重选','转入聊天室']);
        // }
        // catch (error){
        //   if(confirm(confirm_text)){
        //     PUB.page(url);
        //   }
        // }
      }
      PUB.confirm(confirm_text,function(){
        PUB.showWaitLoading('正在处理');
        console.log('data is 1', JSON.stringify(data))
        Meteor.call('ai-checkin-out',data,function(err,res){
          PUB.hideWaitLoading();
          if(err){
            PUB.toast('请重试');
            console.log('ai-checkin-out error:' + err);
            return;
          }
          // if(timelineAlbumTimeout){
          //   window.clearTimeout(timelineAlbumTimeout);
          // }
          // timelineAlbumTimeout = setTimeout(function() {
          //   $("img.lazy").lazyload({});
          // }, 500);
          if(res && res.result == 'succ'){
            PUB.toast('已记录到每日出勤报告');
            // 发送代Ta 签到成功通知
            if(taId){
              console.log(msgObj)
              sendMqttUserMessage(taId,msgObj);
            }
            return PUB.back();
          } else {
            return navigator.notification.confirm(res.text,function(index){

            },res.reason,['知道了']);
          }
        });
      });
    }
  },
  'click .confirmPersonName': function(e){
    var name = $('#picturePersonName').val();
    if(!name || name.length < 1){
      PUB.toast('请输入姓名');
      return $('#picturePersonName').focus();
    }
    return checkInOutWithOutName('confirmPersonName',name);
    var data = Session.get('setPicturePersonNameData');
    data.person_info.name = name;
    var taId = Router.current().params.query.taId;
    var msgObj;
    if(taId){
      data.user_id = taId;

      // var user = Meteor.user();
      var deviceUser = Meteor.users.findOne({username: Router.current().params._uuid});
      var taUser = Meteor.users.findOne({_id: taId});
      // var device = Devices.findOne({uuid: Router.current().params._uuid});
      msgObj = {
        _id: new Mongo.ObjectID()._str,
        form: {
          id: deviceUser._id,
          name: deviceUser.profile.fullname,
          icon: deviceUser.profile.icon
        },
        to: {
          id:   taUser._id,
          name: taUser.profile.fullname? taUser.profile.fullname: taUser.username,
          icon: taUser.profile.icon
        },
        to_type: 'user',
        type: 'text',
        text: data.msgText,
        create_time: new Date(),
        is_read: false
      };
    }
    console.log(data);
    PUB.showWaitLoading('正在处理');
    console.log('data is 4', JSON.stringify(data))
    Meteor.call('ai-checkin-out',data,function(err,res){
      PUB.hideWaitLoading();
      $('#setPicturePersonName').modal('hide');
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
      if(err){
        PUB.toast('请重试');
        console.log('ai-checkin-out error:' + err);
        return;
      }
      // if(timelineAlbumTimeout){
      //   window.clearTimeout(timelineAlbumTimeout);
      // }
      // timelineAlbumTimeout = setTimeout(function() {
      //   $("img.lazy").lazyload({});
      // }, 500);
      if(res && res.result == 'succ'){
        PUB.toast('已记录到每日出勤报告');
        // 发送代Ta 签到成功通知
        if(taId){
          console.log(msgObj)
          sendMqttUserMessage(taId,msgObj);
        }
        return PUB.back();
      } else {
        return navigator.notification.confirm(res.text,function(index){

        },res.reason,['知道了']);
      }
    });
  },
  // 显示视频预览层
  'click .videos':function(e){
    var video_src = $(e.currentTarget).data('videosrc');
    var video_post = $(e.currentTarget).data('videopost');
    return openVideoInBrowser(video_src);
    $('.videoLayer').append('<video id="timeline-video-preview" class="video-js vjs-default-skin" preload="auto" width="100%" height="100%" poster="{{video_post}}" webkit-playsinline="true" playsinline="true" loop>\
      <source src="" type="video/mp4" />\
      <p class="vjs-no-js">Not supports HTML5 video</p>\
    </video>');
    $('.videoPreviewLayer').fadeIn(function(){
      videojs("timeline-video-preview", {}, function() {
        window.VideoPlayer = this;
        $("#timeline-video-preview source").attr("src", video_src);
        VideoPlayer.src(video_src);
        VideoPlayer.load(video_src);
        VideoPlayer.play();
      });
    });
  },
  'click .videoPreviewLayer': function(e){
    VideoPlayer.pause();
    // VideoPlayer = null;
    videojs("timeline-video-preview").dispose();
    $('.videoPreviewLayer').fadeOut();
  },
  'click .personItem': function(e){
    var person_name = $(e.currentTarget).data('pname');
    var data = Session.get('setPicturePersonNameData');
    var taId = e.currentTarget.id;
    var taName = $(e.currentTarget).data('name');
    return checkInOutWithOutName('personItem',person_name, taId, taName);
  },
  // 添加组员
  'click .addNewPerson': function(){
    $('#selectPerson').modal('hide');
    $('#picturePersonName').val("");
    Meteor.setTimeout(function(){
      $('#picturePersonName').focus();
    },800);
    return $('#setPicturePersonName').modal('show');
  },
  // 启用多选
  'click #multiSelect': function(e) {
    isMultiSelect.set(true);
  },
  // 退出多选
  'click #cancelSelect': function(e) {
    isMultiSelect.set(false);
    multiSelectIds.set([]);
    multiSelectLists.set([]);
    $('.images, .videos').removeClass('multi-selected');
  },
  // 完成多选, 同时完成标记， 不记录时间
  'click #confirmSelect': function(e) {
    isMultiSelect.set(false);
    var _lists = multiSelectLists.get();

    multiSelectIds.set([]);
    multiSelectLists.set([]);
    $('.images, .videos').removeClass('multi-selected');

    // 公共变量准备
    var uuid   = Router.current().params._uuid;
    var device = Devices.findOne({uuid: uuid});
    var group_id  = device.groupId;
    
    var call_back_handle = function(name){
      if (!name) {
        return;
      }

      PUB.showWaitLoading('处理中');
      var setNames = [];

      Meteor.call('get-id-by-name1', uuid, name, group_id, function(err, res){
        if (err || !res){
          return PUB.toast('标注失败，请重试~');
        }
        
        _lists.forEach(function(item) {
          // 发送消息给平板
          var trainsetObj = {
            group_id: group_id,
            type: 'trainset',
            url: item.img_url,
            person_id: item.person_id,
            device_id: uuid,
            face_id: res ? res.faceId : item.person_id,
            drop: false,
            img_type: 'face',
            style:item.style,
            sqlid:item.sqlid
          };
          console.log("==sr==. timeLine multiSelect: " + JSON.stringify(trainsetObj));
          sendMqttMessage('/device/'+group_id, trainsetObj);

          setNames.push({
            uuid: uuid, 
            id: item.person_id, 
            url: item.img_url, 
            name: name,
            sqlid:item.style,
            style:item.sqlid
          });
        });

        if (setNames.length > 0){
          Meteor.call('set-person-names', group_id, setNames);
        }

        _lists.forEach(function(item) {
          try {
            var person_info = {
              'uuid': uuid,
              'name': name,
              'group_id':group_id,
              'img_url': item.img_url,
              'type': 'face',
              'ts': item.ts,
              'accuracy': item.accuracy,
              'fuzziness': item.fuzziness,
              'sqlid':item.sqlid,
              'style':item.style
            };
            var data = {
              face_id: item.person_id,
              person_info: person_info,
              formLabel: true
            };
            
            Meteor.call('ai-checkin-out',data,function(err,res){});
          } catch(e){}
        });
        PUB.hideWaitLoading();
      });
    };

    SimpleChat.show_label(group_id, call_back_handle);
  },
  'click #timeRange': function(e) {
    return $('#timeRange').mobiscroll('show');
  }
});

Template.timelineAlbum.onDestroyed(function() {
  isMultiSelect.set(false);
  multiSelectIds.set([]);
  multiSelectLists.set([]);
});