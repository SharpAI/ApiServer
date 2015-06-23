if Meteor.isClient
    Template.loadingPost.rendered=->
        $('.showPosts').css 'min-height',$(window).height()
    Template.loadingPost.events
      'click .back' :->
        PUB.back()
    Template.loadingPost.helpers
      isMobile:->
        Meteor.isCordova