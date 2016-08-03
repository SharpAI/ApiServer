var mongoid = require('mongoid-js');
var filedownup = require('./file_downupload.js');
var async = require('async');
var showDebug = false;

function PostDrafts(id, user) {
  var drafts = [];
  var title = '';
  var addontitle = '';
  var successCallback = [];
  var localImgs = [];
  var _mainImage = '';
  
  var imageIndex = function () {
    if(drafts.length <= 0)
      return -1;
    for(var i=0;i<drafts.length;i++){
      if(drafts[i].type === 'image')
        return i;
    }
    return -1;
  };
  
  var getItems = function (type) {
    if(drafts.length <= 0)
      return [];
      
    var result = []
    for(var i=0;i<drafts.length;i++){
      if(drafts[i].type === type)
        result.push(drafts[i]);
    }
    return result;
  };
  
  var getItem = function(id) {
    if(drafts.length <= 0)
      return null;
      
    for(var i=0;i<drafts.length;i++){
      if(drafts[i]._id === id)
        return drafts[i];
    }
    return null;
  };
  
  var getItemIndex = function(id) {
    if(drafts.length <= 0)
      return -1;
      
    for(var i=0;i<drafts.length;i++){
      if(drafts[i]._id === id)
        return i;
    }
    return -1;
  };

  var postDrafts = new Object();
  postDrafts.onSuccess = function(callback){
    callback && successCallback.push(callback);
  };
  // onFail: function(callback){},
  postDrafts.itemProcessor = function(item, callback) {
    var self = this;
    if (item.type === 'text') {
      showDebug && console.log('Processing Text');
      showDebug && console.log(user)
      
      var draftItem = {
        type: 'text',
        toTheEnd: true,
        noKeyboardPopup: true,
        isImage: false,
        owner: user._id,
        text: item.text,
        // style: '',
        //layout: item.layout,
        data_row: '1',
        data_col: '1',
        data_sizex: '6',
        data_sizey: '1'
      };
      if(item.layout)
        draftItem.layout = item.layout;
      
      drafts.push(draftItem);
    } else if (item.type === 'image') {
      showDebug && console.log('Processing Image ' + item.imageUrl);
      if (item.imageUrl && item.imageUrl !== '') {
        return filedownup.seekSuitableImageFromArrayAndDownloadToLocal([item.imageUrl], function(file, w, h, found, index, total, source) {
          if (file){
            postDrafts.insertDownloadedImage(self.data, source, found, self.inputUrl, file, w, h);
            if(!_mainImage || _mainImage === 'http://data.tiegushi.com/res/defaultMainImage1.jpg')
              _mainImage = source;
          }

          return callback(null, item);
        }, 150, true, function(file){
          localImgs.push(file);
        });
      }
    } else if (item.type === 'iframe') {
        drafts.push({
        _id: mongoid(),
        type: 'image',
        isImage: true,
        inIframe: true,
        owner: user._id,
        toTheEnd: true,
        text: '您当前程序不支持视频观看',
        iframe: item.iframe,
        imgUrl: 'http://data.tiegushi.com/res/video_old_version.jpg',
        data_row: '1',
        data_col: '1',
        data_sizex: '6',
        data_sizey: '4'
      });
    } else if (item.type === 'music') {
      postDrafts.insertMusicInfo(item.musicInfo);
    } else if (item.type === 'video') {
      if (item.videoInfo.imageUrl) {
        return filedownup.seekSuitableImageFromArrayAndDownloadToLocal([item.videoInfo.imageUrl], function(file, w, h, found, index, total, source) {
          if (file) {
            item.videoInfo.imageUrl = 'cdvfile://localhost/persistent/' + file.name;
            item.videoInfo.filename = file.name;
            item.videoInfo.URI = file.toURL();
            insertVideoWithDownloadedImage(item.videoInfo, self.data, source, found, self.inputUrl, file, w, h);
          } else {
            postDrafts.insertVideoInfo(item.videoInfo);
          }
          return callback(null, item);
        }, 1, true, function(file){
          localImgs.push(file);
        });
      } else {
        postDrafts.insertVideoInfo(item.videoInfo);
      }
    }
    
    setTimeout(function() {
      callback && callback(null, item);
    }, 10);
  };
  postDrafts.insertVideoInfo = function(videoInfo, sizey){
    var data_sizey;
    if (sizey)
      data_sizey = sizey;
    else
      data_sizey = '4';
      
    showDebug && console.log("data_sizey is " + data_sizey);
    drafts.push({
      _id: mongoid(),
      type: 'video',
      owner: user._id,
      toTheEnd: true,
      text: '来自故事贴',
      videoInfo: videoInfo,
      data_row: '1',
      data_col: '1',
      data_sizex: '6',
      data_sizey: data_sizey
    });
  };
  postDrafts.insertMusicInfo = function(musicInfo){
    drafts.push({
      _id: mongoid(),
      type: 'music',
      owner: user._id,
      toTheEnd: true,
      text: '您当前程序不支持音频播放，请分享到微信中欣赏',
      musicInfo: musicInfo,
      data_row: '1',
      data_col: '1',
      data_sizex: '6',
      data_sizey: '1'
    });
  };
  postDrafts.insertDownloadedImage = function(linkInfo, imageExternalURL, found, inputUrl, file, width, height){
    var sizey, timestamp;
    if (file) {
      timestamp = new Date().getTime();
      if (imageIndex() !== -1) {
        drafts[imageIndex()].url = inputUrl;
      }
      sizey = Math.round(6 * height / width);
      if (sizey <= 0) {
        sizey = 1;
      }
      drafts.push({
        _id: mongoid(),
        type: 'image',
        isImage: true,
        siteTitle: linkInfo.title,
        siteHost: linkInfo.host,
        owner: user._id,
        imgUrl: imageExternalURL,//'cdvfile://localhost/persistent/' + file.name,
        filename: file.name,
        URI: file.toURL(),
        url: inputUrl,
        toTheEnd: true,
        data_row: '1',
        data_col: '1',
        data_sizex: '6',
        data_sizey: sizey.toString()
      });
    }
  };
  postDrafts.insertDefaultImage = function(linkInfo, mainImageUrl, found, inputUrl){
    var timestamp;
    if (mainImageUrl) {
      timestamp = new Date().getTime();
      if (imageIndex() !== -1) {
        drafts[imageIndex()].url = inputUrl;
      }
      drafts.push({
        _id: mongoid(),
        type: 'image',
        isImage: true,
        siteTitle: linkInfo.title,
        siteHost: linkInfo.host,
        owner: user._id,
        imgUrl: mainImageUrl,
        filename: mainImageUrl,
        URI: mainImageUrl,
        url: inputUrl,
        toTheEnd: true,
        data_row: '1',
        data_col: '1',
        data_sizex: '6',
        data_sizey: '6'
      });
    }
  };
  postDrafts.renderResortedArticleAsync = function(data, inputUrl, resortedObj){
    resortedObj.itemProcessor = postDrafts.itemProcessor;
    resortedObj.data = data;
    resortedObj.inputUrl = inputUrl;
    return async.mapLimit(data.resortedArticle, 1, resortedObj.itemProcessor.bind(resortedObj), function(err, results) {
      if(err)
        console.log('error ' + err);
      
      showDebug && console.log('results:', JSON.stringify(results));
      return postDrafts.processTitleOfPost(data);
    });
  };
  postDrafts.seekOneUsableMainImage = function(data, inputUrl){
    // console.log('data:' + JSON.stringify(data));
    var resortObj = {};
    filedownup.seekOneUsableMainImage(data, function(file, w, h, found, index, total, source) {
      showDebug && console.log('found ' + found + ' index ' + index + ' total ' + total + ' fileObject ' + file + ' source ' + source);
      if (file) {
        postDrafts.insertDownloadedImage(data, source, found, inputUrl, file, w, h);
        resortObj.mainUrl = source;
      } else {
        postDrafts.insertDefaultImage(data, 'http://data.tiegushi.com/res/defaultMainImage1.jpg', false, inputUrl);
      }
      if (data.resortedArticle && data.resortedArticle.length > 0 && data.resortedArticle[0].type === 'image' && data.resortedArticle[0].imageUrl === source)
        data.resortedArticle.splice(0, 1);
      if (data.resortedArticle && data.resortedArticle.length > 0) {
        resortObj.index = 0;
        resortObj.length = data.resortedArticle.length;
        showDebug && console.log('resortObj' + JSON.stringify(resortObj));
        postDrafts.renderResortedArticleAsync(data, inputUrl, resortObj);
      } else {
        postDrafts.processTitleOfPost(data);
      }
    }, 200, function(file){
      localImgs.push(file);
    });
  };
  postDrafts.processTitleOfPost = function(data){
    if(data.title){
      showDebug && console.log('Title is ' + data.title);
      if(!title || title === '')
        title = data.title
      if(!addontitle || addontitle === '')
        addontitle = '';
    }
    
    for(var i=0;i<successCallback.length;i++)
      successCallback[i]();       
  };
  postDrafts.uploadFiles = function(callback){
    var draftImageData = getItems('image');
    var draftMusicData = getItems('music');
    var draftVideoData = getItems('video');
    var draftToBeUploadedImageData = [];
    
    if(draftImageData.length > 0){
      for(var i=0;i<draftImageData.length;i++)
        draftToBeUploadedImageData.push(draftImageData[i]);
    }
    if(draftMusicData.length > 0){
      for(var i=0;i<draftMusicData.length;i++)
        draftToBeUploadedImageData.push(draftMusicData[i]);
    }
    if(draftVideoData.length > 0){
      for(var i=0;i<draftVideoData.length;i++)
        draftToBeUploadedImageData.push(draftVideoData[i]);
    }
    
    if(draftToBeUploadedImageData.length <= 0)
      return callback && callback();
      
    filedownup.multiThreadUploadFileWhenPublishInCordova(draftToBeUploadedImageData, null, function(err, result) {
      if(err || !result)
        return callback && callback('上传失败，请稍后重试');
      if(result.length < 1)
        return callback && callback('上传失败，请稍后重试');
        
      for(var i=0;i<result.length;i++){
        var item = result[i];
        if(item.uploaded && item._id){
          if(item.type === 'image' && item.imgUrl){
            drafts[getItemIndex(item._id)].imgUrl = item.imgUrl;
          } else if(item.type === 'music' && item.musicInfo && item.musicInfo.playUrl){
            if (!drafts[getItemIndex(item._id)].musicInfo)
              drafts[getItemIndex(item._id)].musicInfo = {};
            drafts[getItemIndex(item._id)].musicInfo.playUrl = item.musicInfo.playUrl;
          } else if(item.type === 'video' && item.videoInfo && item.videoInfo.imageUrl){
            if (!drafts[getItemIndex(item._id)].videoInfo)
              drafts[getItemIndex(item._id)].videoInfo = {};
            drafts[getItemIndex(item._id)].videoInfo.imageUrl = item.videoInfo.imageUrl;
          }
        }
      }
      
      setTimeout(function () {
        var tmps = [];
        if(localImgs.length > 0){
          for(var i=0;i<localImgs.length;i++){
            var insert = true;
            if(tmps.length>0){
              for(var ii=0;ii<tmps;ii++){
                if(tmps[ii] === localImgs[i]){
                  insert = false;
                  break;
                }
              }
            }
            if(insert)
              tmps.push(localImgs[i]);
          }
          if(tmps.length>0)
            filedownup.removeImagesFromCache(tmps);
        }
        // console.log('local tmp images:', JSON.stringify(localImgs));
        // filedownup.removeImagesFromCache(draftImageData)
      }, 0);
      
      // console.log('uploadFiles.');
      callback && callback();
    });
  };
  postDrafts.getPubObject = function(){
    var pub = [];
    var modalUserId = user._id;
    var ownerUser = user;
    var ownerIcon = ownerUser.profile && ownerUser.profile.icon ? ownerUser.profile.icon : '/userPicture.png';
    var ownerName = ownerUser.profile && ownerUser.profile.fullname ? ownerUser.profile.fullname : ownerUser.username;
    var draftData = drafts;
    var postId = id;
    var fromUrl = draftData[0].url;
    var mainImage = '';
    var mainImageStyle = '';

    // Save gridster layout first. If publish failed, we can recover the drafts
    for(var i=0;i<draftData.length;i++){
      if(i === 0){
        if (draftData[i].uploaded === true && draftData[i].imgUrl)
          mainImage = draftData[i].imgUrl;
        else if (_mainImage)
          mainImage = _mainImage;
        else
          mainImage = "http://data.tiegushi.com/res/defaultMainImage1.jpg";

        mainImageStyle = draftData[i].style;
      }else{
        pub.push(draftData[i]);
      }
    }
    
    var sortBy = function(key, a, b, r) {
      r = r ? 1 : -1;
      if (a[key] && b[key] && a[key] > b[key])
        return -1 * r;
      if (a[key] && b[key] && a[key] < b[key])
        return +1 * r;
      if (!a[key] && b[key])
        return +1 * r;
      if (a[key] && !b[key])
        return -1 * r;

      return 0;
    };
    
    // pub.sort(function(a, b) {
    //   sortBy('data_row', a, b);
    // });
    
    return {
      pub:pub,
      title:title,
      heart:[],  // 点赞
      retweet:[],// 转发
      comment:[], // 评论
      addontitle:addontitle,
      mainImage: mainImage,
      mainImageStyle:mainImageStyle,
      mainText: '',
      fromUrl: fromUrl,
      publish:true,
      owner:ownerUser._id,
      ownerName:ownerName,
      ownerIcon:ownerIcon,
      createdAt: new Date()
    };
  };
  postDrafts.destroy = function(){
    
  }

  var insertVideoWithDownloadedImage = function(videoInfo, linkInfo, imageExternalURL, found, inputUrl, file, width, height){
    var sizey;
    if (file) {
      sizey = Math.round(6 * height / width);
      if (sizey <= 0)
        sizey = 1;

      return postDrafts.insertVideoInfo(videoInfo, sizey.toString());
    }
  };
  
  return postDrafts;
}

module.exports = {
  createDrafts: function(postId, user) {
    showDebug && console.log(postId , user)
    return new PostDrafts(postId, user);
  }
};
