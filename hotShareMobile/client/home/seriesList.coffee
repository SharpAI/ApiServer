Template.seriesList.rendered=->
  $('.content').css 'min-height',$(window).height()
  $(window).scroll (event)->
      target = $("#showMoreResults");
      SERIES_ITEMS_INCREMENT = 10;
      if (!target.length)
          return;
      threshold = $(window).scrollTop() + $(window).height() - target.height();
      if target.offset().top < threshold
          if (!target.data("visible"))
              target.data("visible", true);
              Session.set("seriesitemsLimit", Session.get("seriesitemsLimit") + SERIES_ITEMS_INCREMENT);
      else
          if (target.data("visible"))
              target.data("visible", false);
Template.seriesList.helpers
  noSeries:()->
    !(Series.find().count() > 0)
  mySeries:()->
    # mySeries = Series.find({owner:Meteor.userId(),publish:{"$ne":false}}, {sort: {createdAt: -1}})
    mySeries = Series.find({owner:Meteor.userId()}, {sort: {createdAt: -1}})
    Session.setPersistent('persistentMySeries', mySeries.fetch())
    return mySeries
  moreResults:->
    !(Series.find().count() < Session.get("seriesitemsLimit"))
  loading:->
    Session.equals('seriesCollection','loading')
  loadError:->
    Session.equals('seriesCollection','error')
Template.seriesList.events
    'click .top-home-btn': (event)->
      Router.go '/'
    'click #follow': (event)->
      Router.go '/searchFollow'
    'click .clickHelp':(event)->
      PUB.page '/help'
    'click .seriesImages ul li':(e)->
      seriesId = e.currentTarget.id
      seriesContent = Series.findOne({'_id':seriesId})
      Session.set('seriesContent',seriesContent)
      Session.set('isSeriesEdit',false)
      Router.go '/series/' + seriesId
Template.seriesFooter.events
    'click #album-select':(e)->
      Meteor.defer ()->
        $('.modal-backdrop.in').remove()
      Session.set('isSeriesEdit',true)
      PUB.page '/series'
      Meteor.defer ()->
        selectMediaFromAblum 1, (cancel, result)->
          if cancel
            PUB.back()
            return
          if result
            data = [{type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}]
            multiThreadUploadFileWhenPublishInCordova data, null, (err, result)->
              unless result
                window.plugins.toast.showShortBottom('上传失败，请稍后重试')
                return
              if result.length < 1
                window.plugins.toast.showShortBottom('上传失败，请稍后重试')
                return
              for item in result
                if item.uploaded
                  if item.type is 'image' and item.imgUrl
                    Session.set('seriesContent',{ mainImage:item.imgUrl, postLists: [],publish: false})
              if err
                window.plugins.toast.showShortBottom('上传失败，请稍后重试')
                return
              removeImagesFromCache(data)
    'click #photo-select':(e)->
      Meteor.defer ()->
        $('.modal-backdrop.in').remove()
      Session.set('isSeriesEdit',true)
      PUB.page '/series'
      Meteor.defer ()->
        if window.takePhoto
          window.takePhoto (result)->
            # console.log 'result from camera is ' + JSON.stringify(result)
            if result
              data = [{type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}]
              multiThreadUploadFileWhenPublishInCordova data, null, (err, result)->
                unless result
                  window.plugins.toast.showShortBottom('上传失败，请稍后重试')
                  return
                if result.length < 1
                  window.plugins.toast.showShortBottom('上传失败，请稍后重试')
                  return
                for item in result
                  if item.uploaded
                    if item.type is 'image' and item.imgUrl
                      Session.set('seriesContent',{ mainImage:item.imgUrl, postLists: [],publish: false})
                if err
                  window.plugins.toast.showShortBottom('上传失败，请稍后重试')
                  return
                removeImagesFromCache(data)
            else
              PUB.back()