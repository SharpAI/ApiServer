// self = Session.get('seriesContent)
getSeriesSharingPath = function(data){
  var url = "http://" + server_domain_name +'/series/'+data._id;
  return url;
};

shareSeriesToWXTimeLine = function(title,description,thumbData,url){
    // shareSeriesToWechat(title,description,thumbData,url,WeChat.Scene.timeline);
    var param = {
      "title": title,
      "summary":  description,
      "image_url": thumbData,
      "target_url": url
    }
    if (device.platform === 'Android') {
        shareSeriesToWechat(title,description,thumbData,url,WeChat.Scene.timeline);
    } else {
      return WechatShare.share({
        scene: 2,
        message: {
          title: param.title,
          description: param.summary,
          thumbData: param.image_url,
          url: param.target_url
        }
      }, function() {
        // if (hotPosts.length > 0 || (Meteor.user().profile && Meteor.user().profile.web_follower_count && Meteor.user().profile.web_follower_count > 0)) {
        //     $('.shareReaderClub,.shareReaderClubBackground').show();
        // }
        // window.PUB.toast('分享成功!');
        // var shareType = Session.get("shareToWechatType");
        // if(shareType[1] && shareType[1] == true){
        //     Meteor.setTimeout (function(){
        //         $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
        //     },3000);
        //     shareType[1] = false;
        //     Session.set("shareToWechatType",shareType);
        // }
      }, function() {
        window.PUB.toast('分享失败!你安装微信了吗？');
      });
    }
};
shareSeriesToWXSession = function(title,description,thumbData,url) {
    // shareSeriesToWechat(title,description,thumbData,url,WeChat.Scene.session);
    var param = {
      "title": title,
      "summary":  description,
      "image_url": thumbData,
      "target_url": url
    }
  if (device.platform === 'Android') {
      shareSeriesToWechat(title,description,thumbData,url,WeChat.Scene.session);
    } else {
      return WechatShare.share({
        scene: 1,
        message: {
          title: param.title,
          description: param.summary,
          thumbData: param.image_url,
          url: param.target_url
        }
      }, function() {
        // if (hotPosts.length > 0 || (Meteor.user().profile && Meteor.user().profile.web_follower_count && Meteor.user().profile.web_follower_count > 0)) {
        //     // $('.shareReaderClub,.shareReaderClubBackground').show();
        //      Router.go('/hotPosts/' + Session.get('postContent')._id);
        // }
        // window.PUB.toast('分享成功!');
        // var shareType = Session.get("shareToWechatType");
        // if(shareType[1] && shareType[1] == true){
        //     Meteor.setTimeout (function(){
        //         $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
        //     },3000);
        //     shareType[1] = false;
        //     Session.set("shareToWechatType",shareType);
        // }
      }, function() {
        window.PUB.toast('分享失败!你安装微信了吗？');
      });
    }
};
shareSeriesToWechat = function(title,description,thumbData,url,type) {
    WeChat.share({
        title: title,
        description: description,
        thumbData: thumbData,
        url: url
    }, type, function () {
        /*var hotPosts = _.filter(Session.get('hottestPosts') || [], function(value) {
            return true;
        });
        if (hotPosts.length > 0){
            Router.go('/hotPosts/' + Session.get('postContent')._id);
        }*/
    }, function (reason) {
        // 分享失败
        if (reason === 'ERR_WECHAT_NOT_INSTALLED') {
            PUB.toast(TAPi18n.__("wechatNotInstalled"));
        } else {
            PUB.toast(TAPi18n.__("failToShare"));
        }
        console.log(reason);
    });
};

shareSeriesToQQ = function (title,description,imageUrl,url){
    var args = {};
    args.url = url;
    args.title = title;
    args.description = description;
    args.imageUrl = imageUrl;
    args.appName = TAPi18n.__("gst");
    YCQQ.shareToQQ(function(){
        console.log("share success");
        // var shareType = Session.get("shareToWechatType");
        // if(shareType[1] && shareType[1] == true){
        //     $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
        //     shareType[1] = false;
        //     Session.set("shareToWechatType",shareType);
        // }
    },function(reason){
        if (reason ==='QQ Client is not installed') {
            PUB.toast(TAPi18n.__("qqNotInstalled"));
        } else {
            PUB.toast(TAPi18n.__("failToShare"));
        }
    },args);
};
shareSeriesToQQZone = function (title,description,imageUrl,url){
  var args = {};
  args.url = url;
  args.title = title;
  args.description = TAPi18n.__("hotShareQQZoneShare");
  var imgs =[];
  imgs.push(imageUrl);
  args.imageUrl = imgs;
  YCQQ.shareToQzone(function () {
    console.log("share success");
    // var shareType = Session.get("shareToWechatType");
    // if(shareType[1] && shareType[1] == true){
    //     $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
    //     shareType[1] = false;
    //     Session.set("shareToWechatType",shareType);
    // }
  }, function (failReason) {
    console.log(failReason);
  }, args);
};
shareSeriesToSystem = function(title,description,thumbData,url) {
  window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
  downloadFromBCS(thumbData, function(result){
    if (result) {
      window.plugins.socialsharing.share(title, description, result, url);
    } else {
        PUB.toast(TAPi18n.__("failToGetPicAndTryAgain"));
    }
  });
};

serieShareTo = function(to,self){
  var title = self.ownerName +'的合辑《'+ self.title +'》';
  var description = ''
  var imageUrl = self.mainImage;
  var url = getSeriesSharingPath(self);
  if(to === 'QQShare'){
    return shareSeriesToQQ(title,title,imageUrl,url);
  }
  if(to === 'QQzoneShare'){
    return shareSeriesToQQZone(title,title,imageUrl,url);
  }
  if(to === 'system'){
    return shareSeriesToSystem(title,title,imageUrl,url);
  }

  window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
  downloadFromBCS(imageUrl, function(result){
    if (result) {
      if(to === 'WXSesssion'){
        shareSeriesToWXSession(title,description,result,url);
      } else if(to === "WXTimeline"){
        shareSeriesToWXTimeLine(title,description,result,url);
      }
    } else {
      PUB.toast(TAPi18n.__("failToGetPicAndTryAgain"));
    }
  });
};

Template.shareSeries.events({
  'click .share-series-btns li':function(e){
    console.log('share id is ')
    console.log(e.currentTarget.id)
    serieShareTo(e.currentTarget.id,Session.get('seriesContent'));
    $('.shareSeries').hide();
  },
  'click .cancelShareSeries':function(){
    $('.shareSeries').hide();
  },
  'click .shareSeries':function(){
    $('.shareSeries').hide();
  }
});
