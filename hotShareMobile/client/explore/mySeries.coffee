Template.mySeries.rendered=->
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
Template.mySeries.helpers
  mySeries:()->
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
Template.mySeries.events
    'click .back': (event)->
      Router.go '/seriesList'
    'click #follow': (event)->
      Router.go '/searchFollow'
    'click .seriesImages ul li':(e)->
      seriesId = e.currentTarget.id
      Session.set('isSeriesEdit',false)
      Router.go '/series/' + seriesId
