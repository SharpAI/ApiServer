var mongoid = require('mongoid-js');
var fs = require('fs');
var os = require('os');
var sizeOf = require('image-size');
var async = require('async');
var crypto = require('crypto');
var url = require('url');
var download = require('download');
var upload_failed_retry_count = 3; // 上传失败的重试次数

module.exports = filedownup

var showDebug = false;

function filedownup(){

}

var get_image_size_from_URI = function(url, cb) {
  //FIXME: other formate ???
  fs.exists(url, function(exists) {
    if (exists) {
      var states = fs.statSync(url);
      if(states.isDirectory()) {
        console.log(url + " isDirectory");
        return cb && cb(0, 0);
      }
      else {
        showDebug && console.log("size: " + states.size);
        showDebug && console.log("url="+url);
        sizeOf(url, function (err, dimensions) {
          if (err) {
            console.log ('Calculate picture size failed: ' + url);
            return cb(0, 0);
          }

          return cb(dimensions.width, dimensions.height);
        });
      }
    } else {
      console.log("file not found");
      return cb && cb(0, 0);
    }
  });
};


var downloadFromBCS = function(source, callback){
  var nameHash=crypto.createHash('md5').update(source).digest("hex");
  var target = os.tmpdir() + '/' + 'imagecache' + '/';
  if (fs.existsSync(target)) {
      showDebug && console.log('directory already exist ' + target);
  } else {
      fs.mkdirSync(target);
  }

  var url_protocol = url.parse(source).protocol;
  if (url_protocol != 'http:' && url_protocol != 'https:') {
    console.log("illegal URL: " + source);
    return callback(null, source);
  }

  var theFile = {
   name: nameHash,
   toURL: function() {
     return target +nameHash;
   }
  }

  download(source, {timeout: 2000, retries: 2})
    .then(function (data){
      fs.writeFileSync(target+nameHash, data);
      showDebug && console.log('downloaded:  ' + source + " to " + target +nameHash);
      return callback(theFile.toURL(), source, theFile);
    })
    .catch(function (err){
      console.log('download failed source='+source+', err: ' + err);
      return callback(null, source);
    });
}

filedownup.seekSuitableImageFromArrayAndDownloadToLocal = function(imageArray, callback, minimal, onlyOne, insertTmpImgs) {
  var downloadHandler, minimalWidthAndHeight, onError, onSuccess;
  var imageCounter = 0;
  var foundImages = 0;
  if (minimal) {
    minimalWidthAndHeight = minimal;
  } else {
    minimalWidthAndHeight = 150;
  }
  downloadHandler = function(downloadedUrl, source, file) {
    if (downloadedUrl) {
      return onSuccess(downloadedUrl, source, file);
    } else {
      return onError(source);
    }
  };
  onSuccess = function(url, source, file) {
    insertTmpImgs && insertTmpImgs(url);
    showDebug && console.log(file);
    return get_image_size_from_URI(url, function(width, height) {
      if (height >= minimalWidthAndHeight && width >= minimalWidthAndHeight) {
        callback(file, width, height, ++foundImages, imageCounter, imageArray.length, source);
        if (onlyOne) {
          return;
        }
      }
      
      if (++imageCounter < imageArray.length) {
        return downloadFromBCS(imageArray[imageCounter], downloadHandler);
      } else {
        return callback(null, 0, 0, foundImages, imageCounter, imageArray.length, source);
      }
    });
  };
  onError = function(source) {
    showDebug && console.log('image resolve url got error');
    if (++imageCounter < imageArray.length) {
      return downloadFromBCS(imageArray[imageCounter], downloadHandler);
    } else {
      return callback(null, 0, 0, foundImages, imageCounter, imageArray.length, null, source);
    }
  };
  showDebug && console.log('seekSuitableImageFromArrayAndDownloadToLocal');
  return downloadFromBCS(imageArray[imageCounter], downloadHandler);
};

