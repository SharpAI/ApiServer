var mongoid = require('mongoid-js');
var wget = require('wgetjs');
var fs = require('fs');
var os = require('os');
var sizeOf = require('image-size');
var async = require('async');
var crypto = require('crypto');

module.exports = filedownup

var showDebug = true

function filedownup(){

}

var get_image_size_from_URI = function(url, cb) {
  //FIXME: other formate ???

  var width = 0;
  var height = 0;

  if (url.substr(url.lastIndexOf('.'))  === '.ico') {
    return cb(width, height);
  }

  var dimensions = sizeOf(url);

  if (dimensions) {
    width = dimensions.width;
    height = dimensions.height;
  }

  cb && cb(width, height);
};


var downloadFromBCS = function(source, callback){
//    function fail(error) {
//        showDebug && console.log(error)
//        if(callback){
//            callback(null, source);
//        }
//    }
//    function onFileSystemSuccess(fileSystem) {
//        var timestamp = new Date().getTime();
//        var hashOnUrl = Math.abs(source.hashCode());
//        var filename = Meteor.userId()+'_'+timestamp+ '_' + hashOnUrl;
//        fileSystem.root.getFile(filename, {create: true, exclusive: false},
//            function(fileEntry){
//                showDebug && console.log("filename = "+filename+", fileEntry.toURL()="+fileEntry.toURL());
//                //var target = "cdvfile://localhost/temporary/"+filename
//                var target = fileEntry.toURL();
//                showDebug && console.log("target = "+target);
//
//                var options = new FileDownloadOptions();
//                var headers = {
//                  "x-bs-acl": "public-read",
//                  "Content-Type": "image/jpeg"
//                  //"Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
//                };
//                options.headers = headers;
//                var ft = new FileTransfer();
//                ft.download(source, target, function(theFile){
//                    //showDebug && console.log('download suc, theFile.toURL='+theFile.toURL());
//                    if(callback){
//                        callback(theFile.toURL(),source,theFile);
//                    }
//                }, function(e){
//                    showDebug && console.log('download error: ' + e.code)
//                    if(callback){
//                      callback(null, source);
//                    }
//                }, true, options);
//
//            }, fail);
//    }
//    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
  var nameHash=crypto.createHash('md5').update(source).digest("hex");
  var target = os.tmpdir() + '/' + 'imagecache' + '/';
  if (fs.existsSync(target)) {
      showDebug && console.log('directory already exist ' + target);
  } else {
      fs.mkdirSync(target);
  }

  var wget_opt = {
    url:  source,
    dest: target+nameHash,
    timeout: 2000};

  var theFile = {
   name: nameHash,
   toURL: function() {
     return target +nameHash;
   }
  }

  wget(wget_opt, function (error, response, body) {
    if (error) {
      console.log('--- error:');
      console.log(error);            // error encountered
      if(callback){
        callback(null, source);
      }
    }
    else {
      if(callback){
        callback(theFile.toURL(), source, theFile);
      }
    }
  });
}


filedownup.seekSuitableImageFromArrayAndDownloadToLocal = function(imageArray, callback, minimal, onlyOne) {
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


filedownup.seekOneUsableMainImage = function(data, callback, minimal) {
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
    }, minimal, true);
  } else {
    return callback(null, 0, 0, 0, 0, 0, null);
  }
};


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
  
  //npm install ali-oss
  //npm install co
  //var mongoid = require('mongoid-js');

  var co = require('co');
  var OSS = require('ali-oss');

  var client = new OSS({
    region: 'oss-cn-shenzhen',
    accessKeyId: 'Vh0snNA4Orv3emBj',
    accessKeySecret: 'd7p2eNO8GuMl1GtIZ0at4wPDyED4Nz'
  });


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


  co(function* () {
    var key = mongoid();
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
    callback(null,item)
    //console.log(result);
  }).catch(function (err) {
    item.uploaded = false;
      setTimeout( function() {
        fileUploader(item, callback)
      },1000);
    console.log(err);
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
    
filedownup.multiThreadUploadFileWhenPublishInCordova = function(draftData, postId, callback){
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

    multiThreadUploadFile_new(draftData, 1, multiThreadUploadFileCallback);
    return;
};

