if Meteor.isClient
  Template.spinner.rendered=->
    this.$('.spinner-overlay').parent().find("img.lazy").lazyload {
      effect : "fadeIn"
      effectspeed: 600
      threshold: 800
      load:->
        $(this).parent().find('.spinner-overlay').remove()
        console.log "Frank: style =  "+$(this).attr('style')
        $(this).parent().actImageFitCover('style');
        return
        styleStr = $(this).attr('style')
        hasWidth = 0
        hasHeight = 0
        hasTop = 0
        hasLeft = 0
        if styleStr?
            styleAttrs = styleStr.split(';')
            for item in styleAttrs
              styleValue = item.split(':')
              if styleValue[0].trim() is 'width'
                if styleValue[1].indexOf('%')
                    hasWidth = 1
              if styleValue[0].trim() is 'height'
                if styleValue[1].indexOf('%')
                    hasHeight = 1
              if styleValue[0].trim() is 'top'
                if styleValue[1].indexOf('%')
                    hasTop = 1
              if styleValue[0].trim() is 'left'
                if styleValue[1].indexOf('%')
                    hasLeft = 1
            if hasWidth is 1 and hasHeight is 1 and hasTop is 1 and hasLeft is 1
                return
        $(this).parent().imageFitCover();
      }
