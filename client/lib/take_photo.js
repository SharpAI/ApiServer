if (Meteor.isCordova) {
  function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
  }
  window.takePhoto = function(callback){
    var pictureSource = navigator.camera.PictureSourceType;
    var destinationType = navigator.camera.DestinationType;

    navigator.camera.getPicture(function (imageURI) {
      var returnURI = imageURI;
      var timestamp = new Date().getTime();
      var retVal = {filename:'', URI:'', smallImage:''};
      retVal.filename = Meteor.userId()+'_'+timestamp+ '_'+imageURI.replace(/^.*[\\\/]/, '');
      retVal.URI = imageURI;
      
      if (device.platform === 'Android'){
        if(imageURI.indexOf('file:///storage/emulated/0')===0){
          console.log('need replace');
          //returnURI = replaceAll("file:///storage/emulated/0", 'cdvfile://localhost/persistent',imageURI);
          window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
            fileEntry.file(function(file) {
              var reader = new FileReader();
              reader.onloadend = function(event) {
                  retVal.smallImage = event.target.result;
                  if(callback){
                    callback(retVal);
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
      } else if (device.platform === 'iOS') {
        console.log('image uri is ' + returnURI);
        //if(callback){
        //  callback(returnURI);
        //}
      }
    }, function(){
      console.log('take photo failed');
      if(callback){
        callback(null);
      }
    }, { quality: 50,
    destinationType: destinationType.FILE_URI,
    sourceType: pictureSource.CAMERA,
    saveToPhotoAlbum: true});
  }
}