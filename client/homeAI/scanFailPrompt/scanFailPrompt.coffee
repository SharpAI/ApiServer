if Meteor.isClient
  # Template.introductoryPage.rendered=->
  #   $('.content').css 'min-height',$(window).height()
  
  Template.scanFailPrompt.events
  	'click .rightButton':(event)->
  		Session.set('addHomeAIBox',true)
  		window.ScanBarcodeByBarcodeScanner()