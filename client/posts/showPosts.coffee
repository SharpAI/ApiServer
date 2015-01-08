if Meteor.isClient
  Template.showPosts.rendered=->
    $('.img').css('max-width',$(window).width())
    $('.mainImage').css('height',$(window).height()*0.55)
    $('.title').css('top',$(window).height()*0.25)
    $('.addontitle').css('top',$(window).height()*0.35)