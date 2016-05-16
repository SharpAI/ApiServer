@getAvatarUrlFromUsername = (username) ->
             user = RocketChat.models.Users.findOne({username: username})
             if user? and user.avatarUrl?
                          return user.avatarUrl
             key = "avatar_random_#{username}"
             random = Session?.keys[key] or 0
             if not username?
                          return
             if Meteor.isCordova
                          path = Meteor.absoluteUrl().replace /\/$/, ''
             else
                          path = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';
             "#{path}/avatar/#{encodeURIComponent(username)}.jpg?_dc=#{random}"
