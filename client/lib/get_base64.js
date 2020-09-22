/**
 * Created by simba on 4/10/15.
 */
if(Meteor.isCordova){
    window.getBase64OfImage = function(filename,originalFilename,URI,callback){
        //var params = {filename:filename, originalFilename:originalFilename, URI:URI, smallImage:''};
        if(withNewFilePath && device.platform === 'iOS'){
            var libIndex = URI.indexOf('Library');
            var filePath = URI.substring(libIndex);
            URI = cordova.file.applicationStorageDirectory+filePath;
            console.log("new file path: " + URI);
        }
        var fileExt = filename.split('.').pop();
        //retArray.push(params);
        if(fileExt.toUpperCase()==='GIF'){
            ImageBase64.base64({
                    uri: URI,
                    quality: 90,
                    width: 600,
                    height: 600
                },
                function(a) {
                    smallImage = "data:image/jpg;base64,"+a.base64;
                    if (callback){
                        callback(URI,smallImage);
                    }
                },
                function(e) {
                    console.log("error" + e);
                    if (callback){
                        callback(URI,null);
                    }
                });
        }else{
            window.resolveLocalFileSystemURL(URI, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function(event) {
                        var localURL = event.target._localURL;
                        //retCount++;
                        smallImage = event.target.result;
                        if (callback){
                            callback(URI,smallImage);
                        }
                    };
                    reader.readAsDataURL(file);
                }, function(e) {
                    console.log('fileEntry.file Error = ' + e);
                    if (callback){
                        callback(URI,null);
                    }
                });

            }, function(e) {
                console.log('resolveLocalFileSystemURL Error = ' + e);
                if (callback){
                    callback(URI,null);
                }
            });
        }

    }
}