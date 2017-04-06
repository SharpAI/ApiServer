if Meteor.isClient
  users = new ReactiveVar([])
  Template.groupAdd.rendered=->
    users.set([])
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
  Template.groupAdd.helpers
    myFollows:()->
      Follower.find({"userId":Meteor.userId()}, {sort: {createdAt: -1}}, {limit:Session.get("followersitemsLimit")})
    moreResults:->
      !(Follower.find({"userId":Meteor.userId()}).count() < Session.get("followersitemsLimit"))
    loading:->
      Session.equals('followersCollection','loading')
    loadError:->
      Session.equals('followersCollection','error')
    is_selected: (userId)->
      return _.pluck(users.get(), 'userId').indexOf(userId) isnt -1
  Template.groupAdd.events
    'click .leftButton':(event)->
      history.go(-1)
    'click .rightButton':(event)->
      selected = users.get()
      if selected.length <= 0
        return PUB.toast('没有选择任何用户~')
      Meteor.call 'create-group', null, null, _.pluck(selected, 'followerId'), (err, id)->
        console.log(err)
        if err or !id
          return PUB.toast('创建群聊失败，请重试~')
        Meteor.setTimeout(
          ()->
            Router.go('/simple-chat/to/group?id=' + id)
          50
        )
        history.go(-1)
    'click .followItem': (event)->
      $i = $(event.currentTarget).find('i');
      selected = users.get()
      if _.pluck(selected, 'followerId').indexOf(this.followerId) is -1
        selected.push(this)
      else
        selected.splice(_.pluck(selected, 'followerId').indexOf(this.followerId), 1)
      users.set(selected)
