if Meteor.isClient
  users = new ReactiveVar([])
  Template.inviteFriendIntoGroup.rendered=->
    users.set([])
    groupid = Session.get('groupsId')
    Meteor.subscribe("get-group-user",groupid)
    $('.content').css 'min-height',$(window).height()
#    $('.mainImage').css('height',$(window).height()*0.55)
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
  Template.inviteFriendIntoGroup.helpers
    myFollows:()->
      Follower.find({"userId":Meteor.userId()}, {sort: {createdAt: -1}}, {limit:Session.get("followersitemsLimit")})
    moreResults:->
      !(Follower.find({"userId":Meteor.userId()}).count() < Session.get("followersitemsLimit"))
    loading:->
      Session.equals('followersCollection','loading')
    loadError:->
      Session.equals('followersCollection','error')
    is_selected: (followerId)->
      return _.pluck(users.get(), 'followerId').indexOf(followerId) isnt -1
    is_invited:(followerId)->
      SimpleChat.GroupUsers.findOne({group_id:Session.get('groupsId'),user_id:followerId})
  Template.inviteFriendIntoGroup.events
    'click .leftButton':(event)->
      Session.set("groupsProfileMenu","groupInformation")
    'click .rightButton':(event)->
      selected = users.get()
      if selected.length <= 0
        Session.set("groupsProfileMenu","groupInformation")
        return 
      Meteor.call 'add-group-urser', Session.get('groupsId'), _.pluck(selected, 'followerId'), (err, id)->
        console.log(err)
        if err or !id
          return PUB.toast('添加失败，请重试~')
        Session.set("groupsProfileMenu","groupInformation")
        
    'click .followItem': (event)->
      # console.log(this);
      $i = $(event.currentTarget).find('i');
      if $i.hasClass('is-invited-item')
        return
      selected = users.get()
      if _.pluck(selected, 'followerId').indexOf(this.followerId) is -1
        selected.push(this)
      else
        selected.splice(_.pluck(selected, 'followerId').indexOf(this.followerId), 1)
      users.set(selected)
