#space 2
if Meteor.isClient
  Template.footer.helpers
    is_wait_read_count: (count)->
      count > 0
    wait_read_count:->
      if Meteor.user() is null
        0
      else
        waitReadCount = Meteor.user().profile.waitReadCount
        if waitReadCount is undefined or isNaN(waitReadCount)
          waitReadCount = 0
        if Session.get('channel') is 'bell' and waitReadCount > 0
          waitReadCount = 0
          Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.waitReadCount': 0}});
        waitReadCount
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
  Template.footer.events
    'click #home':(e)->
      PUB.page('/')
    'click #search':(e)->
      PUB.page('/search')
    'click #bell':(e)->
      waitReadCount = Meteor.user().profile.waitReadCount
      if waitReadCount is undefined or isNaN(waitReadCount)
        waitReadCount = 0
      if waitReadCount > 0
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
      handleAddedLink(null)
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
