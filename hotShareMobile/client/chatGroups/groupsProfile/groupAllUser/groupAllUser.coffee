if Meteor.isClient
  Template.groupAllUser.rendered=->
    Session.set('isSearching', false)
    groupid = Session.get('groupsId')
    Meteor.subscribe("get-group-user",groupid)
    # $('#search-box').bind('propertychange input',(e)->
    #    text = $(e.target).val().trim()
    #    if text.length > 0
    #      Session.set 'isSearching', true
    #      Session.set 'noSearchResult',false
    #      Session.set 'searchLoading', true
    #    else
    #      Session.set 'isSearching', false
    #      return
    #    GroupUsersSearch.search text
    # )
  Template.groupAllUser.helpers
    userCount:->
      Counts.get('groupsUserCountBy-'+Session.get('groupsId'))
    isMobile:()->
      Meteor.isCordova
    isSearching:->
      if Session.get('isSearching') is false
         false
      else
         true
    noSearchResult:->
      return Session.get("noSearchResult")
    searchLoading:->
       return Session.get('searchLoading')
    groupUsers:()->
      return SimpleChat.GroupUsers.find({group_id:Session.get('groupsId')},{sort: {createdAt: 1}})
    userIsGroupCreator:()->
      group = SimpleChat.Groups.findOne({_id: Session.get('groupsId')})
      if group and group.creator and group.creator.id is this.user_id
        return true
      return false
    # getGroupsUsers:()->
    #     groupUsersSearchData = GroupUsersSearch.getData(
    #       transform: (matchText, regExp) ->
    #         #return matchText.replace(regExp, "<b>$&</b>")
    #         matchText
    #       sort: createdAt: -1)
    #     if GroupUsersSearch.getStatus().loaded == true
    #       if groupUsersSearchData.length == 0
    #         Meteor.setTimeout (->
    #           Session.set 'noSearchResult', true
    #           Session.set 'searchLoading', false
    #           return
    #         ), 500
    #       else
    #         Session.set 'noSearchResult', false
    #         Session.set 'searchLoading', false
    #     return groupUsersSearchData
  Template.groupAllUser.events
    'click #groupAllUserPageback':(event)->
      Session.set("groupsProfileMenu","groupInformation")
    'click #addUserInGroup':(event)->
      Session.set("groupsProfileMenu","inviteFriendIntoGroup")
    'click .userItem': (event)->
      #Session.set("groupsProfileMenu","setGroupname")
      console.log event.currentTarget.id
      PUB.page('/simpleUserProfile/'+event.currentTarget.id);
