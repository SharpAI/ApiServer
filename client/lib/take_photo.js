if (Meteor.isCordova) {
  function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
  }
  window.takePhoto = function(callback){
    var pictureSource = navigator.camera.PictureSourceType;
    var destinationType = navigator.camera.DestinationType;

    navigator.camera.getPicture(function (imageURI) {
      var returnURI = imageURI;
      
      if (device.platform === 'Android'){
        if(imageURI.indexOf('file:///storage/emulated/0')===0){
          console.log('need replace');
          returnURI = replaceAll("file:///storage/emulated/0", 'cdvfile://localhost/persistent',imageURI);
        }
      } else if (device.platform === 'iOS') {
      }
      console.log('image uri is ' + returnURI);
      if(callback){
        callback(returnURI);
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