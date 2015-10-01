if Meteor.isClient
  padding_debug=false
  Template.padding.rendered=->
    $lazyitem = this.$('.padding-overlay').parent().find('img.lazy')
    $lazyitem.lazyload {
      effect : "fadeIn"
      effectspeed: 600
      threshold: 800
      placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
      load:->
        padding_debug&&console.log "Frank: style =  "+$(this).attr('style')
        $(this).parent().actImageFitCover('style')
    }
    newLayout.setRandomlyBackgroundColor($lazyitem)
