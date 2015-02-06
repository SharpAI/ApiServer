#space 2
if Meteor.isClient
  Template.footer.helpers
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
  Template.footer.events
    'click .btn':(e)->
      page = '/' + e.currentTarget.id;
      if e.currentTarget.id is 'home'
        page = '/'
      PUB.page(page)
    'click #add':(e)->
      #console.log 'Clicked on ADD'
      Session.set 'isReviewMode','0'
      Drafts.remove({})
      Meteor.setTimeout(
        ()->
          selectMediaFromAblum(20, (cancel, result)->
            #console.log 'upload success: url is ' + result
            #Drafts.insert {owner: Meteor.userId(), imgUrl:result}
            if cancel
              if Drafts.find().count() is 0
                PUB.back()
              return
            if result
              Session.set 'NewImgAdd','true'
              console.log 'Local is ' + result.smallImage
              Drafts.insert {type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}
              Router.go '/add'
          )
        0
      )
