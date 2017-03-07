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
              console.log("target became visible (inside viewable area)");
              target.data("visible", true);
              Session.set("seriesitemsLimit",
              Session.get("seriesitemsLimit") + SERIES_ITEMS_INCREMENT);
      else
          if (target.data("visible"))
              console.log("target became invisible (below viewable arae)");
              target.data("visible", false);
Template.seriesList.helpers
  noSeries:()->
    !(Series.find().count() > 0)
  mySeries:()->
    mySeries = Series.find({owner:Meteor.userId(),publish:{"$ne":false}}, {sort: {createdAt: -1}})
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
      Router.go '/series/' + seriesId
Template.seriesFooter.events
    'click #add':()->
      Session.set('isSeriesEdit',true)
      PUB.page '/series'