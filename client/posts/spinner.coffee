if Meteor.isCordova
  Template.spinner.rendered=->
    this.$('.spinner-overlay').parent().find("img.lazy").lazyload {
      effect : "fadeIn",
      load:->
        $(this).parent().find('.spinner-overlay').remove()
      }