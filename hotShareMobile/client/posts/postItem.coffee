
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
    if myData.type is 'image'
      element.style.height=myData.data_sizey*getBaseHeight()+'px'
      if myData.data_col isnt 1
        element.style.left=(parentNode.offsetLeft+(myData.data_col-1)*getBaseWidth()+imageMarginPixel)+'px'
        element.style.width=(myData.data_sizex*getBaseWidth()-imageMarginPixel)+'px'
      else
        element.style.left=parentNode.offsetLeft+(myData.data_col-1)*getBaseWidth()+'px'
        element.style.width=myData.data_sizex*getBaseWidth()+'px'
      img=this.find('img')
      $(img).lazyload()
    else if myData.type is 'text'
      element.style.width=parentNode.offsetWidth+'px'
    else if myData.type is 'music'
      element.style.width=myData.data_sizex*getBaseWidth()+'px'
      element.style.height=2*getBaseHeight()+'px'
    elementBottom=element.offsetTop+element.offsetHeight
    updateLayoutData(layoutHelper,myData.data_col,myData.data_sizex,elementBottom)
    console.log('['+this.data.index+']'+' '+myData.type+' col '+myData.data_col+
        ' row '+myData.data_row+' h '+myData.data_sizey+' w '+myData.data_sizex+
        ' H '+element.offsetHeight+'/'+element.clientHeight+' W '+element.offsetWidth+' Top '+element.offsetTop
    )
    parentNode.style.height=getLayoutTop(layoutHelper,1,6)-parentNode.offsetTop+'px'
  Template.postItem.events
    'click .thumbsUp': (e)->
      thumbsUpHandler(e,this)
    'click .thumbsDown': (e)->
      thumbsDownHandler(e,this)
    'click .pcomments': (e)->
      backgroundTop = 0-$(window).scrollTop()
      Session.set('backgroundTop', backgroundTop);
      $('.showBgColor').attr('style','position:fixed;top:'+Session.get('backgroundTop')+'px')
      $('.pcommentsList,.alertBackground').fadeIn 300, ()->
        $('#pcommitReport').focus()
      Session.set "pcommentIndexNum", this.index
  Template.postItem.helpers
    calcStyle: ()->
      # For backforward compatible. Only older version set style directly
      if this.style and this.style isnt ''
        ''
      else
        calcTextItemStyle(this.layout)
    isTextLength:(text)->
      if(text.trim().length>40)
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
      userName=Session.get("pcommentsName")
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
        scrolltop = 0
        if $('.dCurrent').length
          scrolltop=$('.dCurrent').offset().top
          Session.set("postPageScrollTop", scrolltop)
          document.body.scrollTop = Session.get("postPageScrollTop")
        if Session.get("toasted") is false
          Session.set "toasted",true
          PUB.toast(userName+"点评过的段落将为您用蓝色标注！")
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
