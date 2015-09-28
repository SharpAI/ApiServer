if Meteor.isClient
  # The predefined background color was grabbed from pinterest
  predefineColors = [
    "#55303e",
    "#503f32",
    "#7e766c",
    "#291d13",
    "#d59a73",
    "#a87c5f",
    "#282632",
    "#ca9e92",
    "#a7a07d",
    "#846843",
    "#6ea89e",
    "#292523",
    "#637168",
    "#573e1b",
    "#925f3e",
    "#786b53",
    "#aaa489",
    "#a5926a",
    "#6a6b6d",
    "#978d69",
    "#a0a1a1",
    "#4b423c",
    "#5f4a36",
    "#b6a2a9",
    "#1c1c4e",
    "#e0d9dc",
    "#393838",
    "#c5bab3",
    "#a46d40",
    "#735853",
    "#3c3c39"
  ]
  colorLength = predefineColors.length
  colorIndex = 0
  Template.padding.rendered=->
    $lazyitem = this.$('.padding-overlay').parent().find('img.lazy')
    $lazyitem.lazyload {
      effect : "fadeIn"
      effectspeed: 600
      threshold: 800
      placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
      load:->
        console.log "Frank: style =  "+$(this).attr('style')
        $(this).parent().actImageFitCover('style')
    }
    newLayout.setRandomlyBackgroundColor($lazyitem)
