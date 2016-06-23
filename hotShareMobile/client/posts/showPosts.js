//when come in to this page, add an array  "pub_Heart (like)" to pub in this post  if it has no  "pub_Heart"
/*
Template.showPosts.onRendered(function () {
     if (Meteor.user()) {
          post = Session.get('postContent');
          for(i = 0; i < post.pub.length; i++){
            // this pic has no pub_Heart
              if(post.pub[i].isImage && typeof (post.pub[i].pub_Heart) == "undefined"){
                    post.pub[i].pub_Heart = [];
                    post.pub[i].like_Count = post.pub[i].pub_Heart.length
                    Posts.update({
                          _id: post._id
                     }, {
                    $set: {
                          pub:  post.pub
                    }
                    });
              }

          }
     }
});
Template.showPosts.helpers({
    "isMyLike" : function(pub_Heart){
     isMy = false;
        for(i=0; i<pub_Heart.length; i++){
            if(pub_Heart[i].like_userId === Meteor.userId()){
                isMy = true;
                break;
            }else{
                isMy = false;
            }
        }
        return isMy;
    }
});
 */
// Template.postFooter.helpers({
//   postFootContainer:function(){
//      if(document.getElementById('commitMsg') == document.activeElement){
//        return "commitHide"
//      }else{
//        return "commitShow"
//      }
//   },
//   commitContainer:function(){
//      if(document.getElementById('commitMsg') == document.activeElement){
//        return "commitShow"
//      }else{
//        return "commitHide"
//      }
//   }
// });

// Template.postFooter.events({
//   "click #postFooter .toCommit": function(){
//     $('.commitHide').fadeIn(400);
//     $('.commitShow').fadeOut(400);
//     $('#commitMsg').focus();
//   },
//    "click #sendMsg": function(){
//     $('#commitMsg').blur();
//     $('.commitHide').fadeOut(400);
//     $('.commitShow').fadeIn(400);
//   },
//    "click .refresh": function(){
//       $('#commitMsg').focus();
//    }
// });
getSharingTitle = function(self){
    var title = self.title;
    if (self.addontitle && (self.addontitle !=='')){
        title = title + '：' + self.addontitle;
    }
    return title;
};
getPostSharingPath = function(){
    var url = "http://" + server_domain_name +'/'+Session.get('channel');
    return url;
};
getFirstParagraph = function(){
    var patagraphLength = Session.get('postContent').pub.length;
    var invalidString = "您当前程序不支持视频观看";
    if (patagraphLength > 0 && patagraphLength < 2) {
      var textArr = Session.get('postContent').pub;
      for (var i = 0; i < patagraphLength; i++){
        if(textArr[i].text == invalidString) {
        //   console.log(textArr[i].text);
          var text = "来自故事贴";
          return text;
        }else if(textArr[i].text){
          return textArr[i].text.substring(0, 100);
        }
      }
    }else if(patagraphLength >= 2){
      var textArr = Session.get('postContent').pub;
      for (var i = 0; i < patagraphLength; i++){
        if(textArr[i].text && textArr[i].text != invalidString){
          return textArr[i].text.substring(0, 100);
        }
      }
    }else{
      return null;
    }
};

shareToWechatSession = function (title, description, thumbData, url) {
  var param = {
      "title": title,
      "summary":  description,
      "image_url": thumbData,
      "target_url": url
    }
  if (device.platform === 'Android') {
      shareToWechat(title,description,thumbData,url,WeChat.Scene.session);
    //   return WechatShare.shareToSession(param, function(e) {
    //     return window.PUB.toast('分享成功!');
    //   }, function(e) {
    //     return window.PUB.toast('分享失败!你安装微信了吗？');
    //   });
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
        window.PUB.toast('分享成功!');
      }, function() {
        window.PUB.toast('分享失败!你安装微信了吗？');
      });
    }
}

