    #用户
    Template.follow_user.rendered=->
        Meteor.subscribe 'allUsers'
    Template.follow_user.helpers
        users: ->
            Meteor.users.find()
    Template.follow_user_list.helpers
        show_username: (user)->
            user.username
        is_undefined: (picture)->
            if picture == "" or picture == undefined
                true
            else
                false
