
if (Meteor.isCordova){
    uploadingFilesInfo = {filesCount:0, files:[]};
    abortuploader = function(){}
    var showDebug=false
    var uploadToAliyun_new = function(filename,URI, callback){
        Meteor.call('getAliyunWritePolicy',filename,URI,function(error,result){
            if(error) {
                showDebug && console.log('getAliyunWritePolicy error: ' + error);
                if(callback){
                    callback(null);
                }
            }
            showDebug && console.log('File URI is ' + result.orignalURI);
            var options = new FileUploadOptions();
            options.mimeType ="image/jpeg";
            options.chunkedMode = false;
            options.httpMethod = "PUT";
            options.fileName = filename;

            var uri = encodeURI(result.acceccURI);

            var headers = {
                "Content-Type": "image/jpeg",
                "Content-Md5":"",
                "Authorization": result.auth,
                "Date": result.date
            };
            options.headers = headers;

            var ft = new FileTransfer();
            ft.onprogress = function(progressEvent) {
                if (progressEvent && progressEvent.lengthComputable) {
                    if (callback){
                        showDebug && console.log('Loaded ' + progressEvent.loaded + ' Total ' + progressEvent.total);
                        callback('uploading',progressEvent)
                    }
                } else {
                    showDebug && console.log('Upload ++');
                }
            };
            ft.upload(result.orignalURI, uri, function(e){
                if(callback){
                    callback('done',result.readURI);
                }
            }, function(e){
                showDebug && console.log('upload error' + e.code );
                if (callback) {
                    callback('error',null);
                }
            }, options,true);

            return ft;
        });
    }
    var uploadToAliyun = function(filename,URI, callback, errCallback){
      Meteor.call('getAliyunWritePolicy',filename,URI,function(error,result){
        if(error) {
          showDebug && console.log('getAliyunWritePolicy error: ' + error);
            if(callback){
                callback(null);
            }
        }
        showDebug && console.log('File URI is ' + result.orignalURI);
        var options = new FileUploadOptions();
        options.mimeType ="image/jpeg";
        options.chunkedMode = false;
        options.httpMethod = "PUT";
        options.fileName = filename;

        var uri = encodeURI(result.acceccURI);

        var headers = {
          "Content-Type": "image/jpeg",
          "Content-Md5":"",
          "Authorization": result.auth,
          "Date": result.date
        };
        options.headers = headers;

        var ft = new FileTransfer();
        ft.onprogress = function(progressEvent) {
          if (progressEvent.lengthComputable) {
            showDebug && console.log('Loaded ' + progressEvent.loaded + ' Total ' + progressEvent.total);
            computeProgressBar(filename, 60*(progressEvent.loaded/progressEvent.total));
            showDebug && console.log('Uploaded Progress ' + 60* (progressEvent.loaded / progressEvent.total ) + '%');
          } else {
            showDebug && console.log('Upload ++');
          }
        };
        ft.upload(result.orignalURI, uri, function(e){
            if(callback){
                computeProgressBar(filename, 100);
                callback(result.acceccURI);
            }
        }, function(e){
          showDebug && console.log('upload error' + e.code );
          if (errCallback) {
            errCallback(filename);
          } else {
            if(callback){
              callback(null);
            }
          }
        }, options,true);

        return ft;
      });
    }
    var uploadToS3 = function(filename,URI,callback){
      Meteor.call('getS3WritePolicy',filename,URI,function(error,result){
        if(error) {
          showDebug && console.log('getS3WritePolice error: ' + error);
            if(callback){
                callback(null);
            }
        }
        showDebug && console.log('File URI is ' + result.orignalURI);
        var options = new FileUploadOptions();
        options.fileKey="file";
        var time = new Date().getTime();
        options.fileName = filename;
        options.mimeType ="image/jpeg";
        options.chunkedMode = false;

        var uri = encodeURI("https://travelers-bucket.s3.amazonaws.com/");

        var policyDoc = result.s3PolicyBase64;
        var signature = result.s3Signature ;
        var params = {
          "key": filename,
          "AWSAccessKeyId": 'AKIAJY2UYZVD3WWOF4JA',
          "acl": "public-read",
          "policy": policyDoc,
          "signature": signature,
          "Content-Type": "image/jpeg"
        };
        options.params = params;

        var ft = new FileTransfer();
        ft.onprogress = function(progressEvent) {
          if (progressEvent.lengthComputable) {
            showDebug && console.log('Uploaded Progress ' + 100* (progressEvent.loaded / progressEvent.total ) + '%');
          } else {
            showDebug && console.log('Upload ++');
          }
        };
        ft.upload(result.orignalURI, uri, function(e){
            if(callback){
                callback('https://travelers-bucket.s3.amazonaws.com/' + filename);
            }
        }, function(e){
          showDebug && console.log('upload error' + e.code )
          if(callback){
              callback(null);
          }
        }, options,true);
      });
    }
    var uploadToBCS = function(filename,URI,callback,errCallback){
      Meteor.call('getBCSSigniture',filename,URI,function(error,result){
        if(error) {
            showDebug && console.log('getBCSSigniture error: ' + error);
            if(callback){
                callback(null);
            }
            return;
        }
        showDebug && console.log('File URI is ' + result.orignalURI);
        showDebug && console.log('Result is ' + JSON.stringify(result));
        var options = new FileUploadOptions();
        var time = new Date().getTime();
        options.mimeType ="image/jpeg";
        options.chunkedMode = false;
        options.httpMethod = "PUT";

        var uri = encodeURI("http://bcs.duapp.com/travelers-km/"+filename)+"?sign="+result.signture;

        var headers = {
          "x-bs-acl": "public-read",
          "Content-Type": "image/jpeg"
        };
        options.headers = headers;

        var ft = new FileTransfer();
        ft.onprogress = function(progressEvent) {
          if (progressEvent.lengthComputable) {
            computeProgressBar(filename, 100*(progressEvent.loaded/progressEvent.total));
            showDebug && console.log('Uploaded Progress ' + 100* (progressEvent.loaded / progressEvent.total ) + '%');
          } else {
            showDebug && console.log('Upload ++');
          }
        };
        ft.upload(result.orignalURI, uri, function(e){
            if(callback){
                callback('http://bcs.duapp.com/travelers-km/' + filename);
            }
        }, function(e){
          showDebug && console.log('upload error' + e.code )
          if (errCallback) {
            errCallback(filename);
          } else {
            if(callback){
              callback(null);
            }
          }
        }, options,true);
      });
    }

    var FileDownloadOptions = function(fileKey, fileName, mimeType, params, headers, httpMethod) {
        this.headers = headers || null;
    };
    downloadFromBCS = function(source, callback){
        function fail(error) {
            showDebug && console.log(error)
            if(callback){
                callback(null, source);
            }
        }
        function onFileSystemSuccess(fileSystem) {
            var timestamp = new Date().getTime();
            var hashOnUrl = Math.abs(source.hashCode());
            var filename = Meteor.userId()+'_'+timestamp+ '_' + hashOnUrl;
            fileSystem.root.getFile(filename, {create: true, exclusive: false},
                function(fileEntry){
                    showDebug && console.log("filename = "+filename+", fileEntry.toURL()="+fileEntry.toURL());
                    //var target = "cdvfile://localhost/temporary/"+filename
                    var target = fileEntry.toURL();
                    showDebug && console.log("target = "+target);

                    var options = new FileDownloadOptions();
                    var headers = {
                      "x-bs-acl": "public-read",
                      "Content-Type": "image/jpeg"
                      //"Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                    };
                    options.headers = headers;
                    var ft = new FileTransfer();
                    ft.download(source, target, function(theFile){
                        //showDebug && console.log('download suc, theFile.toURL='+theFile.toURL());
                        if(callback){
                            callback(theFile.toURL(),source,theFile);
                        }
                    }, function(e){
                        showDebug && console.log('download error: ' + e.code)
                        if(callback){
                          callback(null, source);
                        }
                    }, true, options);

                }, fail);
        }
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
    }

    /**
    * upload file in cordova with plugin for select/resize file to S3
    *
    * @method uploadFileInCordova
    * @param {Function} callback
    * @return {Object} url in callback
    */
    var uploadFileInCordova = function(ImageWidth, ImageHeight, ImageQuality, callback){
      if(device.platform === 'Android'){
           pictureSource = navigator.camera.PictureSourceType;
           destinationType = navigator.camera.DestinationType;
//          var cameraOptions = {
//            width: 400,
//            height: 400,
//            destinationType: destinationType.NATIVE_URI,
//            sourceType: pictureSource.SAVEDPHOTOALBUM,
//            quality: 60
//          };
          navigator.camera.getPicture(function(s){
              console.info(s);
              //判断是否图片
              if(s.indexOf("file:///")==0){
                  if(s.lastIndexOf('.')<=0){
                      PUB.toast('您选取的文件不是图片！');
                      return;
                  }else{
                      var ext = s.substring(s.lastIndexOf('.')).toUpperCase();
                      if(!(ext.indexOf('.PNG')==0||ext.indexOf('.JPG')==0||ext.indexOf('.JPEG')==0||ext.indexOf('.GIF')==0)){
                        PUB.toast('您选取的文件不是图片！');
                        return;
                      }
                  }
              }
              var timestamp = new Date().getTime();
              var filename = Meteor.userId()+'_'+timestamp+'.jpg';
              showDebug && console.log('File name ' + filename);
              //uploadToS3(filename,results[i],callback);
              uploadToAliyun_new(filename,s,callback);
          }, function(s){
              console.info(s);
          }, {
            quality: ImageQuality,
            targetWidth: ImageWidth,
            targetHeight: ImageHeight,
            destinationType: destinationType.NATIVE_URI,
            sourceType: pictureSource.SAVEDPHOTOALBUM
          });

      }else{
        window.imagePicker.getPictures(
          function(results) {
            if(results == undefined)
              return;
            var length = 0;
            try{
              length=results.length;
            }
            catch (error){
              length=results.length;
            }
            if (length == 0)
              return;
            for (var i = 0; i < length; i++) {
              var timestamp = new Date().getTime();
              var originalFilename = results[i].replace(/^.*[\\\/]/, '');
              var filename = Meteor.userId()+'_'+timestamp+ '_' + originalFilename;
              showDebug && console.log('File name ' + filename);
              //uploadToS3(filename,results[i],callback);
                uploadToAliyun_new(filename,results[i],callback);
            }
          }, function (error){
              showDebug && console.log('Pick Image Error ' + error);
              if(callback){
                  callback(null);
              }
          }, {
            maximumImagesCount: 1,
            width: ImageWidth,
            height: ImageHeight,
            quality: ImageQuality,
            storage: 'persistent'
          });
        }
        }

    var fileUploader = function (item,callback){
        console.log('uploading ' + JSON.stringify(item));
        if (Session.get('terminateUpload')) {
            if (Session.get('flag')){
                    return;
             }
             Session.set('flag',true);
             return callback(new Error('aboutUpload'),item)
        }
        var self = this;
        if ($.isEmptyObject(item)) {
            self.uploaded++;
            Session.set('progressBarWidth', parseInt(100*self.uploaded/self.total));
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
        var ft = uploadToAliyun_new(filename, URI, function(status,param){
            if (Session.get('terminateUpload')) {
                if (Session.get('flag')){
                    return;
                }
                Session.set('flag',true);
                return callback(new Error('aboutUpload'),item)
            }
            if (status === 'uploading' && param){
                var progressBarWidth = parseInt(100*(self.uploaded/self.total + (param.loaded / param.total)/self.total));
                if(progressBarWidth-Session.get('progressBarWidth')>=1){
                    Session.set('progressBarWidth',progressBarWidth);
                }
                //Session.set('progressBarWidth', parseInt(100*(self.uploaded/self.total + (param.loaded / param.total)/self.total)));
            } else if (status === 'done'){
                self.uploaded++;
                var progressBarWidth1 = parseInt(100*self.uploaded/self.total);
                if(progressBarWidth1-Session.get('progressBarWidth')>=1){
                    Session.set('progressBarWidth',progressBarWidth1);
                }
                //Session.set('progressBarWidth', parseInt(100*self.uploaded/self.total));
                if ( item.type === 'music'){
                    item.musicInfo.playUrl = param;
                } else if ( item.type === 'video'){
                    item.videoInfo.imageUrl = param;
                } else {
                    item.imgUrl = param;
                }
                item.uploaded = true;
                callback(null,item)
            } else if (status === 'error'){
                item.uploaded = false;
                Meteor.setTimeout( function() {
                    fileUploader(item, callback)
                },1000);
            }
        });
    };

    var asyncCallback = function (err,result){
        console.log('async processing done ' + JSON.stringify(result));
        Template.progressBar.__helpers.get('close')();
        if (err){
            console.log('err is ' + err);
            if (this.finalCallback) {
                console.log('result  is  '+ result);
                this.finalCallback('error',result);
            }
        } else {
            console.log('no err result ')
            console.log(result)
            if (this.finalCallback) {
                this.finalCallback(null,result);
            }
        }
    };
    multiThreadUploadFile_new = function(draftData, maxThreads, callback) {
        var uploadObj = {
            fileUploader : fileUploader,
            draftData : draftData,
            finalCallback: callback,
            asyncCallback: asyncCallback,
            uploaded : 0,
            total : draftData.length
        };
        console.log('draft data is ' + JSON.stringify(draftData));

        Session.set('aboutUpload', false);
        Session.set('flag',false);
        async.mapLimit(draftData,maxThreads,uploadObj.fileUploader.bind(uploadObj),uploadObj.asyncCallback.bind(uploadObj));
    };
    multiThreadUploadFileWhenPublishInCordova = function(draftData, postId, callback){
        //showDebug && console.log("draftData="+JSON.stringify(draftData));
        if (draftData.length > 0) {
            Template.progressBar.__helpers.get('show')();
        } else {
            callback('failed');
        }

        var multiThreadUploadFileCallback = function(err,result){
          if (!err) {
              // console.log('gooooooooooooood ')
              callback(null, result);
          } else {
              Template.progressBar.__helpers.get('close')();
              showDebug && console.log("Jump to post page...");
              PUB.pagepop();//Pop addPost page, it was added by PUB.page('/progressBar');
              callback('failed', result);
              showDebug && console.log("multiThreadUploadFile, failed");
          }
        };

        multiThreadUploadFile_new(draftData, 1, multiThreadUploadFileCallback);
        return;
    };
    uploadFileWhenPublishInCordova = function(draftData, postId){
        if(device.platform === 'testAndroid' ){
            Router.go('/posts/'+postId);
            return;
        }
        var uploadedCount = 0;
        //showDebug && console.log("draftData="+JSON.stringify(draftData));
        if (draftData.length > 0) {
          $('.addProgress').css('display',"block");
        }
        uploadingFilesInfo.filesCount = draftData.length;
        uploadingFilesInfo.files = [];
        for (var i=0; i<draftData.length; i++) {
            uploadToAliyun(draftData[i].filename, draftData[i].URI, function(result){
            //uploadToBCS(draftData[i].filename, draftData[i].URI, function(result){
                uploadedCount++;
                showDebug && console.log("uploading("+uploadedCount+"/"+draftData.length+")...");
                if (uploadedCount == draftData.length) {
                    Session.set('progressBarWidth', 100);
                    showDebug && console.log("Jump to post page...");
//                    $('body').css('background-color',"#111");
                    $('.addProgress').css('display',"none");
                    Router.go('/posts/'+postId);
                }
            });
        }
    };
    selectMediaFromAblum = function(max_number, callback){
        window.imagePicker.getPictures(
          function(results) {

            if(results === undefined) {
            	return;
            }

            var length = 0;
            try{
              length=results.length;
            }
            catch (error){
              length=results.length;
            }
            if (length === 0) {
              callback('cancel');
              return;
            }

            for (var i = 0; i < length; i++) {
              var timestamp = new Date().getTime();
              var originalFilename = results[i].replace(/^.*[\\\/]/, '');
              var filename = Meteor.userId()+'_'+timestamp+ '_' + originalFilename;
              showDebug && console.log('File name ' + filename);
              showDebug && console.log('Original full path ' + results[i]);
              var params = '';
              if(device.platform === 'Android'){
                  params = {filename:filename, URI:results[i], smallImage:'cdvfile://localhost/cache/' + originalFilename};
              }
              else {
                  params = {filename:filename, URI:results[i], smallImage:'cdvfile://localhost/persistent/drafts/' + originalFilename};
              }
              callback(null, params,(i+1),length);
            }
          }, function (error){
              showDebug && console.log('Pick Image Error ' + error);
              if(callback){
                  callback(null);
              }
          }, {
            maximumImagesCount: max_number,
            width: 1900,
            height: 1900,
            quality: 20,
            storage: 'persistent'
          });
        };
    importImagesFromShareExtension = function (results, callback) {
        if (results === undefined) {
            return;
        }

        var length = 0;
        try {
            length = results.length;
        }
        catch (error) {
            length = results.length;
        }
        if (length === 0) {
            callback('cancel');
            return;
        }

        for (var i = 0; i < length; i++) {
            var timestamp = new Date().getTime();
            var originalFilename = results[i].replace(/^.*[\\\/]/, '');
            var filename = Meteor.userId() + '_' + timestamp + '_' + originalFilename;
            showDebug && console.log('File name ' + filename);
            showDebug && console.log('Original full path ' + results[i]);
            var params = { filename: filename, URI: results[i], smallImage: 'cdvfile://localhost/persistent/drafts/' + originalFilename };

            callback(null, params, (i + 1), length);
        }

    };

    removeImagesFromCache = function (draftImageData) {
        var length = draftImageData.length;
        if (length === 0) {
            return;
        }

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function () {
            for (var i = 0; i < length; i++) {
                var URI = draftImageData[i].URI;
                if (URI === void 0 || draftImageData[i].imgUrl.toLowerCase().indexOf("http://") >= 0 || draftImageData[i].imgUrl.toLowerCase().indexOf("https://") >= 0) {
                    continue;
                }
                window.resolveLocalFileSystemURL(URI, function (fileEntry) {
                    fileEntry.remove(function () {
                        console.log("Removal succeeded");
                    }, function (e) {
                        console.log('Error removing file: ' + e);
                    });
                }, function (error) {
                    console.log("fileEntry.file Error = " + error.code);
                });
            }

        }, function () {
            console.log('Request file system error');
        });

    };
        uploadFile = uploadFileInCordova;
    }
