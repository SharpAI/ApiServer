if Meteor.isClient
  Template.spinner.rendered=->
    this.$('.spinner-overlay').parent().find("img.lazy").lazyload {
      effect : "fadeIn"
      effectspeed: 600
      threshold: 800
      load:->
        $(this).parent().find('.spinner-overlay').remove()
      }
