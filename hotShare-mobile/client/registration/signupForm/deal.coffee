Template.deal_page.events
  'click #btn_back':->
    if Session.get("dealBack") is "register"
      Router.go '/authOverlay'
      Meteor.setTimeout ->
        $('.register').css('display',"block")
        $('#register').css('display',"none")
        $('#weibo').css('display',"none")
        $('#login').css('display',"none")
      ,10
    else if Session.get("dealBack") is "anonymous"
      Router.go '/authOverlay'
      Meteor.setTimeout ->
        $('.agreeDeal').css('display',"block")
      ,10
    else
      Router.go '/authOverlay'