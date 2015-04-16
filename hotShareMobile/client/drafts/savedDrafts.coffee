if Meteor.isClient
  Template.allDrafts.helpers
    items:()->
      for i in [0..SavedDrafts.find().count()-1]
        SavedDrafts.find({},{sort: {createdAt: -1}}).fetch()[i]
  Template.allDrafts.events
    'click .back':(event)->
        PUB.back()
    'click .rightButton':(event)->
        SavedDrafts
          .find {owner: Meteor.userId()}
          .forEach (saveddrafts)->
            SavedDrafts.remove saveddrafts._id
        PUB.back()
    'click .mainImage':(e)->
      #Clear draft first
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      #Prepare data
      savedDraftData = SavedDrafts.find({_id: @_id}).fetch()[0]
      #console.log "savedDraftData ="+JSON.stringify(savedDraftData)
      pub = savedDraftData.pub;
      for i in [0..(pub.length-1)]
        if (pub[i].URI.indexOf('file:///') >= 0)
          window.getBase64OfImage(pub[i].filename, pub[i].URI.replace(/^.*[\\\/]/, ''), pub[i].URI, (URI,smallImage)->
            for j in [0..(pub.length-1)]
              if (pub[j].URI == URI)
                pub[j].imgUrl = smallImage
                Drafts.insert(pub[j])
          )
        else
          Drafts.insert(pub[i])
      Session.set 'isReviewMode','1'
      PUB.page('/add')
      return
