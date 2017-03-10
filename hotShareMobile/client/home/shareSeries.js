// self = Session.get('seriesContent)
getSeriesSharingPath = function(data){
  var url = "http://" + server_domain_name +'/series/'+data._id;
  return url;
};

shareSeriesToWXTimeLine = function(title,description,thumbData,url){
    shareSeriesToWechat(title,description,thumbData,url,WeChat.Scene.timeline);
};
shareSeriesToWXSession = function(title,description,thumbData,url) {
    shareSeriesToWechat(title,description,thumbData,url,WeChat.Scene.session);
};
shareSeriesToWechat = function(title,description,thumbData,url,type) {
    window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
    downloadFromBCS(thumbData, function(result){
      if (result) {
        WeChat.share({
            title: title,
            description: description,
            thumbData: result,
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
      } else {
          PUB.toast(TAPi18n.__("failToGetPicAndTryAgain"));
      }
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
  var imageUrl = self.mainImage;
  var url = getSeriesSharingPath(self);
  if(to === 'WXSesssion'){
    shareSeriesToWXSession(title,title,imageUrl,url);
  }
  if(to === "WXTimeline"){
    shareSeriesToWXTimeLine(title,title,imageUrl,url);
  }
  if(to === 'QQShare'){
    shareSeriesToQQ(title,title,imageUrl,url);
  }
  if(to === 'QQzoneShare'){
    shareSeriesToQQZone(title,title,imageUrl,url);
  }
  if(to === 'system'){
    shareSeriesToSystem(title,title,imageUrl,url);
  }
};

Template.shareSeries.events({
  'click .share-series-btns li':function(e){
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
