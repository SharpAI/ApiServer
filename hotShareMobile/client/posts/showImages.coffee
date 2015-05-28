if Meteor.isClient
  Meteor.startup ()->
    @ImagesSwiper = new ImageSwipe(['showImagesPage1', 'showImagesPage2', 'showImagesPage3'])
    ImagesSwiper.click 'showImagesPage1', '.image', (e,t) ->
      if window.showImagesTrackerHandler
        window.showImagesTrackerHandler.stop()
        window.showImagesTrackerHandler = null
        if PopUpBox
          PopUpBox.close()
    ImagesSwiper.click 'showImagesPage2', '.image', (e,t) ->
      if window.showImagesTrackerHandler
        window.showImagesTrackerHandler.stop()
        window.showImagesTrackerHandler = null
        if PopUpBox
          PopUpBox.close()
    ImagesSwiper.click 'showImagesPage3', '.image', (e,t) ->
      if window.showImagesTrackerHandler
        window.showImagesTrackerHandler.stop()
        window.showImagesTrackerHandler = null
        if PopUpBox
          PopUpBox.close()
  Template.showImages.helpers
    ImagesSwiper: -> ImagesSwiper
  Template.showImages.rendered = ->
    # starting page
    ImagesSwiper.setInitialPage 'showImagesPage1'
    if showImagesTrackerHandler
      showImagesTrackerHandler.stop()
      showImagesTrackerHandler = null
    Tracker.autorun (imageHandler)->
      window.showImagesTrackerHandler = imageHandler
      if ImagesSwiper.pageIs('showImagesPage1')
        currentImageIndex = Session.get("currentImageIndex")
        currentPageIndex = Session.get("currentPageIndex")
        if Session.get("currentPageIndex") isnt 1
          swipeImageData = Session.get("swipeImageData")
          if Session.get("currentPageIndex") is 2
            currentImageIndex = Session.get("currentImageIndex")-1
            if currentImageIndex < 0
               currentImageIndex = swipeImageData.length-1
            Session.set("currentImageIndex", currentImageIndex)
            nextImageIndex = currentImageIndex-1
            if nextImageIndex <  0
               nextImageIndex = swipeImageData.length-1
            Session.set("showImage3", swipeImageData[nextImageIndex].imgUrl)
          if Session.get("currentPageIndex") is 3
            currentImageIndex = Session.get("currentImageIndex")+1
            if currentImageIndex >  swipeImageData.length-1
               currentImageIndex = 0
            Session.set("currentImageIndex", currentImageIndex)
            nextImageIndex = currentImageIndex+1
            if nextImageIndex >  swipeImageData.length-1
               nextImageIndex = 0
            Session.set("showImage2", swipeImageData[nextImageIndex].imgUrl)
          Session.set("currentPageIndex", 1)
        ImagesSwiper.leftRight('showImagesPage3', 'showImagesPage2')
      if ImagesSwiper.pageIs('showImagesPage2')
        if Session.get("currentPageIndex") isnt 2
          swipeImageData = Session.get("swipeImageData")
          if Session.get("currentPageIndex") is 1
            currentImageIndex = Session.get("currentImageIndex")+1
            if currentImageIndex >  swipeImageData.length-1
               currentImageIndex = 0
            Session.set("currentImageIndex", currentImageIndex)
            nextImageIndex = currentImageIndex+1
            if nextImageIndex >  swipeImageData.length-1
               nextImageIndex = 0
            Session.set("showImage3", swipeImageData[nextImageIndex].imgUrl)
          if Session.get("currentPageIndex") is 3
            currentImageIndex = Session.get("currentImageIndex")-1
            if currentImageIndex < 0
               currentImageIndex = swipeImageData.length-1
            Session.set("currentImageIndex", currentImageIndex)
            nextImageIndex = currentImageIndex-1
            if nextImageIndex <  0
               nextImageIndex = swipeImageData.length-1
            Session.set("showImage1", swipeImageData[nextImageIndex].imgUrl)
          Session.set("currentPageIndex", 2)
        ImagesSwiper.leftRight('showImagesPage1', 'showImagesPage3')
      if ImagesSwiper.pageIs('showImagesPage3')
        if Session.get("currentPageIndex") isnt 3
          swipeImageData = Session.get("swipeImageData")
          if Session.get("currentPageIndex") is 1
            currentImageIndex = Session.get("currentImageIndex")-1
            if currentImageIndex < 0
               currentImageIndex = swipeImageData.length-1
            Session.set("currentImageIndex", currentImageIndex)
            nextImageIndex = currentImageIndex-1
            if nextImageIndex <  0
               nextImageIndex = swipeImageData.length-1
            Session.set("showImage2", swipeImageData[nextImageIndex].imgUrl)
          if Session.get("currentPageIndex") is 2
            currentImageIndex = Session.get("currentImageIndex")+1
            if currentImageIndex >  swipeImageData.length-1
               currentImageIndex = 0
            Session.set("currentImageIndex", currentImageIndex)
            nextImageIndex = currentImageIndex+1
            if nextImageIndex >  swipeImageData.length-1
               nextImageIndex = 0
            Session.set("showImage1", swipeImageData[nextImageIndex].imgUrl)
          Session.set("currentPageIndex", 3)
        ImagesSwiper.leftRight('showImagesPage2', 'showImagesPage1')
  Template.showImagesPage1.rendered=->
    $('.showImage').css('min-height', $(window).height() - 40)
  Template.showImagesPage1.helpers
    image:->
      Session.get("showImage1")
  Template.showImagesPage2.rendered=->
    $('.showImage').css('min-height', $(window).height() - 40)
  Template.showImagesPage2.helpers
    image:->
      Session.get("showImage2")
  Template.showImagesPage3.rendered=->
    $('.showImage').css('min-height', $(window).height() - 40)
  Template.showImagesPage3.helpers
    image:->
      Session.get("showImage3")
