//when come in to this page, add an array  "pub_Heart (like)" to pub in this post  if it has no  "pub_Heart"
Template.showPosts.onRendered(function () {
     if (Meteor.user()) {
          post = Session.get('postContent');
          for(i = 0; i < post.pub.length; i++){
            // this pic has no pub_Heart
              if(post.pub[i].isImage && typeof (post.pub[i].pub_Heart) == "undefined"){
                    post.pub[i].pub_Heart = [];
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
    "isMyLike" : function(userId){
        if(userId == Meteor.userId()){
            return true;
        }else{
            return false;
        }
    },

    "hasNoLike": function(pub_Heart){
        if(pub_Heart.length==0){
          return true;
        }
    }
});

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
            PUB.toast("无法获取故事标题图片，请稍后重试！");
            console.log(reason);

          });
        } else {
            PUB.toast("无法获取故事标题图片，请稍后重试！");
        }
      })
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

clickToLike = function(currentPost, current_imgId){
     for(i = 0; i < currentPost.pub.length; i++){
      if(currentPost.pub[i].pub_Heart && currentPost.pub[i].imgUrl === current_imgId){
            // has no like
        if(currentPost.pub[i].pub_Heart.length == 0){
                 addLike(currentPost, i);
        }else{
        for(k=0; k <currentPost.pub[i].pub_Heart.length; k++){
           //if has this img & has no like
          if(currentPost.pub[i].pub_Heart[k].like_userId != Meteor.userId()){
                 addLike(currentPost, i, k);
          }
           //if has my like so remove my like
           else if(currentPost.pub[i].pub_Heart[k].like_userId === Meteor.userId()){
               removeLike(currentPost, i, k);
            }
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
          //the count
            Session.set("likeCount", post.pub[i].pub_Heart.length);
            //the like
          if(post.pub[i].pub_Heart.length == 0){
              Session.set("hasLiked", false);
            }else if(post.pub[i].pub_Heart.length > 0){
                for(k=0; k <post.pub[i].pub_Heart.length; k++){
                   if(post.pub[i].pub_Heart[k].like_userId == Meteor.userId()){
                      Session.set("hasLiked", true);
                   }else{
                      Session.set("hasLiked", false);
                   }
              }
          }
        }
      }
  },500);
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



