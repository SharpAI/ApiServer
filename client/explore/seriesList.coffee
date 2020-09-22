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
  showSeriesHint:->
    return !localStorage.getItem('seriesHint');
Template.seriesList.events
    'click .top-home-btn': (event)->
      Router.go '/explore'
    'click #follow': (event)->
      Router.go '/searchFollow'
    'click .clickHelp':(event)->
      PUB.page '/help'
    'click .seriesImages ul li':(e)->
      seriesId = e.currentTarget.id
      Session.set('isSeriesEdit',false)
      Router.go '/series/' + seriesId
Template.seriesFooter.helpers
  haveSeries:()->
    Series.find({owner:Meteor.userId()}).count() > 0
Template.seriesFooter.events
    'click #user':(e)->
      PUB.page('/mySeries')
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
            TempDrafts.insert {type:'image',isSeriesImg:true, isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}
            data = TempDrafts.find({isSeriesImg:true}).fetch()
            Session.set('seriesContent',{imageData:data, postLists: [],publish: false})
            TempDrafts.remove({})
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
              TempDrafts.insert {type:'image',isSeriesImg:true, isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}
              data = TempDrafts.find({isSeriesImg:true}).fetch()
              Session.set('seriesContent',{imageData:data, postLists: [],publish: false})
              TempDrafts.remove({})
            else
              PUB.back()