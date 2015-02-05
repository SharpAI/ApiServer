Template.loadingPost.rendered = function() {
    current = Router.current();
    url = current.url;
    if(url.indexOf("http") > 0)
      url = url.replace("meteor.local", "120.24.244.253");
    else
      url = "http://120.24.244.253"+url;
    var tit = $('#wx-title').html(); //标题
    var img = $('#wx-img').attr("src"); //图片
    var con = $('#wx-con').html(); //简介
    var link = url; //链接
    document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
      // 发送给好友
      WeixinJSBridge.on('menu:share:appmessage', function (argv) {
        WeixinJSBridge.invoke('sendAppMessage', {
          "appid": "123490452",
          "img_url": img,
          "img_width": "160",
          "img_height": "160",
          "link": link,
          "desc": con,
          "title": tit
        }, function (res) {
          console.log('send_msg error '+res.err_msg);
        })
      });

      // 分享到朋友圈
      WeixinJSBridge.on('menu:share:timeline', function (argv) {
        WeixinJSBridge.invoke('shareTimeline', {
          "img_url": img,
          "img_width": "160",
          "img_height": "160",
          "link": link,
          "desc": con,
          "title": tit
        }, function (res) {
          console.log('timeline error '+res.err_msg);
        });
      });
    }, false)
  };
    
Template.showPosts.events({
    'click #WXTimelineShare':function(e, t){
      current = Router.current();
      url = current.url;
      if(url.indexOf("http") > 0)
        url = url.replace("meteor.local", "120.24.244.253");
      else
        url = "http://120.24.244.253"+url;
      var title = this.title;
      var addontitle = this.addontitle;
      Session.set('isSharing',true);
      downloadFromBCS(this.mainImage, function(result){
        console.log("url = "+url);
        if (result) {
            WeChat.share({
                title: title,
                description: addontitle+'(来自 故事贴)',
                thumbData: result,
                url: url
              }, WeChat.Scene.timeline, function () {
                Session.set('isSharing',false);
                PUB.toast("已成功分享~");
                console.log('分享成功~');
              }, function (reason) {
                // 分享失败
                console.log(reason);
                PUB.toast("无法获取故事标题图片，请稍后重试！");
                Session.set('isSharing',false);
              });
        } else {
            PUB.toast("无法获取故事标题图片，请稍后重试！");
            Session.set('isSharing',false);
        }
      })
    },
    'click #WXSessionShare':function(e, t){
      current = Router.current();
      url = current.url;
      if(url.indexOf("http") > 0)
        url = url.replace("meteor.local", "120.24.244.253");
      else
        url = "http://120.24.244.253"+url;
      var title = this.title;
      var addontitle = this.addontitle;
      Session.set('isSharing',true);
      downloadFromBCS(this.mainImage, function(result){
        if (result) {
          WeChat.share({
            title: title,
            description: addontitle+'(来自 故事贴)',
            thumbData: result,
            url: url
          }, WeChat.Scene.session, function () {
            console.log('分享成功~');
            Session.set('isSharing',false);
          }, function (reason) {
            // 分享失败
            Session.set('isSharing',false);
            PUB.toast("无法获取故事标题图片，请稍后重试！");
            console.log(reason);
          });
        } else {
            Session.set('isSharing',false);
            PUB.toast("无法获取故事标题图片，请稍后重试！");
        }
      })
    }
})
