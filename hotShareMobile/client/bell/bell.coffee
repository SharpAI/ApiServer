if Meteor.isClient
  Template.bell.rendered=->
    $('.content').css 'min-height',$(window).height()
    $(window).scroll (event)->
        target = $("#showMoreFeedsResults");
        FEEDS_ITEMS_INCREMENT = 20;
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if target.offset().top < threshold
            if (!target.data("visible"))
                target.data("visible", true);
                Session.set("feedsitemsLimit",
                Session.get("feedsitemsLimit") + FEEDS_ITEMS_INCREMENT);
        else
            if (target.data("visible"))
                target.data("visible", false);
  Template.bell.helpers
    eventFeeds:->
      Feeds.find({}, {sort: {createdAt: -1}})
    isReComment:(eventType)->
      eventType is 'recomment'
    isComment:(eventType)->
      eventType is 'comment'
    selfPosted:(eventType)->
      eventType is 'SelfPosted'
    time_diff: (created)->
      GetTime0(new Date() - created)
    moreResults:->
      !(Feeds.find().count() < Session.get("feedsitemsLimit"))
    loading:->
      Session.equals('feedsCollection','loading')
    loadError:->
      Session.equals('feedsCollection','error')
  Template.bell.events
    'click #follow': (event)->
       Router.go '/searchFollow'
