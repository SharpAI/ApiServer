#space 2
#if Meteor.isClient
#  Template.home.rendered=->
#    $('.home').css 'height',$(window).height()
#    $('.home').css 'width',$(window).width()
#    return