if Meteor.isClient
  @seekSuitableImageFromArray = (imageArray,callback)->
    @imageCounter = 0
    @foundImages = 0
    unless @imageResolver
      @imageResolver = new Image()
    imageResolver.onload = ->
      height = imageResolver.height
      width = imageResolver.width
      console.log imageArray[imageCounter] + ' width is ' + width + ' height is ' + height
      if height >= 150 and width >= 150
        console.log 'This image can be used ' + imageArray[imageCounter] + ' width is ' + width + ' height is ' + height
        callback imageArray[imageCounter],width,height, ++foundImages,imageCounter,imageArray.length
      if ++imageCounter < imageArray.length
        imageResolver.src = imageArray[imageCounter]
      else
        callback null,0,0,foundImages,imageCounter,imageArray.length
    imageResolver.onerror = ->
      console.log 'image resolve url got error'
      if ++imageCounter < imageArray.length
        imageResolver.src = imageArray[imageCounter]
      else
        callback null,0,0,foundImages,imageCounter,imageArray.length
    imageResolver.src = imageArray[imageCounter]
  @analyseUrl = (url,callback)->
    @iabRef = window.open(url, '_blank', 'hidden=yes')
    iabRef.addEventListener 'loadstop', ()->
      console.log 'load stop'
      Meteor.setTimeout ()->
        getImagesListFromUrl(iabRef,url,callback)
      ,3000
    iabRef.addEventListener 'loaderror', ()->
      console.log 'load error'
      if callback
        callback(null,0,0)
  @reAnalyseUrl = (url,callback)->
    unless iabRef
      callback(null,0,0)
      return
    getImagesListFromUrl(iabRef,url,callback)
  @clearLastUrlAnalyser = ()->
    if iabRef
      iabRef.close()
      iabRef = undefined
  @processInAppInjectionData = (data,callback)->
    imageArray = []
    #console.log 'Url Analyse result is ' + JSON.stringify(data)
    if data.imageArray
      for img in data.imageArray
        if img and img.startsWith("http")
          imageArray.push img
    if data.bgArray
      for bgImg in data.bgArray
        imageUrl = (bgImg.match( /url\([^\)]+\)/gi ) ||[""])[0].split(/[()'"]+/)[1]
        if imageUrl and imageUrl.startsWith("http")
          imageArray.push imageUrl
    console.log 'Got images to be anylised ' + JSON.stringify(imageArray)
    if imageArray.length > 0
      seekSuitableImageFromArray imageArray,(url,w,h,found,index,length)->
        if url
          callback(url,w,h,found,index,length)
        else
          callback(null,0,0,found,index,length)
  getImagesListFromUrl = (inappBrowser,url,callback)->
    inappBrowser.executeScript {
        code: 'document.body.innerHTML'}
    ,(data)->
      data.bgArray = []
      data.imageArray = []
      documentBody = $.parseHTML( data.body )
      documentBody.innerHTML = data.body
      extracted = extract(documentBody)
      data.fullText = $(extracted).text()
      #toDisplay = fullText.substring(0, 200)
      console.log 'FullText is ' + data.fullText
      $(documentBody).find('img').each ()->
        console.log 'this ' + $(this).attr('src')
        data.imageArray.push $(this).attr('src')
      $(documentBody).find('div').each ()->
        bg_url = $(this).css('background-image')
        # ^ Either "none" or url("...urlhere..")
        if bg_url and bg_url isnt ''
          bg_url = /^url\((['"]?)(.*)\1\)$/.exec(bg_url)
          # If matched, retrieve url, otherwise ""
          if bg_url
            bg_url =  bg_url[2]
            console.log 'got url ' + bg_url
            data.bgArray.push bg_url
      console.log 'title is ' + data.title + ' host is ' + data.host
      callback data

  #callback(data[0])
  getImagesListFromUrlOld = (inappBrowser,url,callback)->
    inappBrowser.executeScript {
      code: '
        function toBeRun(){
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
          if(document.body){
            returnJson["body"] = document.body.innerHTML;
            returnJson["bodyLength"] = document.body.innerHTML.length;
          }
          return returnJson;
        }
        toBeRun();
      '}
    ,(data)->
      console.log 'return Image Src is ' + JSON.stringify(data)
      callback(data[0])