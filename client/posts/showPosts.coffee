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


      window.plugins.socialsharing.share(this.title, null, this.mainImage, url);
