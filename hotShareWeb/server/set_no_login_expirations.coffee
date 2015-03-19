if Meteor.isServer
  Meteor.startup ->
    Accounts.config({loginExpirationInDays :null})