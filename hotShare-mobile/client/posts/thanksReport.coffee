if Meteor.isClient
  Template.thanksReport.events
    "click .rightButton":(event)->
       postId = Session.get("postContent")._id
       Router.go '/posts/'+postId
       false
    "click .back":(event)->
       postId = Session.get("postContent")._id
       Router.go '/posts/'+postId
       false
