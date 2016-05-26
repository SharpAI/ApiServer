#space 2
if Meteor.isClient
  Template.footer.helpers
    is_wait_read_count: (count)->
      count > 0
    wait_read_count:->
      me = Meteor.user()
      if me
        if me.profile and me.profile.waitReadCount
          waitReadCount = me.profile.waitReadCount
          if waitReadCount is undefined or isNaN(waitReadCount)
            waitReadCount = 0
          if Session.get('channel') is 'bell' and waitReadCount > 0
            waitReadCount = 0
            Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.waitReadCount': 0}});
          return waitReadCount
      else
        0
    wait_import_count:->
       return Session.get('wait_import_count')
       
    focus_style:(channelName)->
      channel = Session.get "focusOn"
      if channel is channelName
        return "focus"
      else
        return ""
    icon_size:(channelName)->
      channel = Session.get "focusOn"
      if channel is channelName
        return true
    display_footer:()->
      console.log "document_body_scrollTop=" + Session.get("document_body_scrollTop")
      Meteor.setTimeout(
        ()->
            document.body.scrollTop = Session.get("document_body_scrollTop")
        0
      )
      Meteor.isCordova
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
        Meteor.setTimeout(()->
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
       Meteor.setTimeout(()->
          handleDirectLinkImport(data.content[0])
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
                Meteor.setTimeout(()->
                  Template.addPost.__helpers.get('saveDraft')()
                ,100)
          )
    Meteor.setTimeout(()->
      handleDirectLinkImport(url)
    ,100)
  Template.footer.events
    'click #home':(e)->
      PUB.page('/')
    'click #search':(e)->
      PUB.page('/search')
    'click #bell':(e)->
      Meteor.defer ()->
        me = Meteor.user()
        if me and me.profile and me.profile.waitReadCount
          if me.profile.waitReadCount > 0
            Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.waitReadCount': 0}});
      PUB.page('/bell')
    'click #user':(e)->
      PUB.page('/user')
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
            handleDirectLinkImport(importLink)
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
