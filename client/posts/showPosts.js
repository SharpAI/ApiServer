Template.showPosts.events({
    'click #WXTimelineShare':function(e, t){
      current = Router.current();
      url = current.url;
      if(url.indexOf("http") > 0)
        url = url.replace("meteor.local", "54.149.51.44");
      else
        url = "http://54.149.51.44"+url;
      var title = this.title;
      var addontitle = this.addontitle;
      downloadFromBCS(this.mainImage, function(result){
        console.log("url = "+url);
        if (result) {
            WeChat.share({
                title: title,
                description: addontitle+'(来自 故事贴)',
                thumbData: result,
                url: url
              }, WeChat.Scene.timeline, function () {
                console.log('分享成功~');
              }, function (reason) {
                // 分享失败
                console.log(reason);
              });
        } else {
            PUB.alert("无法获取故事标题图片，分享失败！");
        }
      })
    },
    'click #WXSessionShare':function(e, t){
      current = Router.current();
      url = current.url;
      if(url.indexOf("http") > 0)
        url = url.replace("meteor.local", "54.149.51.44");
      else
        url = "http://54.149.51.44"+url;
      var title = this.title;
      var addontitle = this.addontitle;
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
            console.log(reason);
          });
        } else {
            PUB.alert("无法获取故事标题图片，分享失败！");
        }
      })
    }
})
