if Meteor.isClient
  window.getDocHeight = ->
    D = document
    Math.max(
      Math.max(D.body.scrollHeight, D.documentElement.scrollHeight)
      Math.max(D.body.offsetHeight, D.documentElement.offsetHeight)
      Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    )
  Template.showPosts.rendered=->
    #`global_disable_longpress = true`
    postContent = Session.get("postContent")
    browseTimes = 0
    if (postContent.browse != undefined)
      browseTimes = postContent.browse + 1
    else
      browseTimes = 1
    Meteor.setTimeout ()->
        Posts.update(
          {_id:postContent._id},
          {$set:{
              browse:browseTimes,
            }
          }
        )
      ,3000
    $('p').linkify();
    $("a[target='_blank']").click((e)->
      e.preventDefault();
      window.open($(e.currentTarget).attr('href'), '_system', '');
    )

    $('.showPosts').css('min-height',$(window).height())
    #document.title = this.title + ':' + this.addontitle
    base_size=($( window ).width()/6 - 10);

    test = $("#test");
    `gridster = test.gridster({widget_base_dimensions: [base_size, base_size],widget_margins: [5, 5], min_cols: 3, max_cols:6, resize: {enabled: false }}).data('gridster');`
    gridster.disable()


    $("#test").find('.hastextarea').each( ( i, itemElem )->
      textdiv = $(itemElem).children('.textdiv')
      textarea = $(textdiv).children('p')

      #offset = this.offsetHeight - this.clientHeight;
      #height = $(textarea).height()
      #width = $( window ).width()
      #5*2 is gridster gap size, 4*2 is padding
      #$(textarea).css('width', width - 10)
      $(textarea).css('height', 'auto')
      height = $(textarea).height()

      min_widget_height = (5 * 2) + base_size;
      sizey = Math.floor((height)/min_widget_height)+1

      #$(textarea).css('width', '')
      $(textarea).css('height', '')
      sizex = $(itemElem).attr("data-sizex")
      sizey_orig = parseInt($(itemElem).attr("data-sizey"))
      if sizey isnt sizey_orig
        $(itemElem).attr("data-sizey", sizey)
        gridster.resize_widget($(itemElem), sizex,sizey)
    )
    window.lastScroll = 0;
    $(window).scroll (event)->
      #Sets the current scroll position
      st = $(window).scrollTop();

      if(st + $(window).height() is window.getDocHeight())
        $('.showPosts .head').fadeIn 300
        $('.showPostsFooter').fadeIn 300
        window.lastScroll = st
        return
      # Changed is too small
      if Math.abs(window.lastScroll - st) < 10
        return
      #Determines up-or-down scrolling
      if st > window.lastScroll
        $('.showPosts .head').fadeOut 300
        $('.showPostsFooter').fadeOut 300
      else
        $('.showPosts .head').fadeIn 300
        $('.showPostsFooter').fadeIn 300
      #Updates scroll position
      window.lastScroll = st

  Template.showPosts.helpers
    time_diff: (created)->
      GetTime0(new Date() - created)
    isMyPost:->
      false
    isMobile:->
      false
  Template.showPosts.events

    'click .imgdiv': (e)->
      images = []
      swipedata = []

      #swipedata.push
      #  href: Session.get('postContent').mainImage
      #  title: Session.get('postContent').title
      #i = 1
      i = 0
      selected = 0
      for image in Session.get('postContent').pub
        if image.imgUrl
          if image.imgUrl is this.imgUrl
            selected = i
          swipedata.push
            href: image.imgUrl
            title: image.text
          i++
      $.swipebox swipedata,{
        initialIndexOnArray: selected
        hideCloseButtonOnMobile : true
        loopAtEnd: false
      }
