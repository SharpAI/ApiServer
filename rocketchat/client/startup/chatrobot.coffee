Meteor.startup ->
    timeIn = Date.now()

    setInterval ()->
        duration = parseInt((Date.now() - timeIn)/1000)
        ChatMessage.insert {
            t: 'bot'
            msg: '您已经进入房间 ' + duration + ' 秒'
            rid: 'GENERAL'
            ts: new Date()
            u: {
                _id: 'group.cat'
                username: 'group.cat'
                name: 'Group.Cat'
            }
        }
    , 10000