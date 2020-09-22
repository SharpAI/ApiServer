if Meteor.isClient
  Template.groupsList.rendered=->
    $('.content').css 'min-height',$(window).height()
#    $('.mainImage').css('height',$(window).height()*0.55)
    ###
    $(window).scroll (event)->
        target = $("#showMoreFollowsResults");
        FOLLOWS_ITEMS_INCREMENT = 10;
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();
        if target.offset().top < threshold
            if (!target.data("visible"))
                target.data("visible", true);
                Session.set("followersitemsLimit",
                Session.get("followersitemsLimit") + FOLLOWS_ITEMS_INCREMENT);
        else
            if (target.data("visible"))
                target.data("visible", false);
    ###
  Template.groupsList.helpers
    myGroups:()->
      SimpleChat.GroupUsers.find({user_id:Meteor.userId()}, {sort: {createdAt: -1}})
    # moreResults:->
    #   !(SimpleChat.GroupUsers.find({"userId":Meteor.userId()}).count() < Session.get("followersitemsLimit"))
    loading:->
      Session.equals('followersCollection','loading')
    loadError:->
      Session.equals('followersCollection','error')
  Template.groupsList.events
    'click #groupsListPageback':(event)->
      PUB.back()
    'click .groupItem': (event)->
      console.log 'click .groupItem'
      if isIOS
        if (event.clientY + $('.home #footer').height()) >=  $(window).height()
          console.log 'should be triggered in scrolling'
          return false
      $('.groupsList').addClass('animated ' + animateOutLowerEffect);
      console.log this.group_id
      url = '/simple-chat/to/group?id='+this.group_id
      setTimeout ()->
        PUB.page(url)
      ,animatePageTrasitionTimeout
