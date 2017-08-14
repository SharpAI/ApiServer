if Meteor.isClient
  Template.addressBook.rendered=->
    #$('.content').css 'min-height',$(window).height()
#    $('.mainImage').css('height',$(window).height()*0.55)
    $('.content').scroll (event)->
        target = $("#showMoreFollowsResults");
        FOLLOWS_ITEMS_INCREMENT = 10;
        if (!target.length)
            return;
        threshold = $('.content').scrollTop() + $('.content').height() - target.height();
        if target.offset().top < threshold
            if (!target.data("visible"))
                target.data("visible", true);
                Session.set("followersitemsLimit",
                Session.get("followersitemsLimit") + FOLLOWS_ITEMS_INCREMENT);
        else
            if (target.data("visible"))
                target.data("visible", false);
  Template.addressBook.helpers
    myFollows:()->
      Follower.find({"userId":Meteor.userId()}, {sort: {createdAt: -1}}, {limit:Session.get("followersitemsLimit")})
    moreResults:->
      !(Follower.find({"userId":Meteor.userId()}).count() < Session.get("followersitemsLimit"))
    loading:->
      Session.equals('followersCollection','loading')
    loadError:->
      Session.equals('followersCollection','error')
  Template.addressBook.events
    'click #follow':(event)->
      PUB.page('/searchFollow');
    'click .newFriends':(event)->
      #PUB.page('/newFriendsList')
    'click .groupslist':(event)->
      PUB.page('/groupsList')
    'click .devicelist':(event)->
      PUB.page('/timeline')
    'click .recentlyPeople':(event)->
      #PUB.page('/recentlyList')
    'click .followItem': (event)->
      console.log 'click .followItem'
      PUB.page('/simpleUserProfile/'+this.followerId);
      # url = '/simple-chat/to/user?id='+ this.followerId
      # setTimeout ()->
      #   PUB.page(url)
      # ,animatePageTrasitionTimeout
      # if isIOS
      #   if (event.clientY + $('.home #footer').height()) >=  $(window).height()
      #     console.log 'should be triggered in scrolling'
      #     return false
      # $('.chatGroups').addClass('animated ' + animateOutLowerEffect);
      # console.log this.followerId
      # url = '/simple-chat/to/group?id='+this.followerId
      # setTimeout ()->
      #   Router.go(url)
      # ,animatePageTrasitionTimeout
