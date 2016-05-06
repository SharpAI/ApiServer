Meteor.startup ->
    timeIn = Date.now()

    setInterval ()->
        duration = parseInt((Date.now() - timeIn)/1000)
        ChatMessage.insert {
            t: 'bot'
            msg: '您已经进入房间 ' + duration + ' 秒'
            rid: ChatRoom.findOne()._id
            ts: new Date()
            u: {
                _id: 'group.cat'
                username: 'GS'
                name: '故事贴小秘'
            }
        }
    , 10000