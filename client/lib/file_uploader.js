
if (Meteor.isCordova){
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
    var uploadToBCS = function(filename,URI,callback){
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
          if(callback){
              callback(null);
          }
        }, options,true);
      });
    }
    /**
    * upload file in cordova with plugin for select/resize file to S3
    *
    * @method uploadFileInCordova
    * @param {Function} callback
    * @return {Object} url in callback
    */
    var uploadFileInCordova = function(callback){
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
            quality: 60,
            targetWidth: 400,
            targetHeight: 400,
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
            width: 400,
            height: 400,
            quality: 60
          });
        }
        }
        uploadFile = uploadFileInCordova;
    }