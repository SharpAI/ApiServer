if Meteor.isClient
  @analyseUrl = (url,callback)->
    iabRef = window.open(url, '_blank', 'hidden=yes')
    iabRef.addEventListener 'loadstop', ()->
      console.log 'load stop'
      iabRef.executeScript {code: '
        var bgImages = [];
        var returnJson = [];
        function getStyle(x, styleProp) {
          if (x.currentStyle) var y = x.currentStyle[styleProp];
          else if (window.getComputedStyle) var y = document.defaultView.getComputedStyle(x, null).getPropertyValue(styleProp);
          return y;
        }
        // Get all elements on the page
        var elements = document.getElementsByTagName("div");
        // store the results
        var bgIm;
        // iterate over the elements
        for (var i = 0;i<elements.length;i++) {
          // get the background-image style property
          bgIm = getStyle(elements[i], "background-image");
          // if one was found, push it into the array
          if (bgIm && bgIm !== "none") {
            bgImages.push(bgIm);
          }
        }
        if(bgImages.length>0){
          bgImages;
        } else {
          null;
        }'}
      ,(data1)->
        console.log 'return bgImages is ' + data1
        iabRef.executeScript {code: '
          var images = document.getElementsByTagName("img");
          var imgSrc = [];
          var returnJson = {};
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
          if data1
            data["bgArray"] = data1
          callback(data)