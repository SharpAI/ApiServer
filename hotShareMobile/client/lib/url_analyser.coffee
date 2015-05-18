if Meteor.isClient
  @seekSuitableImageFromArray = (imageArray,callback,minimal)->
    @imageCounter = 0
    @foundImages = 0
    if minimal
      minimalWidthAndHeight = minimal
    else
      minimalWidthAndHeight = 150
    unless @imageResolver
      @imageResolver = new Image()
    imageResolver.onload = ->
      height = imageResolver.height
      width = imageResolver.width
      console.log imageArray[imageCounter] + ' width is ' + width + ' height is ' + height
      if height >= minimalWidthAndHeight and width >= minimalWidthAndHeight
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
      getImagesListFromUrl(iabRef,url,callback)
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
  @processInAppInjectionData = (data,callback,minimal)->
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
      ,minimal
    else
      callback(null,0,0,0,0,0)
  @getImagesListFromUrl = (inappBrowser,url,callback)->
    inappBrowser.executeScript {
        code: '
          var returnJson = {};
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
          if(window.location.protocol){
            returnJson["protocol"] = window.location.protocol;
          }
          returnJson;
      '}
    ,(data)->
      if data[0]
        console.log 'data0 is ' + JSON.stringify(data[0])
        data = data[0]
      data.bgArray = []
      data.imageArray = []
      documentBody = $.parseHTML( data.body )
      documentBody.innerHTML = data.body
      extracted = extract(documentBody)
      data.fullText = $(extracted).text()
      $(documentBody).find('img').each ()->
        src = $(this).attr('src')
        if src and src isnt ''
          unless src.startsWith('http')
            if src.startsWith('//')
              src = data.protocol + src
            else if src.startsWith('/')
              src = data.protocol + '//' + data.host + '/' + src
          console.log 'Image Src: ' + src
          if (data.imageArray.indexOf src) <0
            data.imageArray.push src
      $(documentBody).find('input').each ()->
        src = $(this).attr('src')
        if src and src isnt '' and src.startsWith('http')
          if (data.imageArray.indexOf src) <0
            console.log 'Got src is ' + src
            data.imageArray.push src
      $(documentBody).find('div').each ()->
        bg_url = $(this).css('background-image')
        # ^ Either "none" or url("...urlhere..")
        if bg_url and bg_url isnt ''
          bg_url = /^url\((['"]?)(.*)\1\)$/.exec(bg_url)
          # If matched, retrieve url, otherwise ""
          if bg_url
            bg_url =  bg_url[2]
            if bg_url and bg_url isnt ''
              unless bg_url.startsWith('http')
                bg_url = data.protocol + '//' + data.host + '/' + bg_url
              console.log 'Background Image: ' + bg_url
              if (data.bgArray.indexOf bg_url) <0
                data.bgArray.push bg_url
      pattern = /data-src=\"([\s\S]*?)(?=\")/g
      result = data.body.match(pattern)
      if result and result.length > 0
        console.log 'result ' + JSON.stringify(result)
        for subString in result
          dataSrc = subString.substring(10, subString.length)
          if (data.imageArray.indexOf dataSrc) <0 and (data.bgArray.indexOf dataSrc) <0
            data.imageArray.push(dataSrc)
            console.log 'push dataSrc: ' + dataSrc
      pattern = /data-url=\"([\s\S]*?)(?=\")/g
      result = data.body.match(pattern)
      if result and result.length > 0
        console.log 'result ' + JSON.stringify(result)
        for subString in result
          dataSrc = subString.substring(10, subString.length)
          if (data.imageArray.indexOf dataSrc) <0 and (data.bgArray.indexOf dataSrc) <0
            data.imageArray.push(dataSrc)
            console.log 'push dataSrc: ' + dataSrc
      #console.log data.body
      callback data
