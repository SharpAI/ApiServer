
if Meteor.isClient
  getBaseWidth=()->
    ($('.showPosts').width()-30)/6
  getBaseHeight=()->
    ($('.showPosts').width()-30)/6
  layoutHelper=[0,0,0,0,0,0]
  imageMarginPixel=5
  @layoutHelperInit = ()->
    layoutHelper=[0,0,0,0,0,0]
  getLayoutTop=(helper,col,sizeX)->
    max=0
    for i in [col..(col+sizeX-1)]
      console.log("helper[(i-1)]="+helper[(i-1)])
      value = if helper[(i-1)] then helper[(i-1)] else 0
      max=Math.max(max,value)
    max
  updateLayoutData=(helper,col,sizeX,bottom)->
    for i in [col..(col+sizeX-1)]
      helper[(i-1)]=bottom
  Template.postItem.onRendered ()->
    element=this.find('.element')
    myData=this.data
    parentNode=element.parentNode
    if myData.index is 0
      #Initial the layoutHelper
      #msgBoxHeight = if Feeds.find({followby: Meteor.userId(), isRead:{$ne: true}, checked:{$ne: true}}).count() > 0 then 65 else 0
      #console.log("!!!parentNode.offsetTop = "+parentNode.offsetTop+", msgBoxHeight="+msgBoxHeight)
      #updateLayoutData(layoutHelper,1,6,parentNode.offsetTop+msgBoxHeight)
      updateLayoutData(layoutHelper,1,6,parentNode.offsetTop)
    console.log("myData.data_col="+myData.data_col+", myData.data_sizex="+myData.data_sizex+", "+getLayoutTop(layoutHelper,myData.data_col,myData.data_sizex))
    element.style.top=getLayoutTop(layoutHelper,myData.data_col,myData.data_sizex)+imageMarginPixel+'px'
    console.log("element.style.top="+element.style.top)
    if myData.data_col isnt 1
      element.style.left=(parentNode.offsetLeft+(myData.data_col-1)*getBaseWidth()+imageMarginPixel)+'px'
      element.style.width=(myData.data_sizex*getBaseWidth()-imageMarginPixel)+'px'
    else
      element.style.left=parentNode.offsetLeft+(myData.data_col-1)*getBaseWidth()+'px'
      element.style.width=myData.data_sizex*getBaseWidth()+'px'
    if myData.type is 'image'
      element.style.height=myData.data_sizey*getBaseHeight()+'px'
    else if myData.type is 'video'
      element.style.height=myData.data_sizey*getBaseHeight()+'px'
    elementBottom=element.offsetTop+element.offsetHeight
    updateLayoutData(layoutHelper,myData.data_col,myData.data_sizex,elementBottom)
    parentNode.style.height=getLayoutTop(layoutHelper,1,6)-parentNode.offsetTop+'px'

    #$('#'+myData._id).linkify()
    this.$('.textDiv1Link').linkify();
    element.style.visibility = '';
    #console.log('['+this.data.index+']'+' '+myData.type+' col '+myData.data_col+
    #    ' row '+myData.data_row+' h '+myData.data_sizey+' w '+myData.data_sizex+
    #    ' H '+element.offsetHeight+'/'+element.clientHeight+' W '+element.offsetWidth+' Top '+element.offsetTop
    #)
  Template.postItem.events
    'click .thumbsUp': (e)->
      Session.set("pcommetsId","")
      thumbsUpHandler(e,this)
      Session.set('postPageScrollTop',document.body.scrollTop)
    'click .thumbsDown': (e)->
      Session.set("pcommetsId","")
      thumbsDownHandler(e,this)
      Session.set('postPageScrollTop',document.body.scrollTop)
    'click .pcomments': (e)->
      #console.log($(e.currentTarget).parent().parent().parent())
      Session.set("pcommetsReply",false)
      $(e.currentTarget).parent().parent().parent().addClass('post-pcomment-current-pub-item').attr('data-height': $(e.currentTarget).parent().parent().parent().height())
      bgheight = $(window).height() + $(window).scrollTop()
      # $('.showBgColor').css('overflow','hidden')
      $('.showBgColor').attr('style','overflow:hidden;min-width:' + $(window).width() + 'px;' + 'height:' + bgheight + 'px;')
      Session.set("pcommetsId","")
      backgroundTop = 0-$(window).scrollTop()
      Session.set('backgroundTop', backgroundTop);
      #$('body').attr('style','position:fixed;top:'+Session.get('backgroundTop')+'px;')
      $('.pcommentInput,.alertBackground').fadeIn 300, ()->
        $('#pcommitReport').focus()
      $('#pcommitReport').focus()

      # $('.showBgColor').css('min-width',$(window).width())
      Session.set "pcommentIndexNum", this.index
    'click .bubble':(e)->
      Session.set "pcommentIndexNum", $(e.currentTarget).parent().parent().parent().index(".element")
      pcommentSelectedIndex = $(e.currentTarget).parent().index()
      console.log 'pcommentSelectedIndex >>>'+pcommentSelectedIndex
      Session.set('pcommentSelectedIndex', pcommentSelectedIndex)
      $(e.currentTarget).parent().parent().parent().addClass('post-pcomment-current-pub-item').attr('data-height': $(e.currentTarget).parent().parent().parent().height())
      if this.userId is Meteor.userId()
        $('.pcommentInputPromptPage').show()
        return
      Session.set("pcommetsReply",true)
      bgheight = $(window).height() + $(window).scrollTop()
      # $('.showBgColor').css('overflow','hidden')
      $('.showBgColor').attr('style','overflow:hidden;min-width:' + $(window).width() + 'px;' + 'height:' + bgheight + 'px;')
      Session.set("pcommetsId","")
      backgroundTop = 0-$(window).scrollTop()
      Session.set('backgroundTop', backgroundTop);
      #$('body').attr('style','position:fixed;top:'+Session.get('backgroundTop')+'px;')
      $('.pcommentInput,.alertBackground').fadeIn 300, ()->
        $('#pcommitReport').focus()
      $('#pcommitReport').focus()

    'click .play_area': (e)->
      $node=$(e.currentTarget)
      $audio=$node.find('audio')
      if $node.hasClass('music_playing')
        $node.removeClass('music_playing')
        $audio.trigger('pause')
      else
        $node.addClass('music_playing')
        $audio.trigger('play')

      $video = $node.find("video")
      if $video.get(0)
        $video.siblings('.video_thumb').fadeOut(100)
        if $video.get(0).paused
          $video.get(0).play()
        else
          $video.get(0).pause()
      return
    'pause audio':()->
      console.log('Audio Paused')
    'playing audio':()->
      console.log('Audio playing')
    'ended audio': (e)->
      console.log('Audio End')
      if $(e.currentTarget).parent().hasClass('music_playing')
        $(e.currentTarget).parent().removeClass('music_playing')
    'error audio': (e)->
      console.log('Audio Error')
      if $(e.currentTarget).parent().hasClass('music_playing')
        $(e.currentTarget).parent().removeClass('music_playing')
    'playing video':(e)->
      $node=$(e.currentTarget).parent()
      if $node
        $curVideo = $node.find("video")
        if $curVideo and $curVideo.get(0)
          $curVideo.siblings('.video_thumb').fadeOut(100)

  Template.postItem.helpers
    isOverLapping: (id)->
      unless id
        return
      elm1 = document.getElementById(id)
      unless elm1
        return
      rect1 = elm1.getBoundingClientRect()
      console.log("the next node id is >>> "+$("#"+id).nextAll('.element')[0].id)
      console.log("the node is>>> "+document.getElementById($("#"+id).nextAll('.element')[0].id))
      rect2 = document.getElementById($("#"+id).nextAll('.element')[0].id).getBoundingClientRect()
      overlapping = !(rect1.right < rect2.left or rect1.left > rect2.right or rect1.bottom < rect2.top or rect1.top > rect2.bottom)
      console.log(rect1.height)
      if overlapping
        console.log('被挡住了')
      else
        console.log('没有被挡住')
      return overlapping
    addTopOffsetStyle: (id)->
      rect1 = document.getElementById(id).getBoundingClientRect()
      rect2 = document.getElementById($("#"+id).nextAll('.element')[0].id).getBoundingClientRect()
      offsetTopLen = Number(rect1.height - (rect2.top - rect1.top)) + 15
      console.log('顶部偏移量为: '+offsetTopLen)
      # 更新容器高度
      testHeight = Number($('#test').css('height').slice(0,-2))
      $('#test').css({height: testHeight+Number(offsetTopLen)+'px'})
      # 更新后面的元素的top
      domNeedUpdate = $('#'+id).nextAll()
      domNeedUpdate.each () ->
        top = $(this).css('top').slice(0,-2)
        $(this).css({top: Number(top)+Number(offsetTopLen)+'px'})

    hasm3u8: (videoInfo)->
      unless videoInfo
        return false
      playUrl = videoInfo.playUrl
      if playUrl.length > 5 and playUrl.lastIndexOf('.m3u8') is playUrl.length-5
        return true
      return false
    hasVideoInfo: (videoInfo)->
      unless videoInfo
        return false

      playUrl = videoInfo.playUrl
      zhifa_serverURL = "http://data.tiegushi.com"

      # m3u8
      if playUrl.length > 5 and playUrl.lastIndexOf('.m3u8') is playUrl.length-5
        if $('head script[tag=mp4]').length > 0
          $('head script[tag=mp4]').remove()
          $('head link[tag=mp4]').remove()
        if $('head script[tag=m3u8]').length > 0
          return true

        $('head').append('<link tag="m3u8" href="http://data.tiegushi.com/video-js.min.css" rel="stylesheet">')
        $('head').append('<script tag="m3u8">token = "EioJxvLpZHJvcrYdJ"; trafficDisplay = true; </script>')
        $('head').append('<script tag="m3u8" src="http://data.tiegushi.com/bundle-hls.js"></script>')
      # other video
      else
        if $('head script[tag=m3u8]').length > 0
          $('head script[tag=m3u8]').remove()
          $('head link[tag=m3u8]').remove()
        if $('head script[tag=mp4]').length > 0
          return true

        $('head').append('<link tag="mp4" href="http://data.tiegushi.com/video-js.min.css" rel="stylesheet">')
        $('head').append('<script tag="mp4">token = "7gFCGdcqXw4mSc252"; trafficDisplay = false; </script>')
        $('head').append('<script tag="mp4" src="http://data.tiegushi.com/bundle-raidcdn-mini-2.21.4.js"></script>')

      return true

    myselfClickedUp:->
      i = this.index
      userId = Meteor.userId()
      #post = Session.get("postContent").pub
      #if post[i] isnt undefined and post[i].dislikeUserId isnt undefined and post[i].likeUserId[userId] is true
      if this.dislikeUserId isnt undefined and this.likeUserId[userId] is true
        return true
      else
        return false
    myselfClickedDown:->
      i = this.index
      userId = Meteor.userId()
      #post = Session.get("postContent").pub
      #if post[i] isnt undefined and post[i].dislikeUserId isnt undefined and post[i].dislikeUserId[userId] is true
      if this.dislikeUserId isnt undefined and this.dislikeUserId[userId] is true
        return true
      else
        return false
    calcStyle: ()->
      # For backforward compatible. Only older version set style directly
      if this.style and this.style isnt ''
        ''
      else
        calcTextItemStyle(this.layout)
    isTextLength:(text)->
      if(text.trim().length>20)
        return true
      else if  text.split(/\r\n|\r|\n/).length > 1
        return true
      else
        return false
    pcIndex:->
      pcindex = parseInt(Session.get("pcurrentIndex"))
      index = parseInt(this.index)
      if index is pcindex
        'dCurrent'
      else
        ''
    scIndex:->
      scindex = parseInt(Session.get('focusedIndex'))
      index = parseInt(this.index)
      if index is scindex
        'sCurrent'
      else
        ''
    plike:->
      if this.likeSum is undefined
        0
      else
        this.likeSum
    hasHyperlink: ->
      if this.hyperlink is undefined or this.hyperlink is ''
        return false
      else
        return true
    hasPcomments: ->
      i = this.index
      #post = Session.get("postContent").pub
