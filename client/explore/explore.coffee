#space 2
if Meteor.isClient
  Template.explore.rendered=->
    #$('.content').css 'min-height',$(window).height()

  Template.explore.events
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

