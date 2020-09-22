if Meteor.isClient
  # Template.introductoryPage.rendered=->
  #   $('.content').css 'min-height',$(window).height()
  
  Template.scene.events
    'click #workaiScene':(event)->
      window.localStorage.setItem("isWorkAIScene",'true');
      Router.go('/introductoryPage');
    'click #homeaiScene':(event)->
      window.localStorage.setItem("isWorkAIScene",'false');
      Router.go('/addHomeAIBox');