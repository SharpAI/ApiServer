
if (Meteor.isCordova){
    uploadingFilesInfo = {filesCount:0, files:[]};
    abortuploader = function(){}
  
    var uploadToAliyun = function(filename,URI, callback, errCallback){
      Meteor.call('getAliyunWritePolicy',filename,URI,function(error,result){
        if(error) {
          console.log('getAliyunWritePolicy error: ' + error);
            if(callback){
                callback(null);
            }
        }
        console.log('File URI is ' + result.orignalURI);
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

        var ft = new FileTransferBCS();
        ft.onprogress = function(progressEvent) {
          if (progressEvent.lengthComputable) {
            computeProgressBar(filename, 100*(progressEvent.loaded/progressEvent.total));
            console.log('Uploaded Progress ' + 100* (progressEvent.loaded / progressEvent.total ) + '%');
          } else {
            console.log('Upload ++');
          }
        };
        ft.upload(result.orignalURI, uri, function(e){
            if(callback){
                callback(result.acceccURI);
            }
        }, function(e){
          console.log('upload error' + e.code )
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
          console.log('getS3WritePolice error: ' + error);
            if(callback){
                callback(null);
            }
        }
        console.log('File URI is ' + result.orignalURI);
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
            console.log('Uploaded Progress ' + 100* (progressEvent.loaded / progressEvent.total ) + '%');
          } else {
            console.log('Upload ++');
          }
        };
        ft.upload(result.orignalURI, uri, function(e){
            if(callback){
                callback('https://travelers-bucket.s3.amazonaws.com/' + filename);
            }
        }, function(e){
          console.log('upload error' + e.code )
          if(callback){
              callback(null);
          }
        }, options,true);
      });
    }
    var uploadToBCS = function(filename,URI,callback,errCallback){
      Meteor.call('getBCSSigniture',filename,URI,function(error,result){
        if(error) {
            console.log('getBCSSigniture error: ' + error);
            if(callback){
                callback(null);
            }
            return;
        }
        console.log('File URI is ' + result.orignalURI);
        console.log('Result is ' + JSON.stringify(result));
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

        var ft = new FileTransferBCS();
        ft.onprogress = function(progressEvent) {
          if (progressEvent.lengthComputable) {
            computeProgressBar(filename, 100*(progressEvent.loaded/progressEvent.total));
            console.log('Uploaded Progress ' + 100* (progressEvent.loaded / progressEvent.total ) + '%');
          } else {
            console.log('Upload ++');
          }
        };
        ft.upload(result.orignalURI, uri, function(e){
            if(callback){
                callback('http://bcs.duapp.com/travelers-km/' + filename);
            }
        }, function(e){
          console.log('upload error' + e.code )
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
            console.log(error)
        }
        function onFileSystemSuccess(fileSystem) {
            var filename = source.replace(/^.*[\\\/]/, '');
            fileSystem.root.getFile(filename, {create: true, exclusive: false}, 
                function(fileEntry){
                    console.log("filename = "+filename+", fileEntry.toURL()="+fileEntry.toURL());
                    //var target = "cdvfile://localhost/temporary/"+filename
                    var target = fileEntry.toURL();
                    console.log("target = "+target);

                    var options = new FileDownloadOptions();
                    var headers = {
                      "x-bs-acl": "public-read",
                      "Content-Type": "image/jpeg"
                      //"Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                    };
                    options.headers = headers;
                    var ft = new FileTransferBCS();
                    ft.onprogress = function(progressEvent) {
                      if (progressEvent.lengthComputable) {
                        console.log('Download Progress ' + 100* (progressEvent.loaded / progressEvent.total ) + '%');
                      } else {
                        console.log('Download ++');
                      }
                    };
                    ft.download(source, target, function(theFile){
                        console.log('download suc, theFile.toURL='+theFile.toURL());
                        if(callback){
                            callback(theFile.toURL());
                        }
                    }, function(e){
                        console.log('download error: ' + e.code)
                        if(callback){
                          callback(null, source);
                        }
                    }, true, options);

                }, fail);
        }
        window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, onFileSystemSuccess, fail);
    }

    /**
    * upload file in cordova with plugin for select/resize file to S3
    *
    * @method uploadFileInCordova
    * @param {Function} callback
    * @return {Object} url in callback
    */
    var uploadFileInCordova = function(ImageWidth, ImageHeight, ImageQuality, callback){
      if(device.platform === 'Android' ){
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
              console.log('File name ' + filename);
              //uploadToS3(filename,results[i],callback);
              uploadToBCS(filename,s,callback);
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
              console.log('File name ' + filename);
              //uploadToS3(filename,results[i],callback);
              uploadToBCS(filename,results[i],callback);
            }
          }, function (error){
              console.log('Pick Image Error ' + error);
              if(callback){
                  callback(null);
              }
          }, {
            maximumImagesCount: 6,
            width: ImageWidth,
            height: ImageHeight,
            quality: ImageQuality,
            storage: 'temporary'
          });
        }
        }

    var multiThreadsInfo = [];
    var runningThreadCount = 0;
    var multiThreadsTimeout = 180; // 3分钟（单位秒）
    var multiThreadsIntervalHandle;
    /*filesCount, [{percent:?}]*/
    computeProgressBar = function(fileName, curPercent) {
        var percent = 0;
        var isFind = false;
        var computePercent = curPercent>=100 ? 99 : curPercent;
        computePercent = computePercent < 0 ? 0 : computePercent
        
        for (var i=0; i<uploadingFilesInfo.files.length; i++) {
            if (uploadingFilesInfo.files[i].fileName == fileName) {
                uploadingFilesInfo.files[i].percent = computePercent;//当前文件已上传的百分比
                isFind = true;
                break;
            }
        }
        if (!isFind) {
            var fileInfo = {fileName:fileName, percent:computePercent};
            uploadingFilesInfo.files.push(fileInfo);
        }
        for (var i=0; i<uploadingFilesInfo.files.length; i++) {
            percent += uploadingFilesInfo.files[i].percent ? uploadingFilesInfo.files[i].percent : 0;//所有文件上传的百分比
            //console.log("uploadingFilesInfo.files["+i+"].percent = "+uploadingFilesInfo.files[i].percent);
        }
        //console.log("progressBarWidth="+parseInt(percent/uploadingFilesInfo.filesCount)+",percent="+percent+", filesCount="+uploadingFilesInfo.filesCount);
        Session.set('progressBarWidth', parseInt(percent/uploadingFilesInfo.files.length));

        //Clear timeout timer of this file
        for (var i=0; i<multiThreadsInfo.length; i++) {
            if (multiThreadsInfo[i].filename == fileName) {
                console.log("computeProgressBar: reset timeout counter for: "+fileName);
                multiThreadsInfo[i].time = 0;
                break;
            }
        }
    }

    var multiThreadUploadFile = function(draftData, maxThreads, callback){
        var count = draftData.length < maxThreads ? draftData.length : maxThreads;
        runningThreadCount = 0;
        multiThreadsInfo = [];
        for (var i=0; i<count; i++) {
            runningThreadCount++;
            startThreadUploadFile(draftData, null, multiThreadsInfo, callback);
        }
        multiThreadsIntervalHandle = setInterval(function(){
            for (var i=0; i<multiThreadsInfo.length; i++) {
                if (multiThreadsInfo[i].status == 0) {
                    multiThreadsInfo[i].time++;
                    //console.log("multiThreadUploadFile: multiThreadsInfo["+i+"].time="+multiThreadsInfo[i].time);
                    if (multiThreadsInfo[i].time > multiThreadsTimeout) {
                        clearInterval(multiThreadsIntervalHandle);
                        console.log("multiThreadUploadFile: timeout!!! file info is: "+JSON.stringify(multiThreadsInfo[i]));
                        multiThreadsInfo = [];
                        callback(null);
                        return;
                    }
                }
            }
        }, 1000);
    }

    var startThreadUploadFile = function(draftData, fileInfo, info, callback){
        var getFileInfo = function(filename) {
            for (var i=0; i<multiThreadsInfo.length; i++) {
                if (multiThreadsInfo[i].filename == filename) {
                    return multiThreadsInfo[i];
                }
            }
            return null;
        }
        var getUploadedCount = function() {
            var count = 0;
            for (var i=0; i<multiThreadsInfo.length; i++) {
                if (multiThreadsInfo[i].status == 1) {
                    count++;
                }
            }
            return count;
        }
        var hasErrorUpload = function() {
            for (var i=0; i<multiThreadsInfo.length; i++) {
                if (multiThreadsInfo[i].status == -1) {
                    return true;
                }
            }
            return false;
        }
        var hasActiveUpload = function() {
            for (var i=0; i<multiThreadsInfo.length; i++) {
                if (multiThreadsInfo[i].status == 0) {
                    return true;
                }
            }
            return false;
        }
        var setFileTransfer = function(filename, fileTransfer){
           for (var i=0; i<multiThreadsInfo.length; i++) {
              if(multiThreadsInfo[i].filename === filename){
                 multiThreadsInfo[i].fileTransfer = fileTransfer;
                 return true;
              }
           }
          
           return false;
        }
        
        var stopUploader = function(){
          console.log('stop uploader...');
          clearInterval(multiThreadsIntervalHandle);
          for (var i=0; i<multiThreadsInfo.length; i++) {
            if (multiThreadsInfo[i].status == 0 && multiThreadsInfo[i].fileTransfer){
              multiThreadsInfo[i].fileTransfer.abort();
            }
          }
        }
        
        abortuploader = stopUploader;

        var tmpFileInfo;
        if (fileInfo) {
            tmpFileInfo = fileInfo;
        } else {
            var index = multiThreadsInfo.length;
            tmpFileInfo = {filename:draftData[index].filename, URI:draftData[index].URI, status:0, tryCount:0, time:0};
            multiThreadsInfo.push(tmpFileInfo);
        }
        var ft = uploadToAliyun(tmpFileInfo.filename, tmpFileInfo.URI, function(result){
            var tmpFileInfo2 = getFileInfo(result.replace(/^.*[\\\/]/, ''));
            if (tmpFileInfo2 == null) {
                console.log("startThreadUploadFile: invalid file info! result="+result);
                return;
            }
            tmpFileInfo2.status = 1;

            console.log("uploaded("+getUploadedCount()+"/"+draftData.length+")..."+multiThreadsInfo.length);
            if (getUploadedCount() == draftData.length) {
                if (callback) {
                    console.log("startThreadUploadFile: suc");
                    stopUploader();
                    multiThreadsInfo = [];
                    callback('Suc');
                }
                return;
            }

            if (!hasErrorUpload()) {
                if (multiThreadsInfo.length < draftData.length) {
                    runningThreadCount++;
                    startThreadUploadFile(draftData, null, multiThreadsInfo, callback);
                }
            } else {
                runningThreadCount--;
                if (!hasActiveUpload()) {
                    console.log("startThreadUploadFile: failed, 1");
                    stopUploader();
                    callback(null);
                }
            }
        }, function(filename) {
            console.log("uploaded failed: filename="+filename);
            stopUploader();
          
            var tmpFileInfo3 = getFileInfo(filename);
            if (tmpFileInfo3 == null) {
                console.log("startThreadUploadFile: invalid file info! filename="+filename);
                return;
            }
            if (tmpFileInfo3.tryCount >= 1) {
                console.log("!!Abort, "+ filename +", tried "+tmpFileInfo3.tryCount+" times.");
                tmpFileInfo3.status = -1;
                runningThreadCount--;
                if (!hasActiveUpload()) {
                    console.log("startThreadUploadFile: failed, 2");
                    clearInterval(multiThreadsIntervalHandle);
                    callback(null);
                }
                return;
            }
            if (!hasErrorUpload()) {
                tmpFileInfo3.tryCount += 1;
                console.log("uploaded("+getUploadedCount()+"/"+draftData.length+") failed, trying "+tmpFileInfo.tryCount+"...");
                
                // 错误就不在上传
                //startThreadUploadFile(draftData, tmpFileInfo3, info, callback);
            } else {
                runningThreadCount--;
                if (!hasActiveUpload()) {
                    console.log("startThreadUploadFile: failed, 3.");
                    clearInterval(multiThreadsIntervalHandle);
                    callback(null);
                }
            }
            return;
        });
        
        setFileTransfer(tmpFileInfo.filename, ft);
    }

    multiThreadUploadFileWhenPublishInCordova = function(draftData, postId, callback){
        if(device.platform === 'testAndroid' ){
            Router.go('/posts/'+postId);
            return;
        }
        var uploadedCount = 0;
        //console.log("draftData="+JSON.stringify(draftData));
        if (draftData.length > 0) {
            Template.progressBar.__helpers.get('show')();
            //Session.set('isDelayPublish', false);
            //PUB.page('/progressBar');
//            $('body').css('background-color',"white");
            //$('.addProgress').css('display',"block");
        } else {
            callback('suc');
        }
      
        var multiThreadUploadFileCallback = function(result){
          if (result) {
              Template.progressBar.__helpers.get('close')()
              //Session.set('progressBarWidth', 100);
              console.log("Jump to post page...");
              //$('.addProgress').css('display',"none");
//                $('body').css('background-color',"#111");
              PUB.pagepop();//Pop addPost page, it was added by PUB.page('/progressBar');
              //Router.go('/posts/'+postId);
              callback('suc');
              //PUB.alert("上传图片失败。");
              console.log("multiThreadUploadFile, suc");
              //callback(null);
          } else {
              navigator.notification.confirm('上传图片失败，需要重新上传吗？',function(index){
                if(index === 1){
                  uploadingFilesInfo.filesCount = draftData.length;
                  uploadingFilesInfo.files = [];
                  multiThreadUploadFile(draftData, 5, multiThreadUploadFileCallback);
                }else{
                  Template.progressBar.__helpers.get('close')();
                }
              }, '提示', ['重新','稍后上传']);
          }
        }
      
        uploadingFilesInfo.filesCount = draftData.length;
        uploadingFilesInfo.files = [];
        multiThreadUploadFile(draftData, 5, multiThreadUploadFileCallback);
        return;
    }

    uploadFileWhenPublishInCordova = function(draftData, postId){
        if(device.platform === 'testAndroid' ){
            Router.go('/posts/'+postId);
            return;
        }
        var uploadedCount = 0;
        //console.log("draftData="+JSON.stringify(draftData));
        if (draftData.length > 0) {
            Session.set('isDelayPublish', false);
//            PUB.page('/progressBar');
          $('.addProgress').css('display',"block");
        }
        uploadingFilesInfo.filesCount = draftData.length;
        uploadingFilesInfo.files = [];
        for (var i=0; i<draftData.length; i++) {
            uploadToAliyun(draftData[i].filename, draftData[i].URI, function(result){
            //uploadToBCS(draftData[i].filename, draftData[i].URI, function(result){
                uploadedCount++;
                console.log("uploading("+uploadedCount+"/"+draftData.length+")...");
                if (uploadedCount == draftData.length) {
                    /*window.imagePicker.cleanupPersistentDirectory(function(result2){
                        console.log('cleanupPersistentDirectory suc ');
                    }, function (error){
                        console.log('cleanupPersistentDirectory Error ' + error);
                    });*/
                    Session.set('progressBarWidth', 100);
                    console.log("Jump to post page...");
//                    $('body').css('background-color',"#111");
                    $('.addProgress').css('display',"none");
                    Router.go('/posts/'+postId);
                }
            });
        }
    }

    selectMediaFromAblum = function(max_number, callback){
      if(device.platform === 'testAndroid' ){
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
              console.log('File name ' + filename);
              //uploadToS3(filename,results[i],callback);
              //uploadToBCS(filename,s,callback);
              uploadToBCS(filename,s,function(result){
                //file:///storage/sdcard0/Android/data/org.hotshare.everywhere/cache/modified.jpg?1420855054212
                //var cdvfilepath = s.replace(/file:\/\/\/storage\/emulated\/0\//, '');
                //console.log("cdvfilepath = "+ cdvfilepath);
                var params = {filename:filename, URI:s, smallImage:result}
                callback(null, params);
              });
          }, function(s){
              if(callback){
                  callback(null);
              }
          }, {
            quality: 90,
            targetWidth: 600,
            targetHeight: 600,
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
            if (length == 0) {
              callback('cacel');
              //PUB.back();
              return;
            }
            if(device.platform === 'Android' ){
                var retArray = [];
                var retCount = 0;
                for (var i = 0; i < length; i++) {
                  var timestamp = new Date().getTime();
                  var originalFilename = results[i].replace(/^.*[\\\/]/, '');
                  var filename = Meteor.userId()+'_'+timestamp+ '_' + originalFilename.replace(/%/g, '');
                  console.log('File name ' + filename);

                  var params = {filename:filename, originalFilename:originalFilename, URI:results[i], smallImage:''};
                  //callback(null, params);
                  //You mustnt saved all data to server
                  var fileExt = filename.split('.').pop();
                  retArray.push(params);
                  if(fileExt.toUpperCase()==='GIF'){
                  ImageBase64.base64({
                        uri: results[i],
                        quality: 90,
                        width: 600,
                        height: 600
                    },
                    function(a) {
                        for (var item in retArray) {
                          if (retArray[item].URI == a.imageURI) {
                            retCount++;
                            retArray[item].smallImage = "data:image/jpg;base64,"+a.base64;
                            //callback(null, retArray[item]);
                            //retArray.slice(item, 1);
                            if(retCount===length)
                            {
                                for (var item in retArray) {
                                    //console.log("retArray["+item+"].originalFilename="+retArray[item].originalFilename);
                                    callback(null, retArray[item]);
                                }
                            }
                            break;
                          }
                        }
                    },
                    function(e) {
                        console.log("error" + e);
                    });
                  }else{
                  window.resolveLocalFileSystemURL(results[i], function(fileEntry) {
                    fileEntry.file(function(file) {
                      var reader = new FileReader();
                      reader.onloadend = function(event) {
                          var localURL = event.target._localURL;
                          //console.log("event.target="+localURL.replace(/^.*[\\\/]/, ''));
                          for (var item in retArray) {
                            if (retArray[item].originalFilename == localURL.replace(/^.*[\\\/]/, '')) {
                              retCount++;
                              retArray[item].smallImage = event.target.result;
                              //callback(null, retArray[item]);
                              //retArray.slice(item, 1);
                              if(retCount===length)
                              {
                                  for (var item in retArray) {
                                      //console.log("retArray["+item+"].originalFilename="+retArray[item].originalFilename);
                                      callback(null, retArray[item]);
                                  }
                              }
                              break;
                            }
                          }
                      };
                      reader.readAsDataURL(file);
                    }, function(e) {
                        console.log('fileEntry.file Error = ' + e);
                    });

                  }, function(e) {
                    console.log('resolveLocalFileSystemURL Error = ' + e);
                  });
                  }
                }
            } else {
                for (var i = 0; i < length; i++) {
                  var timestamp = new Date().getTime();
                  var originalFilename = results[i].replace(/^.*[\\\/]/, '');
                  var filename = Meteor.userId()+'_'+timestamp+ '_' + originalFilename;
                  console.log('File name ' + filename);
                  //uploadToS3(filename,results[i],callback);
                  //uploadToBCS(filename,results[i],callback);
                  var params = {filename:filename, URI:results[i], smallImage:'cdvfile://localhost/persistent/drafts/' + originalFilename}
                  callback(null, params);
                }
            }
          }, function (error){
              console.log('Pick Image Error ' + error);
              if(callback){
                  callback(null);
              }
          }, {
            maximumImagesCount: max_number,
            width: 600,
            height: 600,
            quality: 90,
            storage: 'persistent'
          });
        }
      }

        uploadFile = uploadFileInCordova;
    }