filedownup.fileUploader = function(imageInfo, source, callback) {
    fileUploader(imageInfo, function(err, item){
        if (!err && item.imgUrl) {
          callback && callback(item.imgUrl);
        }
        else
          callback && callback(source);
    });
}
filedownup.EalyMainImage = function(data, callback) {
  filedownup.seekOneUsableMainImage(data, function(file, w, h, found, index, total, source) {
    showDebug && console.log('found ' + found + ' index ' + index + ' total ' + total + ' fileObject ' + file + ' source ' + source);
    if (file) {
      showDebug && console.log('found and downloaded main Image file to local: ' + file.toURL());

      var EalyMainImageInfo = {
        "type": "image",
        "filename": file.name,
        "URI": file.toURL(),
        "uploaded": false,
        "imgUrl": ''};

      fileUploader(EalyMainImageInfo, function(err, item){
        if (!err && item.imgUrl) {
          callback && callback(item.imgUrl);
        }
        else
          callback && callback(source);
      });
    }
    else
      callback && callback(source);
  }, 200, function(file){});
}

filedownup.seekOneUsableMainImage = function(data, callback, minimal, insertTmpImgs) {
  var bgImg, imageArray, imageUrl, img, _i, _j, _len, _len1, _ref, _ref1;
  imageArray = [];
  if (data.imageArray) {
    _ref = data.imageArray;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      img = _ref[_i];
      if (img && img.startsWith("http")) {
        imageArray.push(img);
      }
    }
  }
  if (data.bgArray) {
    _ref1 = data.bgArray;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      bgImg = _ref1[_j];
      imageUrl = (bgImg.match(/url\([^\)]+\)/gi) || [""])[0].split(/[()'"]+/)[1];
      if (imageUrl && imageUrl.startsWith("http")) {
        imageArray.push(imageUrl);
      }
    }
  }
  showDebug && console.log('Got images to be anylised ' + JSON.stringify(imageArray));
  if (imageArray.length > 0) {
    return filedownup.seekSuitableImageFromArrayAndDownloadToLocal(imageArray, function(file, w, h, found, index, length, source) {
      if (file) {
        showDebug && console.log('Original source:' + source + 'Got local url ' + JSON.stringify(file) + ' w:' + w + ' h:' + h);
        return callback(file, w, h, found, index, length, source);
      } else {
        showDebug && console.log('No local url ' + ' w:' + w + ' h:' + h);
        return callback(null, 0, 0, found, index, length, source);
      }
    }, minimal, true, insertTmpImgs);
  } else {
    return callback(null, 0, 0, 0, 0, 0, null);
  }
};

