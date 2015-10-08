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
      pub = savedDraftData.pub;
      if device.platform is 'Android'
        pub.index = -1

        FinalProcess = () ->
          Session.set 'isReviewMode','1'
          $('.user').addClass('animated ' + animateOutLowerEffect);
          Meteor.setTimeout ()->
            PUB.page('/add')
          ,animatePageTrasitionTimeout

        Dispatch = ()->
          if ++pub.index >= pub.length
            return FinalProcess()
          if pub[pub.index].type is 'image' && (pub[pub.index].URI.indexOf('file:///') >= 0)
            filename = pub[pub.index].filename
            URI = pub[pub.index].URI
            getBase64OfImage(filename,'',URI,ProcessImage)
          else
            ProcessText()

        ProcessText = ()->
          # must text
          pub[pub.index].noKeyboardPopup=true
          pub[pub.index].respectLayout=true
          Drafts.insert(pub[pub.index])
          Dispatch()

        ProcessImage = (URI,smallImage)->
          if smallImage
            pub[pub.index].imgUrl = smallImage
          else
            pub[pub.index].imgUrl = '/noimage.png'
          pub[pub.index].respectLayout=true
          Drafts.insert(pub[pub.index])
          #it was deleted
          Dispatch()

        Dispatch()
      else
        for i in [0..(pub.length-1)]
          Drafts.insert(pub[i])
        Session.set 'isReviewMode','1'
        PUB.page('/add')
      return
