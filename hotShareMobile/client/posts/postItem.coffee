
if Meteor.isClient
  getBaseWidth=()->
    ($('.showPosts').width()-30)/6
  getBaseHeight=()->
    ($('.showPosts').width()-30)/6
  layoutHelper=[0,0,0,0,0,0]
  imageMarginPixel=5
  getLayoutTop=(helper,col,sizeX)->
    max=0
    for i in [col..(col+sizeX-1)]
      max=Math.max(max,helper[(i-1)])
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
      updateLayoutData(layoutHelper,1,6,parentNode.offsetTop)
    element.style.top=getLayoutTop(layoutHelper,myData.data_col,myData.data_sizex)+imageMarginPixel+'px'
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

    $('#'+myData._id).linkify()
    element.style.visibility = '';
    #console.log('['+this.data.index+']'+' '+myData.type+' col '+myData.data_col+
    #    ' row '+myData.data_row+' h '+myData.data_sizey+' w '+myData.data_sizex+
    #    ' H '+element.offsetHeight+'/'+element.clientHeight+' W '+element.offsetWidth+' Top '+element.offsetTop
    #)
  Template.postItem.events
    'click .thumbsUp': (e)->
      Session.set("pcommetsId","")
      thumbsUpHandler(e,this)
    'click .thumbsDown': (e)->
      Session.set("pcommetsId","")
      thumbsDownHandler(e,this)
    'click .pcomments': (e)->
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
      rect1 = document.getElementById(id).getBoundingClientRect()
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
    hasVideoInfo: (videoInfo)->
      if videoInfo
        scripts = document.head.getElementsByTagName("script")
        found = 0
        if scripts.length > 0
          for i in [0..scripts.length-1]
            if scripts[i].getAttribute('src') and scripts[i].getAttribute('src').indexOf('bundle-raidcdn') >= 0
              found = 1
              break
        unless found
            zhifa_serverURL = "http://data.tiegushi.com"
            jscript = document.createElement("script")
            jscript.innerHTML = "token = '7gFCGdcqXw4mSc252'; trafficDisplay = false;"
            document.head.appendChild(jscript)
            jscript = document.createElement("script")
            jscript.type = "text/javascript"
            jscript.src = zhifa_serverURL+"/bundle-raidcdn-mini-2.21.4.js"
            document.head.appendChild(jscript)
        true
      else
        false
    myselfClickedUp:->
      i = this.index
      userId = Meteor.userId()
      post = Session.get("postContent").pub
      if post[i] isnt undefined and post[i].dislikeUserId isnt undefined and post[i].likeUserId[userId] is true
        return true
      else
        return false
    myselfClickedDown:->
      i = this.index
      userId = Meteor.userId()
      post = Session.get("postContent").pub
      if post[i] isnt undefined and post[i].dislikeUserId isnt undefined and post[i].dislikeUserId[userId] is true
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
      pcindex = Session.get("pcurrentIndex")
      if this.index is pcindex
        'dCurrent'
      else
        ''
    plike:->
      if this.likeSum is undefined
        0
      else
        this.likeSum
    hasPcomments: ->
      i = this.index
      post = Session.get("postContent").pub
#      position = 1+(post.length/2)
#      if i > position and  withSponserLinkAds then i -= 1 else i = i
      if post and post[i] and post[i].pcomments isnt undefined
        return true
      else
        return false
    pcomment:->
      i = this.index
      post = Session.get("postContent").pub
      position = 1+(post.length/2)
#      if withSponserLinkAds
#        position = 1+(post.length/2)
      if i > position and withSponserLinkAds
        i -= 1
        return post[i].pcomments 
      else if post[i] isnt undefined
        return post[i].pcomments
      else
        return ''
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
