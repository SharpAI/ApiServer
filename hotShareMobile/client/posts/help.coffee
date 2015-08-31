Template.help.rendered=->
    new jQueryCollapse($('#custom-show-hide-example'),
     open: ->
      this.slideDown 150
      return
     close: ->
      this.slideUp 150
      return
     )
Template.help.events
   'click .back':(event)->
      history.back()