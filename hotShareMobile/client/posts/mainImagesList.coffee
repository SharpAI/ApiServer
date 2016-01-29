if Meteor.isClient
    Template.mainImagesList.onRendered ()->
      $('.mainImagesList').css 'min-height',$(window).height()
      pubImages=[]
      draftData = Drafts.find().fetch()
      for i in [0..(draftData.length-1)]
        if draftData[i].isImage is true
          doc = {
            imgUrl: draftData[i].imgUrl,
            filename: draftData[i].filename
          }
          pubImages.push(doc)
      Session.set('pubImages',pubImages)
    Template.mainImagesList.events
      'click .mainImagesListback' :(e)->
        $('.addPost').show()
        $('.mainImagesList').hide()
      'click .mainImageListInput' :(e)->
        $('.mainImageListInput').prop('checked',false)
        Meteor.setTimeout ()->
          $(e.currentTarget).prop('checked',true)
        ,50
    Template.mainImagesList.helpers
      images:->
        Session.get('pubImages')