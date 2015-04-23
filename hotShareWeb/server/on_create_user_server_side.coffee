if Meteor.isServer
  Meteor.startup ()->
    seedrandom = Meteor.npmRequire('seedrandom')
    rng = seedrandom(new Date())
    name_numbers = RefNames.find({}).count()
    @getRandomAnonymousName = ()->
      try
        randomNumber = rng()
        skipNumber = parseInt(rng()*name_numbers)
        console.log 'Random Number. ' + randomNumber + 'Skip number ' + skipNumber
        anonymousName = RefNames.findOne({},{fields: {text:1},skip:skipNumber}).text;
        if anonymousName and anonymousName isnt ''
          console.log 'Got anonymouse name  ' + anonymousName
          return anonymousName
      catch
        return null
    Accounts.onCreateUser (options, user)->
      randomI = parseInt(Math.random()*33+1)
      if options.profile
        user.profile = options.profile
        if user.profile.anonymous is true
          user.profile.icon = 'http://data.tiegushi.com/anonymousIcon/anonymous_' + randomI + '.png'
          newName = getRandomAnonymousName()
          if newName and newName isnt ''
            user.profile.fullname = newName
        if user.profile.name
          user.profile.fullname = user.profile.name
      return user