var co = require('co');
var OSS = require('ali-oss');
var client = new OSS({
  region: 'oss-cn-shenzhen',
  accessKeyId: 'Vh0snNA4Orv3emBj',
  accessKeySecret: 'd7p2eNO8GuMl1GtIZ0at4wPDyED4Nz'
});
var fileUploader = function (item,callback){ 
  showDebug && console.log('uploading ' + JSON.stringify(item));
  // if (Session.get('terminateUpload')) {
  //     if (Session.get('flag')){
  //             return;
  //       } 
  //       Session.set('flag',true);         
  //       return callback(new Error('aboutUpload'),item)
  // }
  var self = this;
  if (!item) {
      self.uploaded++;
      //Session.set('progressBarWidth', parseInt(100*self.uploaded/self.total));
      return callback(null,item);
  }
  var filename = '';
  var URI = ''
  if (item.type === 'music') {
      filename = item.musicInfo.filename
      URI = item.musicInfo.URI
  } else if (item.type === 'video') {
      filename = item.videoInfo.filename
      URI = item.videoInfo.URI
  } else {
      filename = item.filename;
      URI = item.URI
  }
  
  //FIXME:
  if (!URI || !(fs.existsSync(URI))) {
    item.uploaded = true;
    return callback && callback(null,item);
  }
  //npm install ali-oss
  //npm install co
  //var mongoid = require('mongoid-js');

  //co(function* () {
  //  var result = yield client.listBuckets();
  //  console.log(result);
  //}).catch(function (err) {
  //  console.log(err);
  //});

  //co(function* () {
  //  client.useBucket('tiegushi');
  //  var result = yield client.list({
  //    'max-keys': 5
  //  });
  //  console.log(result);
  //}).catch(function (err) {
  //  console.log(err);
  //});


  if(!item.upload_count)
    item.upload_count = 1;
  else
    item.upload_count += 1;   

  co(function* () {
    var timestamp = new Date().getTime();
    var key = timestamp+'_'+mongoid();
    client.useBucket('tiegushi');
    showDebug && console.log(key)
    var result = yield client.put(key, URI);
    var url = 'http://data.tiegushi.com/' + key;
    
    if ( item.type === 'music'){
      item.musicInfo.playUrl = url;
    } else if ( item.type === 'video'){
      item.videoInfo.imageUrl = url;
    } else {
      item.imgUrl = url;
    }
    
    item.uploaded = true;
    try{callback && callback(null,item);}
    catch(e){}
    //console.log(result);
  }).catch(function (err) {
    item.uploaded = false;
    
    if(item.upload_count > upload_failed_retry_count)
      return callback && callback(null,item);
      
    setTimeout( function() {
      fileUploader(item, callback)
    },1000);
    
    console.log('upload file error: ' + err);
  });

  // var ft = uploadToAliyun_new(filename, URI, function(status,param){
  //   if (Session.get('terminateUpload')) {
  //       if (Session.get('flag')){
  //           return;
  //       } 
  //       Session.set('flag',true);         
  //       return callback(new Error('aboutUpload'),item)
  //   }
  //   if (status === 'uploading' && param){
  //       var progressBarWidth = parseInt(100*(self.uploaded/self.total + (param.loaded / param.total)/self.total));
  //       if(progressBarWidth-Session.get('progressBarWidth')>=1){
  //           Session.set('progressBarWidth',progressBarWidth);
  //       }
  //       //Session.set('progressBarWidth', parseInt(100*(self.uploaded/self.total + (param.loaded / param.total)/self.total)));
  //   } else if (status === 'done'){
  //       self.uploaded++;
  //       var progressBarWidth1 = parseInt(100*self.uploaded/self.total);
  //       if(progressBarWidth1-Session.get('progressBarWidth')>=1){
  //           Session.set('progressBarWidth',progressBarWidth1);
  //       }
  //       //Session.set('progressBarWidth', parseInt(100*self.uploaded/self.total));
  //       if ( item.type === 'music'){
  //           item.musicInfo.playUrl = param;
  //       } else if ( item.type === 'video'){
  //           item.videoInfo.imageUrl = param;
  //       } else {
  //           item.imgUrl = param;
  //       }
  //       item.uploaded = true;
  //       callback(null,item)
  //   } else if (status === 'error'){
  //       item.uploaded = false;
  //       Meteor.setTimeout( function() {
  //           fileUploader(item, callback)
  //       },1000);
  //   }
  // });
};
var asyncCallback = function (err,result){
    showDebug && console.log('async processing done ' + JSON.stringify(result));
    //Template.progressBar.__helpers.get('close')();
    if (err){
        if (this.finalCallback) {
            this.finalCallback('error',result);
        }
    } else {
        if (this.finalCallback) {
            this.finalCallback(null,result);
        }
    }
};
var multiThreadUploadFile_new = function(draftData, maxThreads, callback) {
    var uploadObj = {
        fileUploader : fileUploader,
        draftData : draftData,
        finalCallback: callback,
        asyncCallback: asyncCallback,
        uploaded : 0,
        total : draftData.length
    };
    showDebug && console.log('draft data is ' + JSON.stringify(draftData));

    //Session.set('aboutUpload', false);
    //Session.set('flag',false);
    async.mapLimit(draftData,maxThreads,uploadObj.fileUploader.bind(uploadObj),uploadObj.asyncCallback.bind(uploadObj));
};
    
filedownup.multiThreadUploadFileWhenPublishInCordova = function(draftData, threads, callback){
    //showDebug && console.log("draftData="+JSON.stringify(draftData));
    if (draftData.length > 0) {
        //Template.progressBar.__helpers.get('show')();
    } else {
        callback('failed');
    }

    var multiThreadUploadFileCallback = function(err,result){
      if (!err) {
          callback(null, result);
      } else {
          //Template.progressBar.__helpers.get('close')();
          showDebug && console.log("Jump to post page...");
          //PUB.pagepop();//Pop addPost page, it was added by PUB.page('/progressBar');
          callback('failed', result);
          showDebug && console.log("multiThreadUploadFile, failed");
      }
    };

    multiThreadUploadFile_new(draftData, threads, multiThreadUploadFileCallback);
    return;
};

filedownup.removeImagesFromCache = function (draftImageData) {
  var length = draftImageData.length;
  if (length === 0) {
    return;
  }
  
  showDebug && console.log('removeImagesFromCache: ', JSON.stringify(draftImageData));
  for (var i = 0; i < length; i++) {
    var item = draftImageData[i];
    if (fs.existsSync(item)) {
      showDebug && console.log('directory already exist ' + item);
      try{fs.unlinkSync(item);}
      catch(e){}
    } else {
      showDebug && console.log("local file not found: " + item);
    }
  }
};

