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
            PUB.toast("未安装微信客户端，分享失败");
        } else {
            PUB.toast("分享失败");
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
    args.appName = "故事贴";
    YCQQ.shareToQQ(function(){
        console.log("share success");
    },function(reason){
        if (reason ==='QQ Client is not installed') {
            PUB.toast("未安装QQ客户端，分享失败");
        } else {
            PUB.toast("分享失败");
        }
    },args);
};
shareToSystem = function(title,description,thumbData,url) {
    window.plugins.socialsharing.share(title, description, thumbData, url);
};
// To could be
// WXTimeLine, WXSession, QQShare, System
shareTo = function(to,self,index){
    var url = getPostSharingPath();
    var title = getSharingTitle(self);
    var description = null;
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
    window.plugins.toast.showShortCenter("准备故事的主题图片，请稍等");

    var height = $('.showPosts').height();
    $('#blur_overlay').css('height',height);
    $('#blur_overlay').css('z-index', 10000);
    if (to ==='QQShare'){
        $('#blur_overlay').css('height','');
        $('#blur_overlay').css('z-index', -1);
        if(description){
            shareToQQ("分享『故事贴』中的一段文字：",description,self.mainImage,url);
        } else{
            shareToQQ("分享『故事贴』中的一篇文章：",title,self.mainImage,url);
        }
        return;
    }
    downloadFromBCS(self.mainImage, function(result){
        console.log("url = "+url);
        $('#blur_overlay').css('height','');
        $('#blur_overlay').css('z-index', -1);

        if (result) {
            if(to ==='WXTimeLine'){
                if (description){
                    shareToWXTimeLine(description,description,result,url);
                } else {
//                    shareToWXTimeLine("『故事贴』 "+ title,"『故事贴』 "+ title,result,url);
                    shareToWXTimeLine( title, title,result,url);
                }
            } else if (to ==='WXSession'){
                if(description){
                    shareToWXSession("分享『故事贴』中的一段文字：",description,result,url);
                } else {
                    shareToWXSession("分享『故事贴』中的一篇文章：",title,result,url);
                }
            } else if (to ==='System'){
                if(description){
                    shareToSystem("分享『故事贴』中的一段文字：", description, result, url)
                } else {
//                    shareToSystem("『故事贴』 "+title, null, result, url)
                    shareToSystem(title, null, result, url)
                }
            }
        } else {
            PUB.toast("无法获取故事标题图片，请稍后重试！");
        }
    })
};
Template.showPosts.events({
    'click #WXTimelineShare':function(e, t){
        shareTo('WXTimeLine',this);
    },
    'click #WXSessionShare':function(e, t){
        shareTo('WXSession',this);
    },
    'click #QQShare':function(e, t){
        shareTo('QQShare',this);
    },
    'click #socialShare':function(e, t){
        shareTo('System',this);
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
