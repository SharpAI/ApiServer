if Meteor.isClient
  Template.showPosts.rendered=->
#    $('.mainImage').css('height',$(window).height()*0.55)
    $('.showPosts').css('min-height',$(window).height())
#    $('.title').css('top',$(window).height()*0.25)
#    $('.addontitle').css('top',$(window).height()*0.35)
    window.title = this.title + ':' + this.addontitle

    if this.data.layout != ''
      json = jQuery.parseJSON(this.data.layout);
      for item in json
        $('#' + item.id).attr('data-row', item.row).attr('data-col', item.col).attr('data-sizex', item.size_x).attr('data-sizey', item.size_y)

    test = $("#test");
    `gridster = test.gridster({widget_base_dimensions: [40, 40],widget_margins: [5, 5], resize: {enabled: false }}).data('gridster');`
    gridster.disable()
    window.lastScroll = 0;
    $(window).scroll (event)->
      #Sets the current scroll position
      st = $(window).scrollTop();
      #Determines up-or-down scrolling
      if st > window.lastScroll
         #Replace this with your function call for downward-scrolling
         console.log "scroll down"
      else
         #Replace this with your function call for upward-scrolling
         console.log "scroll up"
      #Updates scroll position
      window.lastScroll = st

  Template.showPosts.helpers
    time_diff: (created)->
      GetTime0(new Date() - created)
  Template.showPosts.events
    'click .back' :->
      Router.go '/'
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
