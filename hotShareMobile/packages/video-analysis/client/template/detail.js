var isLoading = new ReactiveVar(false);
var videoIndex = new ReactiveVar(0);

var videoPlayer = null;

var deepVideoServer = 'http://192.168.0.117:8000';

var initPlayer = function(id){
  var _id = Router.current().params._id;
  var obj =  DVA_QueueLists.findOne({_id: _id});
  var images = (obj && obj[videoIndex.get()] && obj[videoIndex.get()].images) ?  obj[videoIndex.get()].images : [];
  var video_src = 'http://www.runoob.com/try/demo_source/movie.mp4';
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
        if(currentTime >= (images[i].time) ) {
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

    _player.titlebar({
      position: 'top-right',
      fadeTime: 3000,
      title: '测试视频',
      backButton: {
        callback: function(player){
          player.dispose();
          videoPlayer = null;
          return PUB.back();
        }
      }
    });
    // 设置播放源
    _player.src(video_src);  
  });
  
}

Template.dvaDetail.onRendered(function() {
  var _id = Router.current().params._id;
  isLoading.set(true);
  Meteor.subscribe('dva_queue_info',_id, {
    onReady: function() {
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
    return lists[index];
  },
  getVideoUrl: function() {
    return deepVideoServer + '/media/' + this.video_id + '/video/' + this.video_id + '.mp4' ;
  }
});

Template.dvaDetailHeader.events({
  'click .left': function(e){
    videoPlayer.dispose();
    videoPlayer = null;
    PUB.back();
  },
  // 跳转到对应视频位置， 并设置当前为选择状态
  'click .va-vid-result-item': function(e) {
    // 设置当前为选中状态
    $('.va-vid-result-item').removeClass('current');
    $(e.currentTarget).addClass('current');

    // 跳转至对应视频相应位置
    videoPlayer.currentTime(this.time);
  }
});
