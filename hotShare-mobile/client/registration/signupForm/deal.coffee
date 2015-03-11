Template.deal_page.events
  'click #btn_back':->
    Router.go '/authOverlay'
    Meteor.setTimeout ->
      $('.register').css('display',"block")
      $('#register').css('display',"none")
      $('#weibo').css('display',"none")
      $('#login').css('display',"none")
    ,10