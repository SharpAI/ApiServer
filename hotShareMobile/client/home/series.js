var updateOrInsertSeries = function(isNewSeries,publish){
  if($('#seriesTitle').val() === ''){
    return PUB.toast('请输入标题');
  }
  if($(".series-post-item").length === 0){
    return PUB.toast('请至少添加一个故事')
  }
  var title = $('#seriesTitle').val();
  var posts = []
  var mainImage = $('.series-title').data('image');
  var owner = Meteor.user();
  var ownerName = owner.profile.fullname ? owner.profile.fullname: owner.username;
  var ownerIcon = owner.profile.icon
  var num = 0;
  $('.series-post-item').each(function(index){
    posts.push({
        postId:$(this).attr('id'),
        postTitle: $(this).data('title'),
        postAddonTitle: $(this).data('addontitle'),
        postMainImage: $(this).data('image'),
        postIndex: num,
        postOwner: owner._id,
        postOwnerName: ownerName,
        postOwnerIcon: ownerIcon
    });
    num++;
  });
  if(isNewSeries){
    Series.insert({
        title: title,
        mainImage: mainImage,
        owner: owner._id,
        ownerName: ownerName,
        ownerIcon: ownerIcon,
        createdAt: new Date(),
        postLists: posts,
        publish: publish
    },function(err,_id){
      if(err){
        console.log('insert series ERR=',err)
      } else {
        console.log('insert series successed ,ID=',_id)
      }
    });
  } else {
    console.log('update series')
    Series.update({
      _id: Session.get('seriesId')
    },{
      $set:{
        title: title,
        mainImage: mainImage,
        postLists: posts,
        updateAt: new Date(),
        publish: true
      }
    },function(err,num){
      if(err){
        console.log('update series ERR=',err)
      } else {
        console.log('update series successed ,num=',num)
      }
    });
  }
  Session.set('seriesId','');
  Session.set('seriesContent','');
  Session.set('isSeriesEdit',false);
  Router.go('/seriesList');
}
Template.series.helpers({
  postsLists: function(){
    if(Session.get('seriesContent')){
      return Session.get('seriesContent').postLists
    }
  },
  isSeriesEdit: function(){
    return Session.equals('isSeriesEdit',true);
  },
  postCounts: function(){
    var seriesContent = Session.get('seriesContent')
    return (seriesContent && seriesContent.postLists)?seriesContent.postLists.length : 0
  },
  seriesTitle: function(){
    if(Session.get('seriesContent') && Session.get('seriesContent').title){
      return Session.get('seriesContent').title;
    } else {
      return "";
    }
  },
  mainImage: function() {
    if(Session.get('seriesContent') && Session.get('seriesContent').mainImage){
      return Session.get('seriesContent').mainImage;
    } else {
      return 'http://data.tiegushi.com/ocmainimages/mainimage5.jpg';
    }
  },
  showPublishBtn: function(){
    if(Session.get('seriesContent')){
      return !Session.get('seriesContent').publish && Template.series.__helpers.get('postCounts')()
    } else {
      return true;
    }
  }
});

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
    window.plugins.socialsharing.share(title, description, thumbData, url);
};

