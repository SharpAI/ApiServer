if Meteor.isClient
  showDebug=false
  importColor=false
  titleRules = [
    # link string, class name
    {prefix:'view.inews.qq.com',titleClass:'title'},
    {prefix:'buluo.qq.com',titleClass:'post-title'},
    {prefix:'wap.koudaitong.com',titleClass:'custom-title.wx_template .title'}
  ]
  hostnameMapping = [
    {hostname:'mp.weixin.qq.com',displayName:'微信公众号'},
    {hostname:'m.toutiao.com',displayName:'头条'},
    {hostname:'news.shou.com',displayName:'搜狐新闻'},
    {hostname:'m.shou.com',displayName:'搜狐'},
    {hostname:'www.zhihu.com',displayName:'知乎'},
    {hostname:'card.weibo.com',displayName:'微博'},
    {hostname:'mil.sohu.com',displayName:'搜狐军事'},
    {hostname:'wap.koudaitong.com',displayName:'罗辑思维'}
  ]
  musicExtactorMapping = [
    {
      musicClass:'.qqmusic_area',
      musicUrlSelector:'.qqmusic_area .qqmusic_thumb',
      musicUrlAttr:'data-autourl',
      musicImgSelector:'.qqmusic_area .qqmusic_thumb',
      musicImgAttr:'src',
      musicSongNameSelector:'.qqmusic_area .qqmusic_songname',
      musicSingerNameSelector:'.qqmusic_area .qqmusic_singername'
    },
    {
      musicClass:'mpvoice',
      musicUrlSelector:'mpvoice',
      musicUrlAttr:'voice_encode_fileid',
      prefixToMusicUrl:'http://res.wx.qq.com/voice/getvoice?mediaid=',
      musicImgSelector:'',
      musicImgAttr:'',
      musicSongNameSelector:'.audio_area .audio_info_area .audio_title',
      musicSingerNameSelector:'.audio_area .audio_info_area .audio_source'
    }
  ]
  musicExtactorScriptMapping = [
    {
      url: 'http://douban.fm/?start='
      getMusic: (node)->
        text = node.innerHTML
        if text.indexOf('window.__bootstrap_data') isnt -1
          eval(text)
          if window.__bootstrap_data.song
            return {
              playUrl: window.__bootstrap_data.song.url
              image: window.__bootstrap_data.song.picture
              songName: window.__bootstrap_data.song.title
              singerName: window.__bootstrap_data.song.artist
            }
        
        return null
    }
    {
      url: 'http://fm.qzone.qq.com/luobo/radio?_wv=1&showid='
      getMusic: (node)->
        text = node.innerHTML
        if text.indexOf('showData:{"') isnt -1
          text = text.substr(text.indexOf('showData:{"') + 'showData:'.length)
          text = text.substring(0, text.indexOf('"}},')+3)
          obj = JSON.parse(text)
          return {
            playUrl: obj.data.url
            image: obj.data.cover
            songName: obj.data.name
            singerName: obj.data.ownername
          }
        return null
    }
  ]
  musicExtactorMappingV2 = [
    {
      tagName:'QQMUSIC',
      musicClass:'',
      musicId: '',
      getMusicUrl:(node)->
        if node and node.parentNode
          playUrl=$(node.parentNode).find('.qqmusic_area .qqmusic_thumb').attr('data-autourl')
          console.log('getMusicUrl '+playUrl)
          return playUrl
        ''
      getMusicThumbImageURL:(node)->
        console.log('getMusicThumbImageURL')
        if node and node.parentNode
          return $(node.parentNode).find('.qqmusic_area .qqmusic_thumb').attr('src')
        ''
      getMusicSongName:(node)->
        console.log('GetMusicSongName')
        if node and node.parentNode
          return $(node.parentNode).find('.qqmusic_area .qqmusic_songname').text()
        ''
      getMusicSingerName:(node)->
        console.log('getMusicSingerName')
        if node and node.parentNode
          return $(node.parentNode).find('.qqmusic_area .qqmusic_singername').text()
        ''
      cleanUp:(node)->
        if node and node.parentNode
          return $(node.parentNode).remove('.qqmusic_area')
    },
    {
      tagName:'MPVOICE',
      musicClass:'',
      musicId: '',
      getMusicUrl:(node)->
        playUrl = node.getAttribute('voice_encode_fileid');
        if playUrl and playUrl isnt ''
          playUrl = 'http://res.wx.qq.com/voice/getvoice?mediaid='+playUrl
          console.log('getMusicUrl '+playUrl)
          return playUrl
        ''
      getMusicThumbImageURL:(node)->
        console.log('getMusicThumbImageURL None')
        ''
      getMusicSongName:(node)->
        console.log('GetMusicSongName')
        if node and node.parentNode
          return $(node.parentNode).find('.audio_area .audio_info_area .audio_title').text()
        ''
      getMusicSingerName:(node)->
        console.log('getMusicSingerName')
        if node and node.parentNode
          return $(node.parentNode).find('.audio_area .audio_info_area .audio_source').text()
        ''
      cleanUp:(node)->
        if node and node.parentNode
          return $(node.parentNode).remove('.audio_area')
    },
    {
      tagName:'',
      musicClass:'',
      musicId: 'jp_container_1',
      getMusicUrl:(node)->
        if node and node.parentNode
          for item in $(node.parentNode)
            if item.tagName is 'SCRIPT'
              text = item.innerHTML
              if text.indexOf('mp3:"/') isnt -1
                text = text.substr(text.indexOf('mp3:"/')+5)
                text = text.substring(0, text.indexOf('.mp3"') + 4)
                return 'http://yuedu.fm' + text
        ''
      getMusicThumbImageURL:(node)->
        if node and node.parentNode
          return $(node).find('.cover img').attr('src')
        ''
      getMusicSongName:(node)->
        console.log('GetMusicSongName')
        if node and node.parentNode
          return $(node).find('.item-title h1').text()
        ''
      getMusicSingerName:(node)->
        console.log('getMusicSingerName')
        if node and node.parentNode
          return $(node).find('.item-title p').text()
        ''
      cleanUp:(node)->
        if node and node.parentNode
          return $(node.parentNode).remove('#jp_container_1')
    }
  ]
  @getMusicFromNode = (node) ->
    console.log(node)
    for s in musicExtactorMappingV2
      if ((s.tagName and s.tagName isnt '' and node.tagName is s.tagName) or (s.musicId and s.musicId isnt '' and node.id is s.musicId) or (s.className and (s.className isnt '') and (node.className is s.className)))
        if typeof(s.getMusicUrl) is 'function'
          playUrl = s.getMusicUrl(node)
        if typeof(s.getMusicThumbImageURL) is 'function'
          image = s.getMusicThumbImageURL(node)
        if typeof(s.getMusicSongName) is 'function'
          songName = s.getMusicSongName(node)
        if typeof(s.getMusicSingerName) is 'function'
          singerName = s.getMusicSingerName(node)
        if typeof(s.cleanUp) is 'function'
          s.cleanUp(node)
        if playUrl
          musicElement = document.createElement("musicExtracted")
          musicElement.setAttribute('playUrl',playUrl)
          musicElement.setAttribute('image',image)
          musicElement.setAttribute('songName',songName)
          musicElement.setAttribute('singerName',singerName)
          node.appendChild(musicElement)
          musicInfo = {
            playUrl : playUrl,
            image : image,
            songName : songName,
            singerName: singerName
          }
          console.log('Got Music Info '+JSON.stringify(musicInfo))
          return musicInfo
    return null
  @getMusicFromScript = (url, page)->
    for mapping in musicExtactorScriptMapping
      if (url.toLowerCase().indexOf(mapping.url) is 0)
        return extractScript(page, mapping.getMusic)

    return null
  getMusicFromPage = (page) ->
    for s in musicExtactorMapping
      if $(page).find(s.musicClass).length > 0
        playUrl = $(page).find(s.musicUrlSelector).attr(s.musicUrlAttr)
        if s.prefixToMusicUrl and s.prefixToMusicUrl isnt ''
          playUrl = s.prefixToMusicUrl + playUrl
        if s.musicImgSelector and s.musicImgSelector isnt ''
          image = $(page).find(s.musicImgSelector).attr(s.musicImgAttr)
        songName = $(page).find(s.musicSongNameSelector).text()
        singerName = $(page).find(s.musicSingerNameSelector).text()
        console.log('found music element ' + playUrl + ' image ' + image + ' song name ' + songName + ' singer ' + singerName)
        $(page).find(s.musicClass).remove()
        if playUrl
          return {
            playUrl : playUrl,
            image : image,
            songName : songName,
            singerName: singerName
          }
    return null
  ###
  http://stackoverflow.com/a/1634841/3380894
  To remove the width/height parameter in url, center the video play icon
  ###
  `function removeURLParameter(url, parameter) {
      //prefer to use l.search if you have a location/link object
      var urlparts= url.split('?');
      if (urlparts.length>=2) {

          var prefix= encodeURIComponent(parameter)+'=';
          var pars= urlparts[1].split(/[&;]/g);

          //reverse iteration as may be destructive
          for (var i= pars.length; i-- > 0;) {
              //idiom for string.startsWith
              if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                  pars.splice(i, 1);
              }
          }

          url= urlparts[0]+'?'+pars.join('&');
          return url;
      } else {
          return url;
      }
  }`
  @seekSuitableImageFromArray = (imageArray,callback,minimal,onlyOne)->
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
      showDebug&&console.log imageArray[imageCounter] + ' width is ' + width + ' height is ' + height
      if height >= minimalWidthAndHeight and width >= minimalWidthAndHeight
        showDebug&&console.log 'This image can be used ' + imageArray[imageCounter] + ' width is ' + width + ' height is ' + height
        callback imageArray[imageCounter],width,height, ++foundImages,imageCounter,imageArray.length
        if onlyOne
          return
      if ++imageCounter < imageArray.length
        imageResolver.src = imageArray[imageCounter]
      else
        callback null,0,0,foundImages,imageCounter,imageArray.length
    imageResolver.onerror = ->
      showDebug&&console.log 'image resolve url got error'
      if ++imageCounter < imageArray.length
        imageResolver.src = imageArray[imageCounter]
      else
        callback null,0,0,foundImages,imageCounter,imageArray.length
    imageResolver.src = imageArray[imageCounter]
  @seekSuitableImageFromArrayAndDownloadToLocal = (imageArray,callback,minimal,onlyOne)->
    @imageCounter = 0
    @foundImages = 0
    if minimal
      minimalWidthAndHeight = minimal
    else
      minimalWidthAndHeight = 150
    downloadHandler = (downloadedUrl,source,file)->
      #showDebug&&console.log('Got downloaded URL ' + downloadedUrl)
      if downloadedUrl
        onSuccess(downloadedUrl,source,file)
      else
        onError(source)
    onSuccess = (url,source,file)->
      #showDebug&&console.log('To call get_image_size_from_URI on ' + url)
      get_image_size_from_URI(url,(width,height)->
        #showDebug&&console.log url + ' width is ' + width + ' height is ' + height
        if height >= minimalWidthAndHeight and width >= minimalWidthAndHeight
          #showDebug&&console.log 'This image can be used ' + imageArray[imageCounter] + ' width is ' + width + ' height is ' + height
          callback file,width,height, ++foundImages,imageCounter,imageArray.length,source
          if onlyOne
            return
        if ++imageCounter < imageArray.length
          #showDebug&&console.log('imageCounter ' + imageCounter + ' imageArray.length ' + imageArray.length)
          downloadFromBCS(imageArray[imageCounter],downloadHandler)
        else
          callback null,0,0,foundImages,imageCounter,imageArray.length,source
      )
    onError = (source)->
      showDebug&&console.log 'image resolve url got error'
      if ++imageCounter < imageArray.length
        downloadFromBCS(imageArray[imageCounter],downloadHandler)
      else
        callback null,0,0,foundImages,imageCounter,imageArray.length,null,source
    downloadFromBCS(imageArray[imageCounter],downloadHandler)

  @analyseUrl = (url,callback)->
    @iabRef = window.open(url, '_blank', 'hidden=yes')
    iabRef.addEventListener 'loadstop', ()->
      showDebug&&console.log 'load stop'
      getImagesListFromUrl(iabRef,url,callback)
    iabRef.addEventListener 'loaderror', ()->
      showDebug&&console.log 'load error'
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
  @seekOneUsableMainImage = (data,callback,minimal)->
    imageArray = []
    #showDebug&&console.log 'Url Analyse result is ' + JSON.stringify(data)
    if data.imageArray
      for img in data.imageArray
        if img and img.startsWith("http")
          imageArray.push img
    if data.bgArray
      for bgImg in data.bgArray
        imageUrl = (bgImg.match( /url\([^\)]+\)/gi ) ||[""])[0].split(/[()'"]+/)[1]
        if imageUrl and imageUrl.startsWith("http")
          imageArray.push imageUrl
    showDebug&&console.log 'Got images to be anylised ' + JSON.stringify(imageArray)
    if imageArray.length > 0
      seekSuitableImageFromArrayAndDownloadToLocal imageArray,(file,w,h,found,index,length,source)->
        if file
          showDebug&&console.log('Original source:'+source+'Got local url '+ JSON.stringify(file)+' w:'+w+' h:'+h)
          callback(file,w,h,found,index,length,source)
        else
          showDebug&&console.log('No local url '+' w:'+w+' h:'+h)
          callback(null,0,0,found,index,length,source)
      ,minimal,true
    else
      callback(null,0,0,0,0,0,null)
  @processInAppInjectionData = (data,callback,minimal)->
    imageArray = []
    #showDebug&&console.log 'Url Analyse result is ' + JSON.stringify(data)
    if data.imageArray
      for img in data.imageArray
        if img and img.startsWith("http")
          imageArray.push img
    if data.bgArray
      for bgImg in data.bgArray
        imageUrl = (bgImg.match( /url\([^\)]+\)/gi ) ||[""])[0].split(/[()'"]+/)[1]
        if imageUrl and imageUrl.startsWith("http")
          imageArray.push imageUrl
    showDebug&&console.log 'Got images to be anylised ' + JSON.stringify(imageArray)
    if imageArray.length > 0
      seekSuitableImageFromArray imageArray,(url,w,h,found,index,length)->
        if url
          callback(url,w,h,found,index,length)
        else
          callback(null,0,0,found,index,length)
      ,minimal,false
    else
      callback(null,0,0,0,0,0)
  # data.body, the data to be analyse. (string)
  # return value
  # data.bgArray, the background images
  # data.imageArray, the image in the element
  grabImagesInHTMLString = (data)->
    documentBody = $.parseHTML( data.body )
    documentBody.innerHTML = data.body
    $(documentBody).find('img').each ()->
      dataSrc = $(this).attr('data-src')
      if dataSrc and dataSrc isnt ''
        src = dataSrc
      else
        src = $(this).attr('src')
      if src and src isnt ''
        src = src.replace(/&amp;/g, '&').replace("tp=webp","tp=jpeg")
        unless src.startsWith('http')
          if src.startsWith('//')
            src = data.protocol + src
          else if src.startsWith('/')
            src = data.protocol + '//' + data.host + '/' + src
        showDebug&&console.log 'Image Src: ' + src
        if (data.imageArray.indexOf src) <0
          data.imageArray.push src
    $(documentBody).find('input').each ()->
      src = $(this).attr('src')
      if src and src isnt '' and src.startsWith('http')
        src = src.replace(/&amp;/g, '&').replace("tp=webp","tp=jpeg")
        if (data.imageArray.indexOf src) <0
          showDebug&&console.log 'Got src is ' + src
          data.imageArray.push src
    $(documentBody).find('div').each ()->
      bg_url = $(this).css('background-image')
      # ^ Either "none" or url("...urlhere..")
      if bg_url and bg_url isnt ''
        bg_url = bg_url.replace(/&amp;/g, '&').replace("tp=webp","tp=jpeg")
        bg_url = /^url\((['"]?)(.*)\1\)$/.exec(bg_url)
        # If matched, retrieve url, otherwise ""
        if bg_url
          bg_url =  bg_url[2]
          if bg_url and bg_url isnt ''
            unless bg_url.startsWith('http')
              bg_url = data.protocol + '//' + data.host + '/' + bg_url
            showDebug&&console.log 'Background Image: ' + bg_url
            if (data.bgArray.indexOf bg_url) <0
              data.bgArray.push bg_url
    pattern = /img src=\"([\s\S]*?)(?=\")/g
    result = data.body.match(pattern)
    if result and result.length > 0
      showDebug&&console.log 'result ' + JSON.stringify(result)
      for subString in result
        dataSrc = subString.substring(9, subString.length).replace(/&amp;/g, '&').replace("tp=webp","tp=jpeg")
        if (data.imageArray.indexOf dataSrc) <0 and (data.bgArray.indexOf dataSrc) <0
          data.imageArray.push(dataSrc)
          showDebug&&console.log 'push dataSrc: ' + dataSrc
    pattern = /data-src=\"([\s\S]*?)(?=\")/g
    result = data.body.match(pattern)
    if result and result.length > 0
      showDebug&&console.log 'result ' + JSON.stringify(result)
      for subString in result
        dataSrc = subString.substring(10, subString.length).replace(/&amp;/g, '&').replace("tp=webp","tp=jpeg")
        if (data.imageArray.indexOf dataSrc) <0 and (data.bgArray.indexOf dataSrc) <0
          data.imageArray.push(dataSrc)
          showDebug&&console.log 'push dataSrc: ' + dataSrc
    pattern = /data-url=\"([\s\S]*?)(?=\")/g
    result = data.body.match(pattern)
    if result and result.length > 0
      showDebug&&console.log 'result ' + JSON.stringify(result)
      for subString in result
        dataSrc = subString.substring(10, subString.length).replace(/&amp;/g, '&').replace("tp=webp","tp=jpeg")
        if (data.imageArray.indexOf dataSrc) <0 and (data.bgArray.indexOf dataSrc) <0
          data.imageArray.push(dataSrc)
          showDebug&&console.log 'push dataSrc: ' + dataSrc
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
        showDebug&&console.log 'data0 is ' + JSON.stringify(data[0])
        data = data[0]
      data.bgArray = []
      data.imageArray = []
      grabImagesInHTMLString(data)
      documentBody = $.parseHTML( data.body )
      documentBody.innerHTML = data.body
      extracted = extract(documentBody)
      data.fullText = $(extracted).text()
      #showDebug&&console.log data.body
      callback data
  _html2data = (url, data, callback)->
    Meteor.defer ()->
      if data[0]
        showDebug&&console.log 'data0 is ' + JSON.stringify(data[0])
        data = data[0]
      data.bgArray = []
      data.imageArray = []
      documentBody = $.parseHTML( data.body )
      documentBody.innerHTML = data.body

      for titleRule in titleRules
        if url.indexOf(titleRule.prefix) > -1
          realTitle = $(documentBody).find('.'+titleRule.titleClass).text().replace(/^\s+|\s+$/g, "")
          if realTitle and realTitle isnt ''
            #data.host = data.title
            data.title = realTitle
            break
      for item  in hostnameMapping
        if data.host is item.hostname
          data.host = '摘自 ' + item.displayName
          break

      #musicInfo = getMusicFromPage documentBody
      extracted = getMusicFromScript(url, documentBody)
      if (extracted is null)
        extracted = extract(documentBody)
      toBeInsertedText = ''
      toBeInsertedStyleAlign=''
      previousIsImage = false
      resortedArticle = []
      sortedImages = 0

#      musics = getMusicFromScript(url, documentBody)
#      if(musics.length > 0)
#        for musicInfo in musics
#          resortedArticle.push {type:'music', musicInfo: musicInfo}

      if extracted.id is 'hotshare_special_tag_will_not_hit_other'
        toBeProcessed = extracted
      else
        toBeProcessed = extracted.innerHTML
      console.log($(toBeProcessed))
      previousIsSpan = false
      $(toBeProcessed).children().each (index,node)->
        info = {}
        info.bgArray = []
        info.imageArray = []
        info.body = node.innerHTML
        nodeColor = $(node).css('color')
        nodeBackgroundColor = $(node).css('background-color')
        #iframeNumber = $(node).find('iframe').length
        console.log('    Node['+index+'] tagName '+node.tagName+' text '+node.textContent)
        styleAlign=getStyleInItem(node,'textAlign')
        console.log('    Got style '+styleAlign);
        if node.tagName is 'BR'
          if toBeInsertedText.length > 0
            resortedArticle.push {type:'text',text:toBeInsertedText,layout:{align:toBeInsertedStyleAlign}}
            toBeInsertedText = ''
            toBeInsertedStyleAlign = ''
            previousIsSpan = false
            return true
        else if node.tagName is 'MUSICEXTRACTED'
          if toBeInsertedText and toBeInsertedText isnt ''
            resortedArticle.push {type:'text',text:toBeInsertedText}
            toBeInsertedText = ''

          playUrl=node.getAttribute('playUrl')
          image=node.getAttribute('image')
          songName=node.getAttribute('songName')
          singerName=node.getAttribute('singerName')
          resortedArticle.push {type:'music', musicInfo: {
            playUrl:playUrl
            image:image
            songName:songName
            singerName:singerName
          }}
          previousIsSpan = false
          return true
        text = $(node).text()
        if text and text isnt ''
          text = text.replace(/\s\s\s+/g, '')
        console.log('text '+text)
        if node.tagName == 'IFRAME'
          previousIsSpan = false
          node.width = '100%'
          node.width = '100%'
          node.height = '100%'
          node.src = removeURLParameter(node.src,'width')
          node.src = removeURLParameter(node.src,'height')
          node.src = node.src.replace(/https:\/\//g, 'http://')
          node.removeAttribute("style")
          dataSrc = node.getAttribute('data-src')
          if dataSrc
            dataSrc = removeURLParameter(dataSrc,'width')
            dataSrc = removeURLParameter(dataSrc,'height')
            dataSrc = dataSrc.replace(/https:\/\//g, 'http://')
            node.setAttribute('data-src',dataSrc)
            node.src = dataSrc
          showDebug&&console.log(node.outerHTML)
          if toBeInsertedText and toBeInsertedText isnt ''
            resortedArticle.push {type:'text',text:toBeInsertedText}
            toBeInsertedText = ''
          resortedArticle.push {type:'iframe',iframe:node.outerHTML}
        else if node.tagName == 'IMG'
          previousIsSpan = false
          dataSrc = $(node).attr('data-src')
          if dataSrc and dataSrc isnt ''
            src = dataSrc
          else
            src = $(node).attr('src')
          if src and src isnt ''
            src = src.replace(/&amp;/g, '&').replace("tp=webp","tp=jpeg")
            unless src.startsWith('http')
              if src.startsWith('//')
                src = data.protocol + src
              else if src.startsWith('/')
                src = data.protocol + '//' + data.host + '/' + src
            showDebug&&console.log 'Image Src: ' + src
            previousIsImage = true
            if toBeInsertedText and toBeInsertedText isnt ''
              resortedArticle.push {type:'text',text:toBeInsertedText}
            toBeInsertedText = ''
            sortedImages++;
            resortedArticle.push {type:'image',imageUrl:src}
            data.imageArray.push src
        else if info.body
          grabImagesInHTMLString(info)
          if info.imageArray.length > 0
            showDebug&&console.log('    Got image')
            previousIsImage = true
            previousIsSpan = false
            if toBeInsertedText and toBeInsertedText isnt ''
              resortedArticle.push {type:'text',text:toBeInsertedText}
            toBeInsertedText = ''
            for imageUrl in info.imageArray
              if imageUrl.startsWith('http://') or imageUrl.startsWith('https://')
                showDebug&&console.log('    save imageUrl ' + imageUrl)
                sortedImages++;
                resortedArticle.push {type:'image',imageUrl:imageUrl}
                data.imageArray.push imageUrl
          else if info.bgArray.length > 0
            showDebug&&console.log('    Got Background image')
            previousIsImage = true
            previousIsSpan = false
            if toBeInsertedText and toBeInsertedText isnt ''
              resortedArticle.push {type:'text',text:toBeInsertedText}
            toBeInsertedText = ''
            for imageUrl in info.bgArray
              if imageUrl.startsWith('http://') or imageUrl.startsWith('https://')
                showDebug&&console.log('    save background imageUrl ' + imageUrl)
                sortedImages++
                resortedArticle.push {type:'image',imageUrl:imageUrl}
                data.imageArray.push imageUrl
        if text and text isnt ''
          previousIsImage = false
          showDebug&&console.log '    Got text in this element('+toBeInsertedText.length+') '+text
          showDebug&&console.log 'Text  ['+text+'] color is '+nodeColor+' nodeBackgroundColor is '+nodeBackgroundColor
          ###
          if importColor and nodeColor and nodeColor isnt ''
            if toBeInsertedText.length > 0
              toBeInsertedText += '\n'
              resortedArticle.push {type:'text',text:toBeInsertedText}
              toBeInsertedText = ''
            resortedArticle.push {type:'text',text:text,color:nodeColor,backgroundColor:nodeBackgroundColor}
          else
          ###
          #console.log('Get style '+$(node).attr('style'));
          if toBeInsertedText.length is 0
            toBeInsertedStyleAlign = styleAlign
          if node.tagName is 'SPAN'
            toBeInsertedText +=text
            previousIsSpan = true
          else if previousIsSpan is true
            toBeInsertedText += text
            previousIsSpan = false
            text = ''
          else if toBeInsertedText.length < 20 and styleAlign is toBeInsertedStyleAlign
            if toBeInsertedText.length > 0
              toBeInsertedText += '\n'
            toBeInsertedText += text
          else
            if toBeInsertedText.length > 0
              resortedArticle.push {type:'text',text:toBeInsertedText,layout:{align:toBeInsertedStyleAlign}}
            toBeInsertedText = text;
            toBeInsertedStyleAlign = styleAlign;
      if toBeInsertedText and toBeInsertedText isnt ''
        resortedArticle.push {type:'text',text:toBeInsertedText}
      if sortedImages < 1
        console.log('no image ?')
        grabImagesInHTMLString(data)
        if data.imageArray.length > 0
          for imageUrl in data.imageArray
            if imageUrl.startsWith('http://') or imageUrl.startsWith('https://')
              showDebug&&console.log('    save imageUrl ' + imageUrl)
              resortedArticle.push {type:'image',imageUrl:imageUrl}
        else if data.bgArray.length > 0
          for imageUrl in data.bgArray
            if imageUrl.startsWith('http://') or imageUrl.startsWith('https://')
              showDebug&&console.log('    save background imageUrl ' + imageUrl)
              resortedArticle.push {type:'image',imageUrl:imageUrl}
      data.resortedArticle = resortedArticle
      showDebug&&console.log('Resorted Article is ' + JSON.stringify(data.resortedArticle))
      callback data
  @getContentListsFromUrl = (inappBrowser,url,callback)->
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
      _html2data(url, data, callback)
  @_getContentListsFromUrl_test = (url, callback)->
    headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      'Content-Type': 'text/html; charset=utf-8'
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4'
    }
    Meteor.call 'http_get', url , headers, (error, result)->
      if(error)
        console.log(error)
      else
        returnJson = {}
        html = document.createElement('html')
        html.innerHTML = result.content
        
        if(html.getElementsByTagName('title').length > 0)
          returnJson["title"] = html.getElementsByTagName('title')[0].innerText
        if(html.getElementsByTagName('body').length > 0)
          returnJson["body"] = html.getElementsByTagName('body')[0].innerHTML
          returnJson["bodyLength"] = returnJson["body"].length
        showDebug && console.log(returnJson)
#        treeWalker = document.createTreeWalker(
#          html, NodeFilter.SHOW_TEXT
#          {
#            acceptNode : (node)->
#              console.log(node)
#              return NodeFilter.FILTER_REJECT
#          }
#          false
#        )
        _html2data(url, returnJson, callback)
