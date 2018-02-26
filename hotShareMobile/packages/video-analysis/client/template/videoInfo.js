var currentTab = new ReactiveVar('videoInfo');
var isLoading = new ReactiveVar(false);
var videoPlayer = null;

var deepVideoServer = new ReactiveVar('');

var setVideoInfo = function(){
  var _id = Router.current().params._id;
}
var initPlayer = function(id){
  var _id = Router.current().params._id;

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

    // 设置播放源
    // _player.src(video_src);  
  });
  
}

Template.dvaVideoInfoHeader.events({
  'click .left': function(e){
    videoPlayer.dispose();
    videoPlayer = null;
    Session.set('DVA_Last_Page', 'dvaVideos');
    return Router.go('/deepVideoAnalysis');
  }
});

Template.dvaVideoInfo.onRendered(function() {
  var _id = Router.current().params._id;
  isLoading.set(true);
  initPlayer('my-video');
});

Template.dvaVideoInfo.helpers({
  isTab: function(tab) {
    return currentTab.get() == tab;
  },
  isCurrent: function(tab) {
    if(currentTab.get() == tab) {
      return 'current';
    }
    return '';
  }

});

Template.dvaVideoInfo.events({
  'click .va-tabitem': function (e) {
    return currentTab.set(e.currentTarget.id);
  }
});