#      position = 1+(post.length/2)
#      if i > position and  withSponserLinkAds then i -= 1 else i = i
      #if post and post[i] and post[i].pcomments isnt undefined
      if this.pcomments isnt undefined
        if this.pcomments.length > 0
          return true
        return false
      else
        return false
    pcomment:->
      i = this.index
      return this.pcomments;
      #post = Session.get("postContent").pub
#      position = 1+(post.length/2)
#      if withSponserLinkAds
#        position = 1+(post.length/2)
#      if i > position and withSponserLinkAds
#        i -= 1
#        return post[i].pcomments
#      else
      #if post[i] isnt undefined
      #  return post[i].pcomments
      #else
      #  return ''
    isPcommentReply:->
      if this.toUsername and this.toUsername isnt ''
        return true
      else
        return false
      
    pdislike:->
      if this.dislikeSum is undefined
        0
      else
        this.dislikeSum
    pcomments:->
      if this.pcomments is undefined
        0
      else
        this.pcomments.length
    getStyle:->
      self=this
      pclength=0
      if self.pcomments
        pclength=self.pcomments.length
      userId=Session.get("pcommetsId")
      scolor="#F30B44"
      if userId and userId isnt ""
        if self.likeUserId and self.likeUserId[userId] is true
          scolor="#304EF5"
        if scolor is "#F30B44" and self.dislikeUserId and self.dislikeUserId[userId] is true
          scolor="#304EF5"
        if scolor is "#F30B44" and pclength>0
          for icomment in self.pcomments
            if icomment["userId"] is userId
              scolor="#304EF5"
              break
      if scolor is "#304EF5"
        if Session.get("toasted") is false
          Session.set "toasted",true
          Session.set("needToast",true)
      dislikeSum = 0
      if self.dislikeSum
        dislikeSum=self.dislikeSum
      likeSum=0
      if self.likeSum
        likeSum=self.likeSum
      if dislikeSum + likeSum + pclength is 0
        self.style
      else
        if self.style is undefined or self.style.length is 0
          "color: "+scolor+";"
        else
          self.style.replace("grey",scolor).replace("rgb(128, 128, 128)",scolor).replace("rgb(0, 0, 0)",scolor).replace("#F30B44",scolor)
