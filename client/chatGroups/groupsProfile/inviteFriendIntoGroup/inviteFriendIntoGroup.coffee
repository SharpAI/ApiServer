if Meteor.isClient
  users = new ReactiveVar([])
  Template.inviteFriendIntoGroup.rendered=->
    users.set([])
    groupid = Session.get('groupsId')
    if Session.get('groupsType') is 'group'
       Meteor.subscribe("get-group-user",groupid)
    else
       users.set([{'followerId':groupid}])
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
      if Session.get('groupsType') is 'group'
        SimpleChat.GroupUsers.findOne({group_id:Session.get('groupsId'),user_id:followerId})
      else
        if  Session.get('groupsId') is followerId
          return true
        else
          return false
  Template.inviteFriendIntoGroup.events
    'click .leftButton':(event)->
      Session.set("groupsProfileMenu","groupInformation")
    'click .rightButton':(event)->
      selected = users.get()
      if selected.length <= 0
        Session.set("groupsProfileMenu","groupInformation")
        return 
      if Session.get('groupsType') is 'group'
        Meteor.call 'add-group-urser', Session.get('groupsId'), _.pluck(selected, 'followerId'), (err, id)->
          console.log(err)
          if err or !id
            return PUB.toast('添加失败，请重试~')
          Session.set("groupsProfileMenu","groupInformation")
      else
        groupid = new Mongo.ObjectID()._str;
        Meteor.call 'create-group',groupid,null,_.pluck(selected, 'followerId'), (err, id)->
          console.log(err)
          if err or !id
            return PUB.toast('添加失败，请重试~')
          Meteor.subscribe('get-group',id,{
            onReady:()->
              group = SimpleChat.Groups.findOne({_id:id});
              msgObj =  {
                _id: new Mongo.ObjectID()._str,
                form: {
                  id: '',
                  name: '系统',
                  icon: ''
                },
                to: {
                  id: group._id,
                  name: group.name,
                  icon: group.icon
                },
                images: [],
                to_type: "group",
                type: "system",
                text: '欢迎加入'+group.name ,
                create_time: new Date(),
                is_read: false
              };
              sendMqttGroupMessage(group._id, msgObj);
            });
          Router.go('/simple-chat/to/group?id='+id)
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
