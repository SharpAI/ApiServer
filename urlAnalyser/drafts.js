var mongoid = require('mongoid-js');
var filedownup = require('./file_downupload.js');
var async = require('async');
var drafts;

drafts = (function() {
  var insertVideoWithDownloadedImage, _addontitle, _drafts, _getItem, _getItemIndex, _getItems, _imageIndex, _successCallback, _title;
  var user = null;
  var postId = null;

  _drafts = [];

  _title = '';

  _addontitle = '';

  _successCallback = [];

  function drafts(id, u) {
    postId = id;
    user = u;
  }

  _imageIndex = function() {
    var i, _i, _ref;
    if (_drafts.length <= 0) {
      return -1;
    }
    for (i = _i = 0, _ref = _drafts.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (_drafts[i].type === 'image') {
        return i;
      }
    }
    return -1;
  };

  _getItems = function(type) {
    var i, result, _i, _ref;
    if (_drafts.length <= 0) {
      return [];
    }
    result = [];
    for (i = _i = 0, _ref = _drafts.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (_drafts[i].type === type) {
        result.push(_drafts[i]);
      }
    }
    return result;
  };

  _getItem = function(id) {
    var i, _i, _ref;
    if (_drafts.length <= 0) {
      return null;
    }
    for (i = _i = 0, _ref = _drafts.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (_drafts[i]._id === id) {
        return _drafts[i];
      }
    }
    return null;
  };

  _getItemIndex = function(id) {
    var i, _i, _ref;
    if (_drafts.length <= 0) {
      return -1;
    }
    for (i = _i = 0, _ref = _drafts.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (_drafts[i]._id === id) {
        return i;
      }
    }
    return -1;
  };

  drafts.prototype.onSuccess = function(callback) {
    return callback && _successCallback.push(callback);
  };

  drafts.prototype.onFail = function(callback) {};

  drafts.prototype.itemProcessor = function(item, callback) {
    var imageArray, self;
    if (item.type === 'text') {
      console.log('Processing Text');
      console.log(user)
      _drafts.push({
        type: 'text',
        toTheEnd: true,
        noKeyboardPopup: true,
        isImage: false,
        owner: user._id,
        text: item.text,
        style: '',
        layout: item.layout,
        data_row: '1',
        data_col: '3',
        data_sizex: '6',
        data_sizey: '1'
      });
    } else if (item.type === 'image') {
      console.log('Processing Image ' + item.imageUrl);
      self = this;
      if (item.imageUrl && item.imageUrl !== '') {
        imageArray = [];
        imageArray.push(item.imageUrl);
        return filedownup.seekSuitableImageFromArrayAndDownloadToLocal(imageArray, function(file, w, h, found, index, total, source) {
          if (file) {
            drafts.prototype.insertDownloadedImage(self.data, source, found, self.inputUrl, file, w, h);
          }
          return callback(null, item);
        }, 150, true);
      }
    } else if (item.type === 'iframe') {
      _drafts.push({
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
        data_col: '3',
        data_sizex: '6',
        data_sizey: '4'
      });
    } else if (item.type === 'music') {
      this.insertMusicInfo(item.musicInfo);
    } else if (item.type === 'video') {
      self = this;
      if (item.videoInfo.imageUrl) {
        imageArray = [];
        imageArray.push(item.videoInfo.imageUrl);
        return filedownup.seekSuitableImageFromArrayAndDownloadToLocal(imageArray, function(file, w, h, found, index, total, source) {
          if (file) {
            item.videoInfo.imageUrl = 'cdvfile://localhost/persistent/' + file.name;
            item.videoInfo.filename = file.name;
            item.videoInfo.URI = file.toURL();
            this.insertVideoWithDownloadedImage(item.videoInfo, self.data, source, found, self.inputUrl, file, w, h);
          } else {
            this.insertVideoInfo(item.videoInfo);
          }
          return callback(null, item);
        }, 1, true);
      } else {
        this.insertVideoInfo(item.videoInfo);
      }
    }
    return setTimeout(function() {
      return callback(null, item);
    }, 10);
  };

  insertVideoWithDownloadedImage = function(videoInfo, linkInfo, imageExternalURL, found, inputUrl, file, width, height) {
    var sizey;
    if (file) {
      sizey = Math.round(6 * height / width);
      if (sizey <= 0) {
        sizey = 1;
      }
      return this.insertVideoInfo(videoInfo, sizey.toString());
    }
  };

  drafts.prototype.insertVideoInfo = function(videoInfo, sizey) {
    var data_sizey;
    if (sizey) {
      data_sizey = sizey;
    } else {
      data_sizey = '4';
    }
    console.log("data_sizey is " + data_sizey);
    return _drafts.push({
      _id: mongoid(),
      type: 'video',
      owner: user._id,
      toTheEnd: true,
      text: '来自故事贴',
      videoInfo: videoInfo,
      data_row: '1',
      data_col: '3',
      data_sizex: '6',
      data_sizey: data_sizey
    });
  };

  drafts.prototype.insertMusicInfo = function(musicInfo) {
    return _drafts.push({
      _id: mongoid(),
      type: 'music',
      owner: user._id,
      toTheEnd: true,
      text: '您当前程序不支持音频播放，请分享到微信中欣赏',
      musicInfo: musicInfo,
      data_row: '1',
      data_col: '3',
      data_sizex: '6',
      data_sizey: '1'
    });
  };

  drafts.prototype.insertDownloadedImage = function(linkInfo, imageExternalURL, found, inputUrl, file, width, height) {
    var sizey, timestamp;
    if (file) {
      timestamp = new Date().getTime();
      if (_imageIndex() !== -1) {
        _drafts[_imageIndex()].url = inputUrl;
      }
      sizey = Math.round(6 * height / width);
      if (sizey <= 0) {
        sizey = 1;
      }
      return _drafts.push({
        _id: mongoid(),
        type: 'image',
        isImage: true,
        siteTitle: linkInfo.title,
        siteHost: linkInfo.host,
        owner: user._id,
        imgUrl: 'cdvfile://localhost/persistent/' + file.name,
        filename: file.name,
        URI: file.toURL(),
        url: inputUrl,
        toTheEnd: true,
        data_row: '1',
        data_col: '3',
        data_sizex: '6',
        data_sizey: sizey.toString()
      });
    }
  };

  drafts.prototype.insertDefaultImage = function(linkInfo, mainImageUrl, found, inputUrl) {
    var timestamp;
    if (mainImageUrl) {
      timestamp = new Date().getTime();
      if (_imageIndex() !== -1) {
        _drafts[_imageIndex()].url = inputUrl;
      }
      return _drafts.push({
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
        data_col: '3',
        data_sizex: '6',
        data_sizey: '6'
      });
    }
  };

  drafts.prototype.renderResortedArticleAsync = function(data, inputUrl, resortedObj) {
    resortedObj.itemProcessor = this.itemProcessor;
    resortedObj.data = data;
    resortedObj.inputUrl = inputUrl;
    return async.mapLimit(data.resortedArticle, 1, resortedObj.itemProcessor.bind(resortedObj), function(err, results) {
      console.log('error ' + err);
      return drafts.prototype.processTitleOfPost(data);
    });
  };

  drafts.prototype.processTitleOfPost = function(data) {
    var item, _i, _len, _results;
    if (data.title) {
      console.log('Title is ' + data.title);
      if (!(_title && _title !== '')) {
        _title = data.title;
      }
      if (!(_addontitle && _addontitle !== '')) {
        _addontitle = '';
      }
    }
    _results = [];
    for (_i = 0, _len = _successCallback.length; _i < _len; _i++) {
      item = _successCallback[_i];
      _results.push(item && item());
    }
    return _results;
  };

  drafts.prototype.uploadFiles = function(callback) {
    var draftImageData, draftMusicData, draftToBeUploadedImageData, draftVideoData, i, music, video, _i, _j, _k, _len, _len1, _ref;
    draftImageData = _getItems('image');
    draftMusicData = _getItems('music');
    draftVideoData = _getItems('video');
    draftToBeUploadedImageData = [];
    for (i = _i = 0, _ref = draftImageData.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (draftImageData[i].imgUrl === void 0 || draftImageData[i].imgUrl.toLowerCase().indexOf("http://") >= 0 || draftImageData[i].imgUrl.toLowerCase().indexOf("https://") >= 0) {
        draftToBeUploadedImageData.unshift({});
        continue;
      }
      draftToBeUploadedImageData.push(draftImageData[i]);
    }
    for (_j = 0, _len = draftMusicData.length; _j < _len; _j++) {
      music = draftMusicData[_j];
      if (music.musicInfo.playUrl.toLowerCase().indexOf("http://") >= 0 || music.musicInfo.playUrl.toLowerCase().indexOf("https://") >= 0) {
        draftToBeUploadedImageData.unshift({});
        continue;
      }
      draftToBeUploadedImageData.push(music);
    }
    for (_k = 0, _len1 = draftVideoData.length; _k < _len1; _k++) {
      video = draftVideoData[_k];
      if (video.videoInfo.imageUrl.toLowerCase().indexOf("http://") >= 0 || video.videoInfo.imageUrl.toLowerCase().indexOf("https://") >= 0) {
        draftToBeUploadedImageData.unshift({});
        continue;
      }
      draftToBeUploadedImageData.push(video);
    }
    if (draftToBeUploadedImageData.length <= 0) {
      return callback && callback();
    }
    return multiThreadUploadFileWhenPublishInCordova(draftToBeUploadedImageData, null, function(err, result) {
      var item, _l, _len2;
      if (!result) {
        return callback && callback('上传失败，请稍后重试');
      }
      if (result.length < 1) {
        return callback && callback('上传失败，请稍后重试');
      }
      for (_l = 0, _len2 = result.length; _l < _len2; _l++) {
        item = result[_l];
        if (item.uploaded && item._id) {
          if (item.type === 'image' && item.imgUrl) {
            _drafts[_getItemIndex(item._id)].imgUrl = item.imgUrl;
          } else if (item.type === 'music' && item.musicInfo && item.musicInfo.playUrl) {
            if (!_drafts[_getItemIndex(item._id)].musicInfo) {
              _drafts[_getItemIndex(item._id)].musicInfo = {};
            }
            _drafts[_getItemIndex(item._id)].musicInfo.playUrl = tem.musicInfo.playUrl;
          } else if (item.type === 'video' && item.videoInfo && item.videoInfo.imageUrl) {
            if (!_drafts[_getItemIndex(item._id)].videoInfo) {
              _drafts[_getItemIndex(item._id)].videoInfo = {};
            }
            _drafts[_getItemIndex(item._id)].videoInfo.imageUrl = item.videoInfo.imageUrl;
          }
        }
      }
      if (err) {
        return callback && callback('上传失败，请稍后重试');
      }
      return callback && callback();
    });
  };

  drafts.prototype.getPubObject = function() {
    var addontitle, draftData, fromUrl, i, mainImage, mainImageStyle, modalUserId, ownerIcon, ownerName, ownerUser, postId, pub, sortBy, title, _i, _ref;
    pub = [];
    addontitle = _addontitle;
    title = _title;
    modalUserId = user._id;
    ownerUser = user;
    try {
      ownerIcon = ownerUser.profile.icon;
    } catch (_error) {
      ownerIcon = '/userPicture.png';
    }
    console.log('Full name is ' + ownerUser.profile.fullname);
    if (ownerUser.profile.fullname && (ownerUser.profile.fullname !== '')) {
      ownerName = ownerUser.profile.fullname;
    } else {
      ownerName = ownerUser.username;
    }
    draftData = _drafts;
    //postId = this.id;
    fromUrl = draftData[0].url;
    for (i = _i = 0, _ref = draftData.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (i === 0) {
        mainImage = draftData[i].imgUrl;
        mainImageStyle = draftData[i].style;
      } else {
        pub.push(draftData[i]);
      }
    }
    sortBy = function(key, a, b, r) {
      r = r ? 1 : -1;
      if (a[key] && b[key] && a[key] > b[key]) {
        return -1 * r;
      }
      if (a[key] && b[key] && a[key] < b[key]) {
        return +1 * r;
      }
      if (a[key] === void 0 && b[key]) {
        return +1 * r;
      }
      if (a[key] && b[key] === void 0) {
        return -1 * r;
      }
      return 0;
    };
    pub.sort(function(a, b) {
      return sortBy('data_row', a, b);
    });
    return {
      pub: pub,
      title: title,
      heart: [],
      retweet: [],
      comment: [],
      addontitle: addontitle,
      mainImage: mainImage,
      mainImageStyle: mainImageStyle,
      //mainText: mainText,
      fromUrl: fromUrl,
      publish: true,
      owner: ownerUser._id,
      ownerName: ownerName,
      ownerIcon: ownerIcon,
      createdAt: new Date()
    };
  };

  drafts.prototype.destroy = function() {};

  return drafts;

})();

module.exports = {
  createDrafts: function(postId, user) {
    console.log(postId , user)
    return new drafts(postId, user);
  }
};
