var videoPlayer = null;

var initPlayer = function(id){
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
  initPlayer('my-video')
});

Template.dvaDetail.helpers({
  lists: function () {
    return [1,2,3,4,5,6,7,8,9,10];
  }
});

Template.dvaDetailHeader.events({
  'click .left': function(e){
    videoPlayer.dispose();
    videoPlayer = null;
    PUB.back();
  }
});