shareToWechatTimeLine = function (title, description, thumbData, url) {
    var param = {
      "title": title,
      "summary":  description,
      "image_url": thumbData,
      "target_url": url
    }
    if (device.platform === 'Android') {
        shareToWechat(title,description,thumbData,url,WeChat.Scene.timeline);
    //   WechatShare.shareToMoment(param, function(e) {
    //     window.PUB.toast('分享成功!');
    //   });
    //   return function(e) {
    //     window.PUB.toast('分享失败!你安装微信了吗？');
    //   };
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
        window.PUB.toast('分享成功!');
      }, function() {
        window.PUB.toast('分享失败!你安装微信了吗？');
      });
    }
 }

shareToWXTimeLine = function(title,description,thumbData,url){
    shareToWechat(title,description,thumbData,url,WeChat.Scene.timeline);
};
shareToWXSession = function(title,description,thumbData,url) {
    shareToWechat(title,description,thumbData,url,WeChat.Scene.session);
};
shareToWechat = function(title,description,thumbData,url,type) {
    WeChat.share({
        title: title,
        description: description,
        thumbData: thumbData,
        url: url
    }, type, function () {
        console.log('分享成功~');
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
shareToQQ = function (title,description,imageUrl,url){
    var args = {};
    args.url = url;
    args.title = title;
    args.description = description;
    args.imageUrl = imageUrl;
    args.appName = TAPi18n.__("gst");
    YCQQ.shareToQQ(function(){
        console.log("share success");
    },function(reason){
        if (reason ==='QQ Client is not installed') {
            PUB.toast(TAPi18n.__("qqNotInstalled"));
        } else {
            PUB.toast(TAPi18n.__("failToShare"));
        }
    },args);
};
shareToQQZone = function (title,description,imageUrl,url){
  var args = {};
  args.url = url;
  args.title = title;
  args.description = TAPi18n.__("hotShareQQZoneShare");
  var imgs =[];
  imgs.push(imageUrl);
  args.imageUrl = imgs;
  YCQQ.shareToQzone(function () {
    console.log("share success");
  }, function (failReason) {
    console.log(failReason);
  }, args);
};
shareToSystem = function(title,description,thumbData,url) {
    window.plugins.socialsharing.share(title, description, thumbData, url);
};
// To could be
// WXTimeLine, WXSession, QQShare, QQZoneShare, System
shareTo = function(to,self,index){
    var url = getPostSharingPath();
    var title = getSharingTitle(self);
    var description = null;
    var firstParagraph = getFirstParagraph();
    console.log(firstParagraph);
    if(index !== undefined) {
        var text =Session.get('postContent').pub[index].text;
        url = url + '/' + index;
        description = text;
        if(!description || description ===''){
            description = undefined;
        } else if(description.length > 100){
            description = description.substring(0, 100);
        }
    }
    window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));

    var post = Session.get('postContent');
    Feeds.insert({
      "owner": Meteor.user()._id,
      "ownerName": Meteor.user().profile.fullname || Meteor.user().username,
      "ownerIcon" : Meteor.user().profile.icon,
      "eventType" : "share",
      "postId" : post._id,
      "postTitle" : post.title,
      "addontitle" : post.addontitle,
      "pindex" : index,
      "mainImage" : post.mainImag,
      "createdAt" : new Date(),
      "heart" : 0,
      "retweet" : 0,
      "comment" : 0,
      "followby" : post.owner,
      "checked" : false
    }, function (err, _id) {
      //alert(err);
    });

    var height = $('.showPosts').height();
    $('#blur_overlay').css('height',height);
    $('#blur_overlay').css('z-index', 10000);
    if (to ==='QQZoneShare'){
        $('#blur_overlay').css('height','');
        $('#blur_overlay').css('z-index', -1);
        if(description){
            shareToQQZone(title,description,self.mainImage,url);
        } else if(firstParagraph){
            shareToQQZone(title,firstParagraph,self.mainImage,url);
        } else {
            shareToQQZone(title,title,self.mainImage,url);
        }
        return;
    }
    if (to ==='QQShare'){
        $('#blur_overlay').css('height','');
        $('#blur_overlay').css('z-index', -1);
        if(description){
//            shareToQQ("分享『故事贴』中的一段文字：",description,self.mainImage,url);
            shareToQQ(title,description,self.mainImage,url);
        } else if(firstParagraph){
//            shareToQQ("分享『故事贴』中的一篇文章：",title,self.mainImage,url);
            shareToQQ(title,firstParagraph,self.mainImage,url);
        } else {
          shareToQQ(title,title,self.mainImage,url);
        }
        return;
    }
    downloadFromBCS(self.mainImage, function(result){
        console.log("url = "+url);
        $('#blur_overlay').css('height','');
        $('#blur_overlay').css('z-index', -1);

        if (result) {
            if(to ==='WXTimeLine'){
              if (description) {
                shareToWechatTimeLine(description, description, result, url);
              } else if (firstParagraph) {
                    shareToWechatTimeLine( title, firstParagraph,result,url);
               } else{
//                    shareToWXTimeLine("『故事贴』 "+ title,"『故事贴』 "+ title,result,url);
                    shareToWechatTimeLine( title, title,result,url);
                }
            } else if (to ==='WXSession'){
                if(description){
//                    shareToWXSession("分享『故事贴』中的一段文字：",description,result,url);
                    shareToWechatSession(title,description,result,url);
                } else if (firstParagraph) {
                    shareToWechatSession( title, firstParagraph,result,url);
               }  else {
                    shareToWechatSession(title,title,result,url);
//                    shareToWXSession("分享『故事贴』中的一篇文章：",title,result,url);
                }
            } else if (to ==='System'){
                if(description){
                    shareToSystem(title, description, result, url)
//                    shareToSystem("分享『故事贴』中的一段文字：", description, result, url)
                } else {
//                    shareToSystem("『故事贴』 "+title, null, result, url)
                    shareToSystem(title, null, result, url)
                }
            }
        } else {
            PUB.toast(TAPi18n.__("failToGetPicAndTryAgain"));
        }
    })
};
Template.showPosts.events({
    'click #WXTimelineShare':function(e, t){
        shareTo('WXTimeLine',this);
        Session.set("shareToWechatType","WXTimeLine")
        $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
    },
    'click #WXSessionShare':function(e, t){
        shareTo('WXSession',this);
        Session.set("shareToWechatType","WXSession")
        $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
    },
    'click #QQShare':function(e, t){
        shareTo('QQShare',this);
        Session.set("shareToWechatType","QQShare")
        $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
    },
    'click #QQZoneShare':function(e, t){
        shareTo('QQZoneShare',this);
        Session.set("shareToWechatType","QQZoneShare")
        $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
    },
    'click #socialShare':function(e, t){
        shareTo('System',this);
        Session.set("shareToWechatType","System")
        $('.shareTheReadingRoom,.shareAlertBackground').fadeIn(300)
    },
    'click  .like_img' : function(e){
           if (Meteor.user()) {
              post = Session.get('postContent');
              img_id = $(e.currentTarget).parent().prev().attr('data-original');
              clickToLike(post, img_id);
           }
       e.stopPropagation();
    }
});
Template.shareTheReadingRoom.events({
  'click .shareAlertBackground': function() {
    return $('.shareTheReadingRoom,.shareAlertBackground').fadeOut(300);
  },
  'click .btnNo': function() {
    return $('.shareTheReadingRoom,.shareAlertBackground').fadeOut(300);
  },
  'click .btnYes': function() {
    var type;
    var url = 'http://'+chat_server_url+'/channel/'+ Session.get('postContent')._id+'/userid/'+Meteor.userId();
    var shareUrl = 'http://' + chat_server_url + '/channel/' + Session.get('postContent')._id;
    var imgUrl = Session.get('postContent').mainImage ? Session.get('postContent').mainImage : 'http://cdn.tiegushi.com/images/logo.png';
    var title = Session.get('postContent').title ? Session.get('postContent').title + '－专属聊天室' : '故事贴专属聊天室';
    var type = Session.get("shareToWechatType");
    $('.shareTheReadingRoom,.shareAlertBackground').fadeOut(300);
    if (type === "WXTimeLine") {
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        return downloadFromBCS(imgUrl, function(result) {
            if (result) {
                shareToWechatTimeLine(title, '来自故事贴', result, shareUrl);
            } else {
                PUB.toast(TAPi18n.__('failToGetPicAndTryAgain'));
            }
        });
    } else if (type === "WXSession"){
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        return downloadFromBCS(imgUrl, function(result) {
        if (result) {
            shareToWechatSession(title, '来自故事贴', result, shareUrl);
        } else {
            PUB.toast(TAPi18n.__('failToGetPicAndTryAgain'));
        }
      });
    } else if (type === "QQShare"){
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        return shareToQQ(title, "来自故事贴",imgUrl,shareUrl);
    } else if (type === "QQZoneShare"){
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        return shareToQQZone(title, "来自故事贴",imgUrl,shareUrl);
    } else if (type === "System"){
        window.plugins.toast.showShortCenter(TAPi18n.__("preparePicAndWait"));
        return downloadFromBCS(imgUrl, function(result) {
            if (result) {
                shareToSystem(title, '来自故事贴', result, shareUrl);
            } else {
                PUB.toast(TAPi18n.__('failToGetPicAndTryAgain'));
            }
        });
    }
  }
});
Template.shareRoom.events({
  'click .share-room': function() {
    Session.set("mynewpostId","")
    return $('.share-room,.share-room-background').fadeOut(300);
  },
  'click .share-room-background': function() {
    Session.set("mynewpostId","")
    return $('.share-room,.share-room-background').fadeOut(300);
  }
});
/*
clickToLike = function(currentPost, current_imgId){
    index = -1;
    isMyliked = false;
      for(i = 0; i < currentPost.pub.length; i++){
          if(currentPost.pub[i].pub_Heart && currentPost.pub[i].imgUrl === current_imgId){
               if(currentPost.pub[i].pub_Heart.length == 0){
                       addLike(currentPost, i);
              }else{
                  for(k=0; k <currentPost.pub[i].pub_Heart.length; k++){
                     if(currentPost.pub[i].pub_Heart[k].like_userId === Meteor.userId()){
                            isMyliked = true;
                            index = k;
                            break;
                     }else{
                            isMyliked = false;
                     }
                  }
                  if(isMyliked){
                      removeLike(currentPost, i, index);
                  }else{
                      addLike(currentPost, i);
                  }
              }
          }
      }
};

addLike = function(currentPost, pubNum){
    currentPost.pub[pubNum].pub_Heart.push({
        like_userId : Meteor.userId(),
        like_createdAt : new Date()
      });
    currentPost.pub[pubNum].like_Count++;
    Posts.update({
      _id: currentPost._id
     }, {
      $set: {
        pub: currentPost.pub
      }
    });
};
removeLike = function(currentPost, pubNum, heartNum){
  currentPost.pub[pubNum].pub_Heart.splice(heartNum, 1);
  currentPost.pub[pubNum].like_Count--;
  Posts.update({
      _id: currentPost._id
     }, {
      $set: {
        pub: currentPost.pub
      }
    });
};

ifIsCurrentLike = function(){
  Meteor.setTimeout (function(){
      post = Session.get('postContent');
      currentImgId = $('.current img').attr("src");
      //alert(currentImgId);
      for(i = 0; i < post.pub.length; i++){
        if(post.pub[i].imgUrl === currentImgId){
            //the like
          if(post.pub[i].pub_Heart.length == 0){
              Session.set("hasLiked", false);
              $(".big_like").attr("src", "/img/b_unlike.png");
            }else if(post.pub[i].pub_Heart.length > 0){
                for(k=0; k <post.pub[i].pub_Heart.length; k++){
                   if(post.pub[i].pub_Heart[k].like_userId == Meteor.userId()){
                      Session.set("hasLiked", true);
                      $(".big_like").attr("src", "/img/b_like.png");
                   }else{
                      Session.set("hasLiked", false);
                      $(".big_like").attr("src", "/img/b_unlike.png");
                   }
              }
          }
        }
      }
  },250);
};

addDynamicTemp = function(){
    Meteor.setTimeout (function(){
            dynamic = new Iron.DynamicTemplate();
            dynamic.insert({el: '#swipebox-overlay'});
            dynamic.template('bottomLike');
    },10);
};

removeDynamicTemp = function(){
    dynamic.clear();
};
*/
