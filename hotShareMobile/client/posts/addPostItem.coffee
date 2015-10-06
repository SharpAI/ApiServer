
if Meteor.isClient
  @getImagePath=(path,uri,id)->
    if !path or !id
      return ''
    $selector = $(".image_"+id)
    if path.indexOf('cdvfile://') > -1 and (window.wkwebview or withLocalBase64)
      if $selector and $selector.attr('src') and $selector.attr('src') isnt '' and $selector.attr('src').indexOf('data:') is 0
        return $selector.attr('src')
      fileExtension = uri.replace(/^.*\./, '')
      console.log('Path need to be replaced ' + path + ' this URI ' + uri + ' extension ' + fileExtension)
      `
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function() {
              window.resolveLocalFileSystemURL(uri, function (fileEntry) {
                  fileEntry.file(function (file) {
                      var reader = new FileReader();
                      reader.onloadend = function (event) {
                          var localURL = event.target._localURL;
                          //retCount++;
                          var smallImage = event.target.result;
                          console.log('got small image ');
                          $(".image_"+id).attr('src',smallImage);
                      };
                      reader.readAsDataURL(file);
                  }, function (e) {
                      console.log('fileEntry.file Error = ' + e);
                  });
              }, function (e) {
                  console.log('resolveLocalFileSystemURL Error = ' + e);
              });
          },function(){
              console.log('Request file system error');
          });
      `
      return ''
    path
  Template.addPostItem.helpers
    calcStyle: ()->
      # For backforward compatible. Only older version set style directly
      if this.style and this.style isnt ''
        ''
      else
        calcTextItemStyle(this.layout)
    getImagePath: (path,uri,id)->
      getImagePath(path,uri,id)
  Template.addPostItem.events
