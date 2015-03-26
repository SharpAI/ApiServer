Template.showPosts.events({
    'click #WXTimelineShare':function(e, t){
      current = Router.current();
      url = current.url;
      if(url.indexOf("http") > 0)
        url = url.replace("meteor.local", server_domain_name);
      else
        url = "http://" + server_domain_name +url;
      var title = this.title;
      var addontitle = this.addontitle;
      if (this.addontitle && (this.addontitle !=='')){
        title = title + '：' + this.addontitle;
      }
      window.plugins.toast.showShortCenter("准备故事的主题图片，请稍等")

      height = $('.showPosts').height()
      $('#blur_overlay').css('height',height)
      $('#blur_overlay').css('z-index', 10000)

      downloadFromBCS(this.mainImage, function(result){
        console.log("url = "+url);
        $('#blur_overlay').css('height','')
        $('#blur_overlay').css('z-index', -1)

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
        url = url.replace("meteor.local", server_domain_name);
      else
        url = "http://" + server_domain_name +url;
      var title = this.title;
      var addontitle = this.addontitle;
      window.plugins.toast.showShortCenter("准备故事的主题图片，请稍等")
      height = $('.showPosts').height()
      $('#blur_overlay').css('height',height)
      $('#blur_overlay').css('z-index', 10000)

      downloadFromBCS(this.mainImage, function(result){

        $('#blur_overlay').css('height','')
        $('#blur_overlay').css('z-index', -1)
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
