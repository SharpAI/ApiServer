var mongoid = require('mongoid-js');
var wget = require('wgetjs');
var fs = require('fs');
var os = require('os');

module.exports = filedownup

var showDebug = false

function filedownup(){

}

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

  var target = os.tmpdir() + '/' + mongoid() + '/';
  if (fs.existsSync(target)) {
      console.log('directory already exist ' + target);
  } else {
      fs.mkdirSync(target);
  }

  var wget_opt = {
    url:  source,
    dest: target,
    timeout: 2000};

  wget(wget_opt, function (error, response, body) {
    if (error) {
      console.log('--- error:');
      console.log(error);            // error encountered
    }
  });
}


var seekSuitableImageFromArrayAndDownloadToLocal = function(imageArray, callback, minimal, onlyOne) {
  var downloadHandler, minimalWidthAndHeight, onError, onSuccess;
  this.imageCounter = 0;
  this.foundImages = 0;
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
    return seekSuitableImageFromArrayAndDownloadToLocal(imageArray, function(file, w, h, found, index, length, source) {
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

