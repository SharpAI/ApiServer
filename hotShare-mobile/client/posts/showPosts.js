Template.showPosts.events({
    'click #WXTimelineShare':function(e, t){
      current = Router.current();
      url = current.url;
      if(url.indexOf("http") > 0)
        url = url.replace("meteor.local", "120.24.164.67");
      else
        url = "http://120.24.164.67"+url;
      var title = this.title;
      var addontitle = this.addontitle;
      window.plugins.toast.showShortCenter("准备故事的主题图片，请稍等")
      downloadFromBCS(this.mainImage, function(result){
        console.log("url = "+url);
        if (result) {
            WeChat.share({
                title: title,
                description: addontitle+'(来自 故事贴)',
                thumbData: result,
                url: url
              }, WeChat.Scene.timeline, function () {
                PUB.toast("已成功分享~");
                console.log('分享成功~');
              }, function (reason) {
                // 分享失败
                console.log(reason);
                PUB.toast("无法获取故事标题图片，请稍后重试！");

              });
        } else {
            PUB.toast("无法获取故事标题图片，请稍后重试！");
        }
      })
    },
    'click #WXSessionShare':function(e, t){
      current = Router.current();
      url = current.url;
      if(url.indexOf("http") > 0)
        url = url.replace("meteor.local", "120.24.164.67");
      else
        url = "http://120.24.164.67"+url;
      var title = this.title;
      var addontitle = this.addontitle;
      window.plugins.toast.showShortCenter("准备故事的主题图片，请稍等")
      downloadFromBCS(this.mainImage, function(result){
        if (result) {
          WeChat.share({
            title: title,
            description: addontitle+'(来自 故事贴)',
            thumbData: result,
            url: url
          }, WeChat.Scene.session, function () {
            console.log('分享成功~');
          }, function (reason) {
            // 分享失败
            PUB.toast("无法获取故事标题图片，请稍后重试！");
            console.log(reason);
          });
        } else {
            PUB.toast("无法获取故事标题图片，请稍后重试！");
        }
      })
    }
})
