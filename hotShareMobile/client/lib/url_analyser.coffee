if Meteor.isClient
  @seekSuitableImageFromArray = (imageArray,callback)->
    @imageCounter = 0
    unless @imageResolver
      @imageResolver = new Image()
    imageResolver.onload = ->
      height = imageResolver.height
      width = imageResolver.width
      console.log imageArray[imageCounter] + ' width is ' + width + ' height is ' + height
      if height >= 200 and width >= 200
        console.log 'This image can be used ' + imageArray[imageCounter] + ' width is ' + width + ' height is ' + height
        callback imageArray[imageCounter],width,height
      else if ++imageCounter < imageArray.length
        imageResolver.src = imageArray[imageCounter]
      else
        callback null,0,0
    imageResolver.onerror = ->
      console.log 'image resolve url got error'
      if ++imageCounter < imageArray.length
        imageResolver.src = imageArray[imageCounter]
      else
        callback null,0,0
    imageResolver.src = imageArray[imageCounter]
  @analyseUrl = (url,callback)->
    iabRef = window.open(url, '_blank', 'hidden=no')
    iabRef.addEventListener 'loadstop', ()->
      console.log 'load stop'
      setTimeout ()->
        getImagesListFromUrl(iabRef,url,callback)
      ,2000
  getImagesListFromUrl = (inappBrowser,url,callback)->
    inappBrowser.executeScript {code: '
      var bgImages = [];
      var elements = document.getElementsByTagName("div");
      var bgIm;
      var images = document.getElementsByTagName("img");
      var imgSrc = [];
      var returnJson = {};
      function getStyle(x, styleProp) {
        if (x.currentStyle) var y = x.currentStyle[styleProp];
        else if (window.getComputedStyle) var y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
        return y;
      }
      for (var i = 0;i<elements.length;i++) {
        bgIm = getStyle(elements[i], "background-image");
        if (bgIm && bgIm !== "none") {
          bgImages.push(bgIm);
        }
      }
      if(bgImages.length>0){
        returnJson["bgArray"] = bgImages;
      }
      for (var i = 0; i < images.length; i++) {
        if(images[i].src && images[i].src !==""){
          imgSrc.push(images[i].src);
        }
      }
      if(imgSrc.length > 0){
        returnJson["imageArray"] = imgSrc;
      }
      if(document.title){
        returnJson["title"] = document.title;
      }
      if(location.host){
        returnJson["host"] = location.host;
      }
      returnJson;'}
    ,(data)->
      console.log 'return Image Src is ' + JSON.stringify(data)
      callback(data[0])