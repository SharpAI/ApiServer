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
      # 'click .mainImageListInput' :->
      #   $('.mainImageListInput').prop('checked',false)
      #   setTimeout ()->
      #     $(this).prop('checked',true)
      #   ,500
      #   console.log('###')
      #   console.log(this)
    Template.mainImagesList.helpers
      images:->
        Session.get('pubImages')