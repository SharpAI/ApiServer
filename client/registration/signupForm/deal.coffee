Template.deal_page.events
  'click #btn_back':->
    if Session.get("dealBack") is "register"
      Router.go '/signupForm'
      # Meteor.setTimeout ->
      #   $('.register').css('display',"block")
      #   $('#register').css('display',"none")
      #   $('#weibo').css('display',"none")
      #   $('#login').css('display',"none")
      # ,10
    else if Session.get("dealBack") is "anonymous"
      Router.go '/loginForm'
      Meteor.setTimeout ->
        $('.agreeDeal').css('display',"block")
      ,10
    else
      Router.go '/loginForm'