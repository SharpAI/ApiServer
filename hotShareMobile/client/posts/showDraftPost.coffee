if Meteor.isClient
  @cleanDraft = ()->
    Drafts.remove({})
    TempDrafts.remove({})
  updateTopicPost=(topicPostObj)->
    topicPostId = topicPostObj.postId
    userId = topicPostObj.owner
    commentData = Comment.find({postId:topicPostId,userId:userId}, {sort: {createdAt: 1}}).fetch()
    if commentData and commentData.length > 0
      comment = ''
      for index of commentData
        comment += commentData[index].content
      r=comment.replace /\#([^\#|.]+)\#/g,(word)->
        topic = word.replace '#', ''
        topic = topic.replace '#', ''
        #console.log word
        if topic.length > 0 && topic.charAt(0)!=' '
          haveSpace = topic.indexOf ' ', 0
          if haveSpace > 0
              topic = topic[...haveSpace]
          console.log topic
          Meteor.call('updateTopicPostsAfterComment', topicPostId, topic, topicPostObj)
  editDraft = (savedDraftData)->
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
        deferedProcessAddPostItemsWithEditingProcessBar(pub)
      Session.set('fromDraftPost',true)
      Session.set('isReviewMode','0')
      Session.set 'showDraft', false
      Router.go('/add')
  Template.showDraftPosts.created=->
    layoutHelperInit()
    Session.set("content_loadedCount", 0)
  Template.showDraftPosts.onRendered ->
    console.log('open draft.')
    Session.set 'showDraft', true
    if Session.get('postContent') and Session.get('postContent')._id
      unless Posts.find({_id:Session.get('postContent')._id}).count() > 0
        Meteor.subscribe("ViewPostsList",Session.get('postContent')._id)
    Session.setDefault "displayPostContent",true
    $('.mainImage').css('height',$(window).height()*0.55)
    postContent = Session.get("postContent")
    title=postContent.title.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '')
    if postContent.publish is false
      Router.go('/unpublish')
    if postContent.addontitle
      title=title+":"+postContent.addontitle
    setTimeout ()->
      $("a[target='_blank']").click((e)->
        e.preventDefault();
        if Meteor.isCordova
          Session.set("isReviewMode","undefined")
          prepareToEditorMode()
          #PUB.page '/add'
          Session.set("ishyperlink",true)
          handleAddedLink($(e.currentTarget).attr('href'))
        else
          window.open($(e.currentTarget).attr('href'), '_blank', 'hidden=no,toolbarposition=top')
      )
    , 450
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
      # console.log("loadedCount="+loadedCount+", "+contentList.length)
      newLoadedCount = contentList.length
      if (loadedCount < contentList.length)
        if loadedCount+10 < contentList.length
          newLoadedCount = loadedCount+10
        else
          newLoadedCount = contentList.length
        if Session.get("content_loadedCount") isnt newLoadedCount
          setTimeout(()->
            Session.set("content_loadedCount", newLoadedCount)
          , 0)
      contentList.slice(1, newLoadedCount)
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
    'click #modalPublish': (e)->
      history = []
      history.push {
          view: 'user'
          scrollTop: document.body.scrollTop
      }
      Session.set "history_view", history
      cleanDraft()
      Session.set('fromDraftPost',false)
      Meteor.defer ()->
        $('.modal-backdrop.fade.in').remove()
      if Meteor.user() is null
        window.plugins.toast.showShortBottom('请登录后发表您的故事')
        Router.go('/user')
        false
      else
        if(!Meteor.status().connected and Meteor.status().status isnt 'connecting')
          Meteor.reconnect()
        title = Session.get('postContent').title
        if title is '' or title is '[空标题]'
          window.plugins.toast.showShortBottom('请为您的故事加个标题')
          return

        #get the images to be uploaded
        postDraftData = Session.get('postContent').pub
        draftToBeUploadedImageData = []
        savedDraftData = Session.get('postContent')

        postId = savedDraftData._id
        addontitle = savedDraftData.addontitle
        title = savedDraftData.title
        mainImageStyle = savedDraftData.mainImageStyle
        mainText = savedDraftData.mainText
        fromUrl = savedDraftData.fromUrl

        modalUserId = $('#chooseAssociatedUser .modal-body dt.active').attr('userId')
        ownerUser = null
        
        if modalUserId is Meteor.userId() or !modalUserId
          ownerUser = Meteor.user()
        else
          ownerUser = {
            _id: modalUserId
            username: $('#chooseAssociatedUser .modal-body dt.active').attr('userName')
            profile: {
              icon: $('#chooseAssociatedUser .modal-body dt.active').attr('userIcon')
              fullname: $('#chooseAssociatedUser .modal-body dt.active').attr('userName')
            }
          }
            
        Session.set 'post-publish-user-id', ownerUser._id
        ownerName = if ownerUser.profile and ownerUser.profile.fullname then ownerUser.profile.fullname else ownerUser.username
        ownerIcon = if ownerUser.profile and ownerUser.profile.icon then ownerUser.profile.icon else '/userPicture.png'

        if postDraftData.length > 1
          for i in [0..(postDraftData.length-1)]
            Drafts.insert(postDraftData[i])
          # console.log('Drafts is ')
          # console.log(Drafts.find().fetch())
          draftImageData = Drafts.find({type:'image'}).fetch()
          draftMusicData = Drafts.find({type:'music'}).fetch()
          draftVideoData = Drafts.find({type:'video'}).fetch()

          # console.log 'draftData arr list '
          # console.log draftImageData
          # console.log draftVideoData
          # console.log draftMusicData
          for i in [0..(draftImageData.length-1)]
              if !draftImageData[i].imgUrl
                continue
              unless draftImageData[i].imgUrl.toLowerCase().indexOf("http://data.tiegushi.com/") isnt -1
                # console.log 'push image to be uploaded.'
                draftToBeUploadedImageData.push(draftImageData[i])
          for music in draftMusicData
            if music.musicInfo.playUrl.toLowerCase().indexOf("http://")>= 0 or music.musicInfo.playUrl.toLowerCase().indexOf("https://")>= 0
              draftToBeUploadedImageData.unshift({})
              continue
            draftToBeUploadedImageData.push(music)
          for video in draftVideoData
            if video.videoInfo.imageUrl.toLowerCase().indexOf("http://")>= 0 or video.videoInfo.imageUrl.toLowerCase().indexOf("https://")>= 0
              draftToBeUploadedImageData.unshift({})
              continue
            draftToBeUploadedImageData.push(video)
          #uploadFileWhenPublishInCordova(draftToBeUploadedImageData, postId)
          #Don't add addpost page into history
          Session.set('terminateUpload', false)
          # console.log "draftToBeUploadedImageData is "
          # console.log draftToBeUploadedImageData
        else
          draftToBeUploadedImageData = []
        if draftToBeUploadedImageData.length > 0
          multiThreadUploadFileWhenPublishInCordova(draftToBeUploadedImageData, null, (err, result)->
            # console.log 'result is  '
            # console.log result
            unless result
              window.plugins.toast.showShortBottom('上传失败，请稍后重试')
              return
            if result.length < 1
              window.plugins.toast.showShortBottom('上传失败，请稍后重试')
              return
            for item in result
              # console.log item
              if item.uploaded and item._id
                if item.type is 'image' and item.imgUrl
                  Drafts.update({_id: item._id}, {$set: {imgUrl:item.imgUrl}});
                else if item.type is 'music' and item.musicInfo and item.musicInfo.playUrl
                  Drafts.update({_id: item._id}, {$set: {"musicInfo.playUrl":item.musicInfo.playUrl}});
                else if item.type is 'video' and item.videoInfo and item.videoInfo.imageUrl
                  Drafts.update({_id: item._id}, {$set: {"videoInfo.imageUrl":item.videoInfo.imageUrl}});
            if err
              window.plugins.toast.showShortBottom('上传失败，请稍后重试')
              return
            # console.log 'get errrrrrrrror'
            draftData = Drafts.find().fetch()
            pub = []
            #Save gridster layout first. If publish failed, we can recover the drafts
            for i in [0..(draftData.length-1)]
              if i is 0
                mainImage = draftData[i].imgUrl
              else
                pub.push(draftData[i])
            # console.log 'pub  is '
            # console.log pub
            sortBy = (key, a, b, r) ->
              r = if r then 1 else -1
              return -1*r if a[key] and b[key] and a[key] > b[key]
              return +1*r if a[key] and b[key] and a[key] < b[key]
              return +1*r if a[key] is undefined and b[key]
              return -1*r if a[key] and b[key] is undefined
              return 0
            pub.sort((a, b)->
              sortBy('data_row', a, b)
            )
            
            # remove data_wait_init status
            new_pub = []
            if pub.length > 0
              for i in [0..pub.length-1]
                row = {}
                for key,value of pub[i]
                  if key isnt 'data_wait_init'
                    row[key] = pub[i][key]
                new_pub.push(row)
            pub = new_pub
            # console.log 'pub is  '
            # console.log pub
            browseTimes = 0

            if Posts.find({_id:postId}).count()>0
              # console.log 'goooooooooood!!'
              browseTimes = Posts.findOne({_id:postId}).browse 
              Posts.update(
                {
                  _id:postId
                },
                {
                  $set:{
                    pub:pub,
                    title:title,
                    heart:[],  #点赞
                    retweet:[],#转发
                    comment:[], #评论
                    addontitle:addontitle,
                    mainImage: mainImage,
                    mainImageStyle:mainImageStyle,
                    mainText: mainText,
                    fromUrl: fromUrl,
                    publish:true,
                    owner:ownerUser._id,
                    ownerName:ownerName,
                    ownerIcon:ownerIcon,
                    createdAt: new Date()
                  }
                }
              )
            else
              Posts.insert( {
                _id:postId,
                pub:pub,
                title:title,
                browse:0,
                heart:[],  #点赞
                retweet:[],#转发
                comment:[], #评论
                commentsCount:0,
                addontitle:addontitle,
                mainImage: mainImage,
                mainImageStyle:mainImageStyle,
                mainText: mainText,
                fromUrl: fromUrl,
                publish:true,
                owner:ownerUser._id,
                ownerName:ownerName,
                ownerIcon:ownerIcon,
                createdAt: new Date()
              })
            topicPostObj = {
              postId:postId,
              title:title,
              addontitle:addontitle,
              mainImage:mainImage,
              heart:0,
              retweet:0,
              comment:1,
              owner:ownerUser._id,
              ownerName:ownerName,
              ownerIcon:ownerIcon,
              createdAt: new Date()
            }
            updateTopicPost(topicPostObj)
            Meteor.call('reviewFollowPosts',postId,Meteor.userId())
            #Delete from SavedDrafts if it is a saved draft.
            if SavedDrafts.find().count() is 1
              Session.setPersistent('mySavedDraftsCount',0)
              Session.setPersistent('persistentMySavedDrafts',null)
            SavedDrafts.remove({_id:postId})
            #Delete the Drafts
            cleanDraft()
            newPostData = {
              _id:postId,
              pub:pub,
              title:title,
              browse:browseTimes+1,
              heart:[],  #点赞
              retweet:[],#转发
              comment:[], #评论
              addontitle:addontitle,
              mainImage: mainImage,
              mainImageStyle:mainImageStyle,
              mainText: mainText,
              fromUrl: fromUrl,
              publish:true,
              owner:ownerUser._id,
              ownerName:ownerName,
              ownerIcon:ownerIcon,
              isReview: true,
              createdAt: new Date()
            }
            Session.set('newpostsdata', newPostData)
            Router.go('/newposts/'+postId)

            removeImagesFromCache(draftImageData)
          )
        else
          # console.log 'update posts '
          pubtest = savedDraftData.pub
          pubtest.shift()
          pub = pubtest
          mainImage = savedDraftData.mainImage
          browseTimes = 0

          if Posts.find({_id:postId}).count()>0
            # console.log 'goooooooooood!!'
            browseTimes = Posts.findOne({_id:postId}).browse
            Posts.update(
              {
                _id:postId
              },
              {
                $set:{
                  pub:pub,
                  title:title,
                  heart:[],  #点赞
                  retweet:[],#转发
                  comment:[], #评论
                  addontitle:addontitle,
                  mainImage: mainImage,
                  mainImageStyle:mainImageStyle,
                  mainText: mainText,
                  fromUrl: fromUrl,
                  publish:true,
                  owner:ownerUser._id,
                  ownerName:ownerName,
                  ownerIcon:ownerIcon,
                  createdAt: new Date()
                }
              }
            )
          else
            Posts.insert( {
              _id:postId,
              pub:pub,
              title:title,
              browse:0,
              heart:[],  #点赞
              retweet:[],#转发
              comment:[], #评论
              commentsCount:0,
              addontitle:addontitle,
              mainImage: mainImage,
              mainImageStyle:mainImageStyle,
              mainText: mainText,
              fromUrl: fromUrl,
              publish:true,
              owner:ownerUser._id,
              ownerName:ownerName,
              ownerIcon:ownerIcon,
              createdAt: new Date()
            })
          topicPostObj = {
            postId:postId,
            title:title,
            addontitle:addontitle,
            mainImage:mainImage,
            heart:0,
            retweet:0,
            comment:1,
            owner:ownerUser._id,
            ownerName:ownerName,
            ownerIcon:ownerIcon,
            createdAt: new Date()
          }
          updateTopicPost(topicPostObj)
          Meteor.call('reviewFollowPosts',postId,Meteor.userId())
          #Delete from SavedDrafts if it is a saved draft.
          if SavedDrafts.find().count() is 1
            Session.setPersistent('mySavedDraftsCount',0)
            Session.setPersistent('persistentMySavedDrafts',null)
          SavedDrafts.remove({_id:postId})
          #Delete the Drafts
          cleanDraft()
          newPostData = {
              _id:postId,
              pub:pub,
              title:title,
              browse:browseTimes+1,
              heart:[],  #点赞
              retweet:[],#转发
              comment:[], #评论
              addontitle:addontitle,
              mainImage: mainImage,
              mainImageStyle:mainImageStyle,
              mainText: mainText,
              fromUrl: fromUrl,
              publish:true,
              owner:ownerUser._id,
              ownerName:ownerName,
              ownerIcon:ownerIcon,
              isReview: true,
              createdAt: new Date()
          }
          Session.set('newpostsdata', newPostData)
          Router.go('/newposts/'+postId)
        Session.set 'showDraft', false
        return
    'click .showDraftback' :->
      Session.set('fromDraftPost',false)
      Session.set 'showDraft', false
      setTimeout ()->
        # if Session.get("backtoalldrafts") is true
        #   Session.set("backtoalldrafts",false)
        #   PUB.page('/allDrafts')
        # else if Session.get("backtopageuser") is true
        #   Session.set('backtopageuser', false)
        #   PUB.page('/user')
        # else
          PUB.postPageBack()
      ,animatePageTrasitionTimeout
    'click .postImageItem': (e,t)->
      swipedata = []
      selected = 0
      console.log "=============click on image index is: " + e.currentTarget.id

      # find imgs
      $('.postImageItem').each (index, item)->
        $img = $(this).find('img')
        if $img.attr('data-original')
          swipedata.push({id: $img.attr('id'), href: $img.attr('data-original')})
        else
          swipedata.push({id: $img.attr('id'), href: $img.attr('src')})

      # get selected
      if swipedata.length > 0
        for i in [0..swipedata.length-1]
          if swipedata[i].id is e.currentTarget.id + 'img'
            selected = i
            break
      console.log('length:', swipedata.length, 'selected:', selected);

      $.swipebox swipedata,{
        initialIndexOnArray: selected
        hideCloseButtonOnMobile : true
        loopAtEnd: false
      }
    'click #edit': (event)->
      cleanDraft()
      draftId = Session.get("postContent")._id
      savedDraftData = SavedDrafts.findOne({_id:draftId})
      if savedDraftData
        editDraft(savedDraftData)
      else
        Meteor.subscribe("savedDraftsWithID",draftId,{
            onReady:()->
              console.log('savedDraftsWithIDCollection loaded')
              savedDraftData = SavedDrafts.findOne({_id:draftId})
              editDraft(savedDraftData)
          })

    'click #delete':(event)->
      navigator.notification.confirm('您是否要删除草稿？', (r)->
        if r isnt 2
          return
        Session.set('fromDraftPost',false)
        #Delete it from SavedDrafts
        # draftData = Drafts.find().fetch()
        #Clear Drafts
        cleanDraft()
        draftId = Session.get("postContent")._id
        if SavedDrafts.find().count() is 1
          Session.setPersistent('mySavedDraftsCount',0)
          Session.setPersistent('persistentMySavedDrafts',null)
        SavedDrafts.remove draftId
        Session.set 'showDraft', false
        # draftImageData = Drafts.find({type:'image'}).fetch()
        # removeImagesFromCache(draftImageData)
        # Drafts.remove {owner: Meteor.userId()}
        # $('.addPost').addClass('animated ' + animateOutUpperEffect);
        setTimeout ()->
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
