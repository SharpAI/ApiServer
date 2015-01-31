if Meteor.isCordova
  Template.spinner.rendered=->
    this.$('.spinner-overlay').parent().find("img.lazy").lazyload {
      effect : "fadeIn"
      effectspeed: 1000
      load:->
        $(this).parent().find('.spinner-overlay').remove()
      }