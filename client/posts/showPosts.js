Template.showPosts.events({
    'click #WXTimelineShare':function(e, t){
      current = Router.current();
      url = current.url;
      if(url.indexOf("http") > 0)
        url = url.replace("meteor.local", "54.149.51.44");
      else
        url = "http://54.149.51.44"+url;
      WeChat.share({
        title: this.title,
        description: this.addontitle+'(来自 故事贴)',
        thumbData: this.mainImage,
        url: url
      }, WeChat.Scene.timeline, function () {
        console.log('分享成功~');
      }, function (reason) {
        // 分享失败
        console.log(reason);
      });
    },
    'click #WXSessionShare':function(e, t){
      current = Router.current();
      url = current.url;
      if(url.indexOf("http") > 0)
        url = url.replace("meteor.local", "54.149.51.44");
      else
        url = "http://54.149.51.44"+url;
      WeChat.share({
        title: this.title,
        description: this.addontitle+'(来自 故事贴)',
        thumbData: this.mainImage,
        url: url
      }, WeChat.Scene.session, function () {
        console.log('分享成功~');
      }, function (reason) {
        // 分享失败
        console.log(reason);
      });
    }
})
