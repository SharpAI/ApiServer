if Meteor.isClient
  # Template.introductoryPage.rendered=->
  #   $('.content').css 'min-height',$(window).height()
  
  Template.addHomeAIBox.events
  	'click .leftButton':(event)->
      Router.go('/scene');
    'click #addHomeAIBoxBtn':(event)->
      Session.set('addHomeAIBox',true);
      window.ScanBarcodeByBarcodeScanner()