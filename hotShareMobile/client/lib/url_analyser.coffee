if Meteor.isClient
  @analyseUrl = (url,callback)->
    iabRef = window.open(url, '_blank', 'hidden=yes')
    iabRef.addEventListener 'loadstop', ()->
      console.log 'load stop'
      iabRef.executeScript {code: '
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