Template.series.events({
  'click #WXSessionShare': function(e,t){
    var seriesContent = Session.get('seriesContent');
    shareSeriesToWXSession(seriesContent.title,seriesContent.title,seriesContent.mainImage,getSeriesSharingPath(seriesContent));
  },
  'click #WXTimelineShare': function(e,t){
    console.log('WXTimelineShare');
    var seriesContent = Session.get('seriesContent');
    shareSeriesToWXTimeLine(seriesContent.title,seriesContent.title,seriesContent.mainImage,getSeriesSharingPath(seriesContent));
  },
  'click #QQShare': function(e,t){
    console.log('QQShare');
    var seriesContent = Session.get('seriesContent');
    shareSeriesToQQ(seriesContent.title,seriesContent.title,seriesContent.mainImage,getSeriesSharingPath(seriesContent));
  },
  'click #shareSeriesToQQZone': function(e,t){
    console.log('QQZoneShare');
    var seriesContent = Session.get('seriesContent');
    shareSeriesToWXTimeLine(seriesContent.title,seriesContent.title,seriesContent.mainImage,getSeriesSharingPath(seriesContent));
  },
  'click #socialShare': function(e,t){
    console.log('socialShare');
    var seriesContent = Session.get('seriesContent');
    shareSeriesToSystem(seriesContent.title,seriesContent.title,seriesContent.mainImage,getSeriesSharingPath(seriesContent));
  },
  'click .back': function(e,t){
    if(!Session.get('seriesIsSaved') && Session.get('isSeriesEdit')){
       if(Session.get('seriesId') && Session.get('seriesId') !== ''){
        navigator.notification.confirm('这个操作无法撤销', function(r){
          if(r !== 1){
            updateOrInsertSeries(false,true);
          }
          Router.go('/seriesList');
        },'您确定要放弃未保存的修改吗？', ['放弃修改','保存修改']);
       } else {
        navigator.notification.confirm('这个操作无法撤销', function(r){
          if(r == 1){
            Session.set('seriesContent','');
            Router.go('/seriesList');
          }
        },'您确定要放弃未保存的修改吗？', ['放弃修改','继续编辑']);
       }
    }else{
      Router.go('/seriesList');
    }
  },
  'click #edit': function(e,t){
    return Session.set('isSeriesEdit',true);
  },
  'click #save':function(){
    Session.set('seriesIsSaved',true);
  },
  'click .editAndAddNew': function(e,t){
    Session.set('isSeriesEdit',true);
    Session.set('seriesIsSaved',false);
    $('.author-self-posts').toggle();
  },
  'click #seriesTitle':function(e,t){
    e.preventDefault();
    e.stopPropagation();
    $(this).focus();
    Session.set('seriesIsSaved',false);
  },
  'click .series-title':function(){
    $('.mainImageTools').toggle();
  },
  'click .imageToolBtn': function(e,t){
    $('.mainImageTools').hide();
    if(e.currentTarget.id === 'useOfficalImage'){
      $('#seriesTitle').hide();
      $('.mainImagesList').show();
    } else {
      Meteor.defer(function() {
        selectMediaFromAblum(1, function(cancel, result) {
          var data;
          if (cancel) {
            PUB.back();
            return;
          }
          if (result) {
            data = [
              {
                type: 'image',
                isImage: true,
                owner: Meteor.userId(),
                imgUrl: result.smallImage,
                filename: result.filename,
                URI: result.URI,
                layout: ''
              }
            ];
            return multiThreadUploadFileWhenPublishInCordova(data, null, function(err, result) {
              var i, item, len;
              if (!result) {
                window.plugins.toast.showShortBottom('上传失败，请稍后重试');
                return;
              }
              if (result.length < 1) {
                window.plugins.toast.showShortBottom('上传失败，请稍后重试');
                return;
              }
              for (i = 0, len = result.length; i < len; i++) {
                item = result[i];
                if (item.uploaded) {
                  if (item.type === 'image' && item.imgUrl) {
                    var seriesContent = Session.get('seriesContent');
                    seriesContent.mainImage = item.imgUrl
                    Session.set('seriesContent',seriesContent);
                  }
                }
              }
              if (err) {
                window.plugins.toast.showShortBottom('上传失败，请稍后重试');
                return;
              }
              return removeImagesFromCache(data);
            });
          }
        });
      });
    }
  },
  'click .series-post-item': function(e,t){
    $(e.currentTarget).toggleClass('series-post-item-not-select');
    return $(e.currentTarget).toggleClass('series-post-item-select');
  },
  'click .addNewPost': function(){
    Session.set('seriesIsSaved',false);
    $('.author-self-posts').toggle();
  },
  'click .has-dropdown, click .series-dropdown': function(){
    $('.series-dropdown').toggle();
  },
  'click #removeSelected': function(e,t){
    if($(".series-post-item-select").length === 0){
      return PUB.toast('请至少选择一个要删除故事')
    }
    Session.set('seriesIsSaved',false);
    var seriesContent = Session.get('seriesContent')
    var postLists = [];

    $('.series-post-item-not-select').each(function(index){
      postLists.push({
        postId:$(this).attr('id'),
        postMainImage: $(this).data('image'),
        postTitle:$(this).data('title'),
        postIndex: $(this).data('index')
      });
    });
    $('.series-post-item').removeClass('series-post-item-select');
    console.table(postLists)
    seriesContent.postLists = postLists;
    Session.set('seriesContent',seriesContent);
  },
  'click .viewModal':function(e,t){
    Session.set('fromSeries', {status: true, id: Session.get('seriesId')});
    return Router.go('/posts/'+e.currentTarget.id);
  },
  'click #del':function(e,t){
    Series.remove({_id: Session.get('seriesId')});
    Router.go ('/seriesList');
  },
  'click .publish':function(e,t){
    if(Session.get('seriesId') && Session.get('seriesId') !== ''){
      updateOrInsertSeries(false,true);
    } else {
      updateOrInsertSeries(true,true);
    }
  }
});
