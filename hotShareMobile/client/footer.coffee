#space 2
if Meteor.isClient

  # $('#level2-popup-menu').on('hide.bs.modal', function (e) {
  #     alert("hidden")
  # }).on('show.bs.modal', function (e) {
  #   alert("show");
  # });
  $('#level2-popup-menu').on('hide.bs.modal', (e) ->
    alert 'hidden'
    return
  ).on 'show.bs.modal', (e) ->
    alert 'show'
    return
  Template.footer.helpers
    hasNewLabelMsg: ()->
      Session.get('hasNewLabelMsg')
    display_select_import_way: ()->
      Session.equals 'display_select_import_way',true
    is_wait_read_count: (count)->
      count > 0
    limit_top_read_count: (count)->
      count >= 99
    wait_read_count:->
      me = Meteor.user()
      if me
        # if Session.equals('updataFeedsWithMe',true)
        #   return 0
        # else
        return Feeds.find({
            followby: Meteor.userId(),
            isRead:{$ne: true},
            checked:{$ne: true},
            eventType:{$ne:'share'},
            createdAt: {$gt: new Date((new Date()).getTime() - 7 * 24 * 3600 * 1000)}
          },{
            limit: 99
          }).count()
          # waitReadCount = Session.get('waitReadCount')
        #if me.profile and me.profile.waitReadCount
          #waitReadCount = me.profile.waitReadCount
          # if waitReadCount is undefined or isNaN(waitReadCount)
          #   waitReadCount = 0
          # if Session.get('channel') is 'bell' and waitReadCount > 0
          #   waitReadCount = 0
          #   Session.set('waitReadCount',0)
          #   Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.waitReadCount': 0}});
          # return waitReadCount
      else
        0
    wait_import_count:->
       return Session.get('wait_import_count')

    focus_style:(channelName)->
      channel = Session.get "focusOn"
      if channel is channelName
        $('.foot-btn').removeClass('focus')
        return "focus"
      else
        return ""
    addressBookImgSrc:(channelName)->
      channel = Session.get "focusOn"
      if channel is channelName
        return "/addressbook_s.png"
      else
        return "/addressbook.png"

    icon_size:(channelName)->
      channel = Session.get "focusOn"
      if channel is channelName
        return true
    display_footer:()->
      show_foot_url = ['/','/message','/timeline', '/explore', '/user','/faces']
      console.log "document_body_scrollTop=" + Session.get("document_body_scrollTop")
      console.log("show_foot_url", show_foot_url, location, location.pathname, Router.current().route.path())
      
      setTimeout(
        ()->
            if show_foot_url.indexOf(Router.current().route.path()) isnt -1
              $('.content').scrollTop(Session.get("document_body_scrollTop"))
            else
              document.body.scrollTop = Session.get("document_body_scrollTop")
        0
      )
      return show_foot_url.indexOf(Router.current().route.path()) isnt -1
      # Meteor.isCordova
    fade:->
      if isAndroidFunc()
         ''
      else
         'fade'
  @prepareToEditorMode = ()->
    TempDrafts.remove({})
    $('body').removeClass('modal-open')
    Session.set 'isReviewMode','0'
    Session.set('draftTitle', '');
    Session.set('draftAddontitle', '');
    Drafts.remove({})
    Session.set 'NewImgAdd','true'
  @checkShareUrl = () ->
    if Meteor.user()
        window.plugins.userinfo.setUserInfo Meteor.user()._id, (->
            console.log 'setUserInfo was success '
            return
        ), ->
            console.log 'setUserInfo was Error!'
            return
        setTimeout(()->
            waitImportCount = ShareURLs.find().count()
            console.log 'waitImportCount :' + waitImportCount
            if waitImportCount > 0
              data = ShareURLs.find().fetch()
              console.log 'CustomDialog show!'
              #CustomDialog.show data[0]
        ,100)

  @editFromShare = (data)->
    Meteor.defer ()->
      $('.modal-backdrop.in').remove()
    prepareToEditorMode()
    PUB.page '/add'
    console.log 'type is ' + data.type
    console.log  'content'+data.content[0]
    if data.type is 'url'
       setTimeout(()->
          handleDirectLinkImport(data.content[0],1)
       ,100)
       return
    if data.type is 'image'
       Meteor.defer ()->
          importImagesFromShareExtension(data.content, (cancel, result,currentCount,totalCount)->
            if cancel
              #$('#level2-popup-menu').modal('hide');
              PUB.back()
              return
            if result
              console.log 'Local is ' + result.smallImage
              Drafts.insert {type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}
              if currentCount >= totalCount
                setTimeout(()->
                  Template.addPost.__helpers.get('saveDraft')()
                ,100)
          )
    # setTimeout(()->
    #   handleDirectLinkImport(url)
    # ,100)
  Template.footer.events
    'click #message':(e)->
      #Session.set('hasNewLabelMsg', false)
      if (Session.get("myHotPostsChanged"))
        Session.set("myHotPostsChanged", false)
        navigator.notification.confirm(
          '您改变了热门帖子, 要保存吗?'
          (index)->
            if index is 2
              saveHotPosts()
            PUB.page('/message')
          '提示'
          ['暂不','保存']
        )
        return
      PUB.page('/message')
    'click #homePage':(e)->
      #Session.set('hasNewLabelMsg', false)
      if (Session.get("myHotPostsChanged"))
        #Session.set("myHotPostsChanged", false)
        navigator.notification.confirm(
          '您改变了热门帖子, 要保存吗?'
          (index)->
            if index is 2
              saveHotPosts()
            PUB.page('/')
          '提示'
          ['暂不','保存']
        )
        return
      PUB.page('/')
    'click #timeline':(e)->
      if (Session.get("myHotPostsChanged"))
        Session.set("myHotPostsChanged", false)
        navigator.notification.confirm(
          '您改变了热门帖子, 要保存吗?'
          (index)->
            if index is 2
              saveHotPosts()
            PUB.page('/timeline')
          '提示'
          ['暂不','保存']
        )
        return
      PUB.page('/timeline')
    'click #explore':(e)->
      if (Session.get("myHotPostsChanged"))
        Session.set("myHotPostsChanged", false)
        navigator.notification.confirm(
          '您改变了热门帖子, 要保存吗?'
          (index)->
            if index is 2
              saveHotPosts()
            PUB.page('/explore')
          '提示'
          ['暂不','保存']
        )
        return
      PUB.page('/explore')
    'click #faces':(e)->
      PUB.page('/faces')
    'click #bell':(e)->
      Meteor.defer ()->
        me = Meteor.user()
        if me and me.profile and me.profile.waitReadCount
          if me.profile.waitReadCount > 0
            Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.waitReadCount': 0}});
      if (Session.get("myHotPostsChanged"))
        Session.set("myHotPostsChanged", false)
        navigator.notification.confirm(
          '您改变了热门帖子, 要保存吗?'
          (index)->
            if index is 2
              saveHotPosts()
            PUB.page('/bell')
          '提示'
          ['暂不','保存']
        )
        return
      PUB.page('/bell')
    'click #user':(e)->
      $('.importProgressBar, .b-modal, .toEditingProgressBar').remove()
      if (Session.get("myHotPostsChanged"))
        Session.set("myHotPostsChanged", false)
        navigator.notification.confirm(
          '您改变了热门帖子, 要保存吗?'
          (index)->
            if index is 2
              saveHotPosts()
            PUB.page('/user')
          '提示'
          ['暂不','保存']
        )
        return
      PUB.page('/user')
    'click #add': (e)->
      if (Session.get("myHotPostsChanged"))
        Session.set("myHotPostsChanged", false)
        navigator.notification.confirm(
          '您改变了热门帖子, 要保存吗?'
          (index)->
            if index is 2
              saveHotPosts()
            $('.importProgressBar, .b-modal, .toEditingProgressBar').remove()
            Tips.show('_tips_addPost')
          '提示'
          ['暂不','保存']
        )
        return
      $('.importProgressBar, .b-modal, .toEditingProgressBar').remove()
      Tips.show('_tips_addPost')
      if Session.get('persistentLoginStatus') and !Meteor.userId() and !Meteor.loggingIn()
        window.plugins.toast.showLongCenter("登录超时，需要重新登录~");
        e.stopPropagation()
        PUB.page('/')
    'click #album-select':(e)->
      Meteor.defer ()->
        $('.modal-backdrop.in').remove()
      prepareToEditorMode()
      PUB.page '/add'
      Meteor.defer ()->
          selectMediaFromAblum(20, (cancel, result,currentCount,totalCount)->
            if cancel
              #$('#level2-popup-menu').modal('hide');
              PUB.back()
              return
            if result
              console.log 'Local is ' + result.smallImage
              Drafts.insert {type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}
              if currentCount >= totalCount
                Meteor.setTimeout(()->
                  Template.addPost.__helpers.get('saveDraft')()
                ,100)
          )
    'click #web-import':(e)->
      $('#level2-popup-menu').modal('hide')
      #if we choose to use server import
      if withServerImport is true
        Session.set('display_select_import_way',true)
      #if we disable server import and just want to use mobile side import
      else
        Session.set('display_select_import_way',false)
        Meteor.defer ()->
          $('.modal-backdrop.in').remove()
        prepareToEditorMode()
        PUB.page '/add'
        cordova.plugins.clipboard.paste (link)->
          regexToken = /\b(((http|https?)+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig
          matchArray = regexToken.exec( link )
          if matchArray isnt null
            importLink = matchArray[0]
            if matchArray[0].indexOf('http') is -1
              importLink = "http://"+matchArray[0]
            Meteor.setTimeout(()->
              handleDirectLinkImport(importLink,1)
            ,100)
          else
            handleAddedLink(null)
            window.plugins.toast.showLongCenter("粘贴板内容并非有效连接，请手动粘贴\n浏览器内容加载后，点击地址栏右侧\"导入\"按钮");
        ,()->
          handleAddedLink(null)
          window.plugins.toast.showLongCenter("无法获得粘贴板数据，请手动粘贴\n浏览器内容加载后，点击地址栏右侧\"导入\"按钮");
    'click #share-import':(e)->
        window.plugins.shareExtension.getShareData ((data) ->
            if data
                editFromShare(data)
                window.plugins.shareExtension.emptyData ((count)->
                   if count == 0
                      return Session.set('wait_import_count',false)
                   Session.set('wait_import_count',true)
                ),->
                   console.log 'deleteShareData was failed!'
          ), ->
            Session.set('wait_import_count',false)
            console.log 'getShareData was Error!'
    'click #photo-select':(e)->
      Meteor.defer ()->
        $('.modal-backdrop.in').remove()
      prepareToEditorMode()
      PUB.page '/add'
      Meteor.defer ()->
        if window.takePhoto
          window.takePhoto (result)->
            console.log 'result from camera is ' + JSON.stringify(result)
            if result
              Drafts.insert {type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}
              Meteor.setTimeout(()->
                Template.addPost.__helpers.get('saveDraft')()
              ,100)
            else
              PUB.back()

  Template.selectImportWay.helpers
    hasAssocaitedUsers: ()->
      (AssociatedUsers.find({}).count() > 0) or (UserRelation.find({userId: Meteor.userId()}).count() > 0)
  serverImportClick = (e, t)->
    Session.set('post_improt_way',e.currentTarget.id)
    Session.set('display_select_import_way',undefined)
    Meteor.defer ()->
      $('.modal-backdrop.in').remove()
    prepareToEditorMode()
    PUB.page '/add'
    cordova.plugins.clipboard.paste (link)->
      regexToken = /\b(((http|https?)+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig
      matchArray = regexToken.exec( link )
      if matchArray isnt null
        importLink = matchArray[0]
        if matchArray[0].indexOf('http') is -1
          importLink = "http://"+matchArray[0]
        Meteor.setTimeout(()->
          if e.currentTarget.id is 'serverImport'
            Session.set 'isServerImport', true
            handleDirectLinkImport(importLink)
          else
            handleDirectLinkImport(importLink,1)
        ,100)
      else
        handleAddedLink(null)
        window.plugins.toast.showLongCenter("粘贴板内容并非有效连接，请手动粘贴\n浏览器内容加载后，点击地址栏右侧\"导入\"按钮");
    ,()->
      handleAddedLink(null)
      window.plugins.toast.showLongCenter("无法获得粘贴板数据，请手动粘贴\n浏览器内容加载后，点击地址栏右侧\"导入\"按钮");
  Template.selectImportWay.events
    'click #mask': ->
      Session.set('display_select_import_way',undefined)
    'click .importWayBtn':(e,t)->
      serverImportClick(e, t)