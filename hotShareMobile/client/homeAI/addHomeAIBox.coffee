if Meteor.isClient
  # Template.introductoryPage.rendered=->
  #   $('.content').css 'min-height',$(window).height()
  
  Template.addHomeAIBox.events
    'click #addHomeAIBoxBtn':(event)->
      window.ScanBarcodeByBarcodeScanner()