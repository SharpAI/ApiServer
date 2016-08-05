if Meteor.isClient

  Template.showDraftPosts.onRendered ->
    Session.setDefault "displayPostContent",true
    $('.mainImage').css('height',$(window).height()*0.55)
    postContent = Session.get("postContent")
    title=postContent.title.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '')
    if postContent.publish is false
      Router.go('/unpublish')
    if postContent.addontitle
      title=title+":"+postContent.addontitle

    $("a[target='_blank']").click((e)->
      e.preventDefault();
      if Meteor.isCordova
        Session.set("isReviewMode","undefined")
        prepareToEditorMode()
        PUB.page '/add'
        handleAddedLink($(e.currentTarget).attr('href'))
      else
        window.open($(e.currentTarget).attr('href'), '_blank', 'hidden=no,toolbarposition=top')
    )
    $('.showBgColor').css('min-height',$(window).height())


  Template.showDraftPosts.helpers
    getmainImage:()->
      mImg = this.mainImage
      if (mImg.indexOf('file:///') >= 0)
        if Session.get(mImg) is undefined
          ProcessImage = (URI,smallImage)->
            if smallImage
              Session.set(mImg, smallImage)
            else
              Session.set(mImg, '/noimage.png')
          getBase64OfImage('','',mImg,ProcessImage)
        Session.get(mImg)
      else
        this.mainImage
    showImporting: ()->
      this.status is 'importing' and this.ownerId is Meteor.userId()
    isMobile:->
      Meteor.isCordova
    displayPostContent:()->
      Session.get('displayPostContent')
    getMainImageHeight:()->
      $(window).height()*0.55
    getPostContent:(obj)->
      self = obj
      self.pub = self.pub || []
      _.map self.pub, (doc, index, cursor)->
        _.extend(doc, {index: index})
    getPub:->
      self = this
      contentList = Template.showDraftPosts.__helpers.get('getPostContent')(self)
      loadedCount = if Session.get("content_loadedCount") then Session.get("content_loadedCount") else 0
      #console.log("loadedCount="+loadedCount+", "+contentList.length)
      newLoadedCount = contentList.length
      if (loadedCount < contentList.length)
        if loadedCount+10 < contentList.length
          newLoadedCount = loadedCount+10
        else
          newLoadedCount = contentList.length
        if Session.get("content_loadedCount") isnt newLoadedCount
          Meteor.setTimeout(()->
            Session.set("content_loadedCount", newLoadedCount)
          , 0)
      contentList.slice(0, newLoadedCount)
    getPub2:->
      self = this
      self.pub = self.pub || []
      _.map self.pub, (doc, index, cursor)->
        _.extend(doc, {index: index})
    isCordova:()->
      Meteor.isCordova
    haveUrl:->
      if Session.get("postContent").fromUrl is undefined  or Session.get("postContent").fromUrl is ''
        false
      else
        true
  isASCII = (str)->
    /^[\x00-\x7F]*$/.test(str)
  countASCII = (string)->
    count = 0;
    for i in [0..(string.length-1)]
      if (isASCII(string.charAt(i)))
        count+=1
    return count

  Template.showDraftPosts.events
    'click .showDraftback' :->
      Meteor.setTimeout ()->
        if Session.get("backtoalldrafts") is true
          Session.set("backtoalldrafts",false)
          PUB.page('/allDrafts')
        else if Session.get("backtopageuser") is true
          Session.set('backtopageuser', false)
          PUB.page('/user')
        else
          PUB.postPageBack()
      ,animatePageTrasitionTimeout
    'click .postImageItem': (e)->
      swipedata = []
      i = 0
      selected = 0
      console.log "=============click on image index is: " + this.index
      for image in Session.get('postContent').pub
        if image.imgUrl
          if image.imgUrl is this.imgUrl
            selected = i
          swipedata.push
            href: image.imgUrl
            title: image.text
          i++
      $.swipebox swipedata,{
        initialIndexOnArray: selected
        hideCloseButtonOnMobile : true
        loopAtEnd: false
      }
    'click #edit': (event)->
      savedDraftData = SavedDrafts.findOne({_id: Session.get("postContent")._id})
      TempDrafts.insert {
        _id:savedDraftData._id,
        pub:savedDraftData.pub,
        title:savedDraftData.title,
        addontitle:savedDraftData.addontitle,
        fromUrl:savedDraftData.fromUrl,
        mainImage: savedDraftData.mainImage,
        mainText: savedDraftData.mainText,
        owner:savedDraftData.owner,
        createdAt: savedDraftData.createdAt,
      }
      # draft0 = {_id:savedDraftData._id, type:'image', isImage:true, url: savedDraftData.fromUrl, owner: Meteor.userId(), imgUrl:savedDraftData.mainImage, filename:savedDraftData.mainImage.replace(/^.*[\\\/]/, ''), URI:"", data_row:0,style:savedDraftData.mainImageStyle}
      # Drafts.insert(draft0)
      pub = savedDraftData.pub
      if pub.length > 0
        ###
        Router.go('/add') will trigger addPost onRendered first, then defer function run.
        The Drafts.insert will trigger addPostItem OnRendered function run, then do the layout thing. The 2nd defer function
        will run after then. The final callback will be called after all item layout done, so closePreEditingPopup run.
        ###
        
        appEdited = true
        post = Session.get('postContent')
        if(post.status is true or post.status is false)
          appEdited = post.status
        else if(post.status is 'importing' or post.status is 'imported' or post.status is 'done')
          appEdited = false
        deferedProcessAddPostItemsWithEditingProcessBar(pub, appEdited)
      Session.set('isReviewMode','0')
      Router.go('/add')
    'click #delete':(event)->
      navigator.notification.confirm('您是否要删除草稿？', (r)->
        if r isnt 2
          return
        Session.set 'isReviewMode','1'
        #Delete it from SavedDrafts
        # draftData = Drafts.find().fetch()
        if Drafts.find().count() is 0
          draftId = Session.get("postContent")._id
          if SavedDrafts.find().count() is 1
            Session.setPersistent('mySavedDraftsCount',0)
            Session.setPersistent('persistentMySavedDrafts',null)
          SavedDrafts.remove draftId
        #Clear Drafts
        # draftImageData = Drafts.find({type:'image'}).fetch()
        # removeImagesFromCache(draftImageData)
        # Drafts.remove {owner: Meteor.userId()}
        # $('.addPost').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
          if Session.get("backtoMyPosts") is true
            Session.set("backtoMyPosts",false)
            PUB.page('/myPosts')
          else if Session.get("backtopageuser") is true
            Session.set('backtopageuser', false)
            PUB.page('/user')
          else
            PUB.postPageBack()
        ,animatePageTrasitionTimeout
        return
      , '删除草稿', ['取消','确定']);

      return