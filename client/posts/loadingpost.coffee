if Meteor.isClient
    Template.loadingPost.rendered=->
        $('.showPosts').css 'min-height',$(window).height()