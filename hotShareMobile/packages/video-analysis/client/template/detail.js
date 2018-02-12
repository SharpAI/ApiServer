var isLoading = new ReactiveVar(false);
var videoIndex = new ReactiveVar(0);
var totalVideoLen = new ReactiveVar(1);

var videoPlayer = null;

var deepVideoServer = new ReactiveVar('');

var setVideoInfo = function(){
  var index = videoIndex.get();
  var _id = Router.current().params._id;
  var obj =  DVA_QueueLists.findOne({_id: _id});
  var results = [];
  for (x in obj.results) {
    results.push(obj.results[x]);
  }
  var video_id =  (results && results[index] && results[index].video_id) ? results[index].video_id : '';
  var video_name = (results && results[index] && results[index].video_name) ? results[index].video_name : '';
  var video_src = deepVideoServer.get() + '/media/' + video_id + '/video/' + video_id + '.mp4';
  videoPlayer.src(video_src);  
}
var initPlayer = function(id){
  var _id = Router.current().params._id;
  var obj =  DVA_QueueLists.findOne({_id: _id});
  var results = [];
  for (x in obj.results) {
    results.push(obj.results[x]);
  }
  
  var images = (results && results[videoIndex.get()] && results[videoIndex.get()].images) ?  results[videoIndex.get()].images : [];
  // var video_src = 'http://www.runoob.com/try/demo_source/movie.mp4';
  var video_id =  (results && results[videoIndex.get()] && results[videoIndex.get()].video_id) ? results[videoIndex.get()].video_id : '';
  var video_name = (results && results[videoIndex.get()] && results[videoIndex.get()].video_name) ? results[videoIndex.get()].video_name : '';
  var video_src = deepVideoServer.get() + '/media/' + video_id + '/video/' + video_id + '.mp4';
  if(videoPlayer) {
    videoPlayer.dispose();
    videoPlayer = null;
  }
  // 初始化播放器
  videoPlayer = videojs(id,{ fluid: true }, function () {
    console.log('Good to go!');
    // 注册播放器点击事件
    var _player = this;
    this.on('play',function(){
      console.log('正在播放');
    }); 

    this.on('timeupdate', function() {
      var currentTime = _player.currentTime();
      for(var i=0; i < images.length; i++) {
        if(currentTime >= (images[i].distance) ) {
          $('.va-vid-result-item').removeClass('current');
          $('.va-vid-result-item').eq(1).addClass('current');
          return;
        }
      }
    });

    //暂停--播放完毕后也会暂停
    this.on('pause',function(){
      console.log("暂停中")
    }); 

    // 结束
    this.on('ended', function() {
      console.log('结束');
    })
    // 设置播放器容器宽高
    var window_W = $('body').width();
    var height = window_W * 9 / 16;
    height = Number(height);

    _player.height(height);
    _player.width(window_W);
    $('.va-videoHelper').css({'height':height+'px'});
    $('.va-vid-result-lists').css({'top':height + 74 + 'px'});

    // 设置播放源
    _player.src(video_src);  
  });
  
}

Template.dvaDetail.onRendered(function() {
  var _id = Router.current().params._id;
  isLoading.set(true);
  Meteor.subscribe('dva_queue_info',_id, {
    onReady: function() {
      // get Server url 
      var server_url = 'http://192.168.0.117:8000';
      var device = DVA_Devices.findOne({userId: Meteor.userId()});
      if(device && device.ipv4Addresses && device.ipv4Addresses[0] && device.port) {
        server_url = 'http://'+device.ipv4Addresses[0]+ ':' + device.port;
      }
      console.log('==sr==. server_url is '+ server_url);
      deepVideoServer.set(server_url);
      
      isLoading.set(false);
      initPlayer('my-video');
    }
  });
});

Template.dvaDetail.helpers({
  obj: function() {
    var _id = Router.current().params._id;
    return DVA_QueueLists.findOne({_id: _id});
  },
  videoInfo: function() {
    var _id = Router.current().params._id;
    var data = DVA_QueueLists.findOne({_id: _id});
    var index = videoIndex.get();
    var results = data.results;
    var lists = [];
    for(var x in results){
      lists.push(results[x]);
    }
    totalVideoLen.set(lists.length);
    return lists[index];
  },
  getCount: function(images) {
    return images.length;
  },
  getVideoInLen: function() {
    return videoIndex.get() + 1 + ' of ' + totalVideoLen.get();
  },
  getVideoUrl: function(video_id) {
    var url = deepVideoServer.get() + '/media/' + video_id + '/video/' + video_id + '.mp4' ;
    console.log('==sr==. video url is :'+url);
    return url;
  },
  getImageUrl: function(url) {
    if(url.indexOf('data:') > -1) {
      return url;
    }
    return deepVideoServer.get() + url;
  },
  formatNum: function(num) {
    var n  = Number(num);
    return n.toFixed(1);
  }
});

Template.dvaDetailHeader.events({
  'click .left': function(e){
    videoPlayer.dispose();
    videoPlayer = null;
    Session.set('DVA_Last_Page', 'dvaHistory');
    return Router.go('/deepVideoAnalysis');
  }
});

Template.dvaDetail.events({
  // 跳转到对应视频位置， 并设置当前为选择状态
  'click .va-vid-result-item': function(e) {
    // 设置当前为选中状态
    $('.va-vid-result-item').removeClass('current');
    $(e.currentTarget).addClass('current');

    // 跳转至对应视频相应位置
    videoPlayer.currentTime(this.distance);
  },
  'click #videoPrev': function() {
    var index = videoIndex.get();
    if(index > 0) {
      index -= 1;
      videoIndex.set(index);
      setVideoInfo();
    }
  },
  'click #videoNext': function() {
    var index = videoIndex.get();
    if(index < (totalVideoLen.get() - 1) ) {
      index += 1;
      videoIndex.set(index);
      setVideoInfo();
    }
  }
});
