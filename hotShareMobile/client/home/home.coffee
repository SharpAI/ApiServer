#space 2
if Meteor.isClient
  toNum = (a) ->
    if a is null or a is undefined or a is ''
      return
      
    c = a.split('.')
    num_place = [
      ''
      '0'
      '00'
      '000'
      '0000'
    ]
    r = num_place.reverse()
    i = 0
    while i < c.length
      len = c[i].length
      c[i] = r[len] + c[i]
      i++
    res = c.join('')
    res

  @checkNewVersion = ->
    platform = if Blaze._globalHelpers.isIOS() then 'ios' else (if Blaze._globalHelpers.isAndroid() then 'android' else 'others')
    version = Versions.findOne({})

    if version and version[platform]
      latestVersion = version[platform]
    else
      latestVersion = version_of_build
    _latestVersion = toNum(latestVersion)
    _version_of_build = toNum(version_of_build)
    _localLatestVersion = toNum(window.localStorage.getItem("latestVersion"))
    
    if _latestVersion > _version_of_build and _latestVersion > _localLatestVersion
      window.localStorage.setItem("latestVersion", latestVersion)
      Session.set('latestVersionAlert', true)
    else
      Session.set('latestVersionAlert', false)

    if _latestVersion > _version_of_build
      console.log '有新版本：' + _latestVersion
      return true
    if _latestVersion <= _version_of_build
      console.log '当前版本已是最新版本！'
      return false
  Template.home.helpers
    wasLogon:()->
      Session.get('persistentLoginStatus')
    isCordova:()->
      Meteor.isCordova
    isFirstLog:()->
      Session.get('isFlag');
  Template.home.events
    'click .top-series-btn': (event)->
       Router.go '/seriesList'
    'click #follow': (event)->
       Router.go '/searchFollow'
    'click #search': (event)->
       Router.go '/searchPeopleAndTopic'
    'click .clickHelp':(event)->
      PUB.page '/help'
    'click .closebtn':()->
      $('.app-rate').fadeOut()
      promptForRatingWindowButtonClickHandler(2)
    'click .btn-rate1':()->
      $('.app-rate').fadeOut()
      promptForRatingWindowButtonClickHandler(3)
    'click .btn-rate2':()->
      $('.app-rate').fadeOut()
      promptForRatingWindowButtonClickHandler(3)
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
  Template.home.rendered=->
    flag = window.localStorage.getItem("firstLog") == 'first'
    Session.set('isFlag', !flag)
    checkNewVersion()

Tracker.autorun((t)->
  if !Session.get('isFlag') and Session.get('latestVersionAlert')
    t.stop()
    setTimeout(()->
      Dialogs.alert('我们已为您备好更有趣新版本，记得去更新哦~', null, '新版本提示', '好的')
    , 1000)
);
