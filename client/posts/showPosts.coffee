if Meteor.isClient
  Template.showPosts.rendered=->
    $('.img').css('max-width',$(window).width())
    $('.mainImage').css('height',$(window).height()*0.55)
    $('.title').css('top',$(window).height()*0.25)
    $('.addontitle').css('top',$(window).height()*0.35)
  Template.showPosts.events
    'click #socialShare': (event)->
      current = Router.current();
      url = current.url;
      if url.indexOf("http") > 0
        url = url.replace("meteor.local", "hotshare.meteor.com");
      else
        url = "http://hotshare.meteor.com"+url;
      window.plugins.socialsharing.share(this.title+':'+this.addontitle+'(来自 故事贴)', null, null, url);
    'click .img': (e)->
      images = []
      swipedata = []
      i = 0
      selected = 0
      for image in Session.get('postContent').pub
        if image.imgUrl is this.imgUrl
          selected = i
        if image.imgUrl
          swipedata.push
            href: image.imgUrl
            title: image.text
        i++
      $.swipebox swipedata,{
        initialIndexOnArray: selected
        hideCloseButtonOnMobile : true
      }
      $(document.body).on('click','#swipebox-slider .current', ->
        $('#swipebox-close').trigger('click')
      )
