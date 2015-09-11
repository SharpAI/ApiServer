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
      window.plugins.toast.showShortCenter("准备故事的主题图片，请稍等");

      height = $('.showPosts').height();
      $('#blur_overlay').css('height',height);
      $('#blur_overlay').css('z-index', 10000);

      downloadFromBCS(this.mainImage, function(result){
        console.log("url = "+url);
        $('#blur_overlay').css('height','');
        $('#blur_overlay').css('z-index', -1);

        if (result) {
            WeChat.share({
                title: "『故事贴』 "+ title,
                description: "『故事贴』 "+ title,
                thumbData: result,
                url: url
              }, WeChat.Scene.timeline, function () {
                PUB.toast("已成功分享~");
                console.log('分享成功~');
              }, function (reason) {
                // 分享失败
                console.log(reason);
                if (reason ==='ERR_WECHAT_NOT_INSTALLED') {
                    PUB.toast("未安装微信客户端，分享失败");
                } else {
                    PUB.toast("分享失败");
                }
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
      if (this.addontitle && (this.addontitle !=='')){
        title = title + '：' + this.addontitle;
      }
      window.plugins.toast.showShortCenter("准备故事的主题图片，请稍等");
      height = $('.showPosts').height();
      $('#blur_overlay').css('height',height);
      $('#blur_overlay').css('z-index', 10000);

      downloadFromBCS(this.mainImage, function(result){

        $('#blur_overlay').css('height','');
        $('#blur_overlay').css('z-index', -1);
        if (result) {
          WeChat.share({
            title: "故事贴",
            description: "『故事贴』 "+ title,
            thumbData: result,
            url: url
          }, WeChat.Scene.session, function () {
            console.log('分享成功~');
          }, function (reason) {
            // 分享失败
            if (reason ==='ERR_WECHAT_NOT_INSTALLED') {
              PUB.toast("未安装微信客户端，分享失败");
            } else {
              PUB.toast("分享失败");
            }
            console.log(reason);
          });
        } else {
            PUB.toast("无法获取故事标题图片，请稍后重试！");
        }
      })
    },
    'click #QQShare':function(e, t){
        var current = Router.current();
        var url = current.url;
        var postUrl;
        if(url.indexOf("http") > 0)
            postUrl = url.replace("meteor.local", server_domain_name);
        else
            postUrl = "http://" + server_domain_name +url;
        var title = this.title;
        console.log("URL is " + postUrl);
        var addontitle = this.addontitle;
        if (this.addontitle && (this.addontitle !=='')){
            title = title + '：' + this.addontitle;
        }
        window.plugins.toast.showShortCenter("分享中，请稍等");
        var args = {};
        args.url = postUrl;
        args.title = '故事贴';
        args.description = "『故事贴』 "+ title;
        args.imageUrl = this.mainImage;
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
