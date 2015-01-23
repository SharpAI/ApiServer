if Meteor.isClient
  Template.allDrafts.helpers
    items:()->
      for i in [0..SavedDrafts.find().count()-1]
        SavedDrafts.find().fetch()[i]
  Template.allDrafts.events
    'click .back':(event)->
        PUB.back()
    'click .rightButton':(event)->
        SavedDrafts
          .find {owner: Meteor.userId()}
          .forEach (saveddrafts)->
            SavedDrafts.remove saveddrafts._id
        return
    'click img':(e)->
      #Clear draft first
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      #Prepare data
      savedDraftData = SavedDrafts.find({_id: e.currentTarget.id}).fetch()[0]
      #console.log "savedDraftData ="+JSON.stringify(savedDraftData)
      pub = savedDraftData.pub;
      for i in [0..(pub.length-1)]
          Drafts.insert(pub[i])
      Session.set 'isReviewMode','1'
      PUB.page('/add')
      return