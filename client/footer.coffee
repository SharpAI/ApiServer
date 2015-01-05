#space 2
if Meteor.isClient
  Meteor.startup ()->
    Router.route '/',()->
      this.render 'home'
  Template.footer.helpers
    focus_style:(channelName)->
      channel = Session.get "channel"
      if channel is channelName
        return "focus"
      else
        return ""