if Meteor.isClient
  Template.allDrafts.onCreated ()->
    Meteor.subscribe("saveddrafts")
  Template.allDrafts.helpers
    items:()->
      for i in [0..SavedDrafts.find().count()-1]
        SavedDrafts.find({},{sort: {createdAt: -1}}).fetch()[i]
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
  Template.allDrafts.events
    'click .back':(event)->
        PUB.back()
    'click .rightButton':(event)->
        navigator.notification.confirm('这个操作无法撤销', (r)->
          console.log('r is ' + r)
          if r is 2
            return
          #Clear All Saved Drafts
          #SavedDrafts.remove {owner: Meteor.userId()}
          SavedDrafts
            .find {owner: Meteor.userId()}
            .forEach (saveddrafts)->
              SavedDrafts.remove saveddrafts._id
          Session.setPersistent('mySavedDraftsCount',0)
          Session.setPersistent('persistentMySavedDrafts',null)
          Meteor.setTimeout ()->
            PUB.back()
          ,animatePageTrasitionTimeout
          return
        , '您确定删除全部草稿吗？', ['继续删除','放弃删除']);
    'click .mainImage':(e)->
      #Use for if user discard change on Draft
      TempDrafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          TempDrafts.remove drafts._id
      #Clear draft first
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      #Prepare data
      savedDraftData = SavedDrafts.find({_id: @_id}).fetch()[0]
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
      #console.log "savedDraftData ="+JSON.stringify(savedDraftData)
      pub = savedDraftData.pub
      deferedProcessAddPostItemsWithEditingProcessBar(pub)
      Session.set 'isReviewMode','1'
      PUB.page('/add')