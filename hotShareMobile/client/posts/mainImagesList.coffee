if Meteor.isClient
    Template.mainImagesList.onRendered ()->
      $('.mainImagesList').css 'min-height',$(window).height()
      pubImages=[]
      draftData = Drafts.find({}).fetch()
      if draftData.length > 0
        for i in [0..(draftData.length-1)]
          if draftData[i].isImage is true
            doc = {
              URI: draftData[i].URI,
              imageId: draftData[i]._id,
              imgUrl: draftData[i].imgUrl,
              filename: draftData[i].filename
            }
            pubImages.push(doc)
      Session.set('pubImages',pubImages)
    Template.mainImagesList.events
      'click .mainImagesListback' :(e)->
        $('body').removeAttr('style')
        $('.addPost').show()
        $('.mainImagesList').hide()
      'click .mainImagesListImport' :(e)->
        drafts = Drafts.findOne({type:'image'})
        mainImageId = drafts._id
        URI = ''
        imageId = ''
        mainImgUrl = ''
        mainFileName = ''
        imageSrc = ''
        $('input[class="mainImageListInput"]').each( ()->
          if true is $(this).prop('checked')
            imageId = $(this).attr('id')
            URI = $(this).attr('uri')
            mainImgUrl = $(this).attr('value')
            mainFileName = $(this).attr('name')
            imageSrc = $('.image_' + imageId).attr('src')
        )
        if mainImgUrl isnt '' and mainFileName isnt ''
          Drafts.update({_id:mainImageId},{$set: {imgUrl:mainImgUrl,filename: mainFileName,URI:URI}}, (error, result)->
            if error
              PUB.toast('修改失败，请重试！')
            else
              $('#mainImage' + mainImageId).attr('src',imageSrc)
              $('body').removeAttr('style')
              $('.addPost').show()

              title = $('#mainImage' + mainImageId).parent().find("textarea#title").get(0)
              if title?
                title.style.height = 'auto'
                scrollHeight = title.scrollHeight + 2;
                title.style.height = scrollHeight + 'px'

              addontitle = $('#mainImage' + mainImageId).parent().find("textarea#addontitle").get(0)
              if addontitle?
                addontitle.style.height = 'auto'
                scrollHeight = addontitle.scrollHeight + 2;
                addontitle.style.height = scrollHeight + 'px'

              $('.mainImagesList').hide()
          )
        else
          PUB.toast '请选择图片！'
      'click .mainImageListInput' :(e)->
        $('.mainImageListInput').prop('checked',false)
        Meteor.setTimeout ()->
          $(e.currentTarget).prop('checked',true)
        ,50
    Template.mainImagesList.helpers
      getImagePath: (path,uri,id)->
        getImagePath(path,uri,id)
      images:->
        Session.get('pubImages')
      officialImages:->
        arr = [{num:1},{num:2},{num:3},{num:4},{num:5},{num:6},{num:7},{num:8},{num:9},{num:10}]
        arr