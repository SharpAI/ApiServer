
if Meteor.isClient
    window.socialGraphCollection = new Meteor.Collection()
    idleMessageInterval = null
    friendSocialGraphMessageInterval = null
    timeIn = Date.now()
    friendSocialGraphMessageIntervalSec = 15000
    idleMessageIntervalSec = 30000
    mystate = null
    onlineUsers = 0
    todisplayList=[]
    socialGraphMessageList=[]
    needToFethReadlist=false
    sendPersonalMessageToRoom = (message)->
        # 当可以在多个聊天室之间切换以后，ChatRoom　里面会包含所有访问过的聊天室信息
        #if ChatRoom.findOne()
        openedRoomId = Session.get('openedRoom')
        if ChatRoom.findOne({_id: openedRoomId})
            ChatMessage.insert {
                t: 'bot'
                msg: message
                #rid: ChatRoom.findOne()._id
                rid: openedRoomId
                ts: new Date()
                u: {
                    _id: '故事贴小秘'
                    username: 'GS'
                    name: '故事贴小秘'
                }
            }

    sendPersonalMessageWithURLToRoom = (message, url, title, description, mainImageUrl)->
        url = if url? then url else 'http://www.tiegushi.com/'
        alink = document.createElement 'a'
        alink.href = url

        msg = {
            t: 'bot'
            msg: if message? then message else ''
            #rid: ChatRoom.findOne()._id
            rid: Session.get('openedRoom')
            ts: new Date()
            u: {
                _id: 'group.cat'
                username: 'GS'
                name: '故事贴小秘'
            },
            urls : [ 
                {
                    "url" : url, #http://www.tiegushi.com/posts/NYtJcHfCKSE6GWhmj
                    "meta" : {
                        "ogSiteName" : "故事贴",
                        "ogTitle" : if title? then title else "", #千老这个称谓的来历
                        "ogUrl" :url, #http://www.tiegushi.com/posts/NYtJcHfCKSE6GWhmj
                        "ogImage" : if mainImageUrl? then mainImageUrl else "", #http://data.tiegushi.com/2Yfmd5PmEDsoECLvg_1459975484141_cdv_photo_001.jpg
                        "ogDescription" : if description? then description else "", #早点一咬牙一跺脚转CS，现在幸福日子望不到头呢！…
                        "ogType" : "article"
                    },
                    "headers" : {
                        "contentType" : "text/html; charset=utf-8"
                    },
                    "parsedUrl" : {
                        "host" : alink.host, #www.tiegushi.com
                        "pathname" : alink.pathname, #/posts/NYtJcHfCKSE6GWhmj
                        "protocol" : alink.protocol #http:
                    }
                }
            ]            
        } 

        ChatMessage.insert msg
    unless amplify.store('readListDisplayed')
        amplify.store('readListDisplayed',1)
    postOneViewedPost = ()->
        if onlineUsers>1
            return
        if todisplayList and todisplayList.length > 0
            data=todisplayList.pop()[1]
            console.log(data)
            sendPersonalMessageWithURLToRoom('朋友们可能还在看帖子，您可以回顾一下浏览过的故事贴:','http://cdn.tiegushi.com/posts/'+data.postId, data.name, data.addonTitle, data.mainImage)
            amplify.store('readListDisplayed',amplify.store('readListDisplayed')+1)
        else if needToFethReadlist
            fetchReadListFromServer()
    idleMessage = ()->
        console.log('idleMessage')
        if onlineUsers <= 1
            postOneViewedPost()
    startIdleMessage = ()->
        console.log('startIdleMessage')
        if !idleMessageInterval
            idleMessageInterval = setInterval(idleMessage,idleMessageIntervalSec)
    stopIdleMessage = ()->
        console.log('stopIdleMessage')
        if idleMessageInterval
            clearInterval(idleMessageInterval)
            idleMessageInterval = null
    restartIdleMessage = ()->
        console.log('restartIdleMessage')
        if !idleMessageInterval
            idleMessageInterval = setInterval(idleMessage,idleMessageIntervalSec)
        else
            stopIdleMessage()
            startIdleMessage()
    fetchReadListFromServer = ()->
        needToFethReadlist=false
        Meteor.call 'getMyState',amplify.store('hotshareUserID'),amplify.store('readListDisplayed'),amplify.store('readListDisplayed')+10,(err,list)->
            console.log('Got my list: '+list)
            if list and list.length > 0
                todisplayList = list
                setTimeout postOneViewedPost,2000
                needToFethReadlist=true
            else if amplify.store('readListDisplayed')>0
                amplify.store('readListDisplayed',0)
                #fetchReadListFromServer()

    friendSocialGraphMessage = ()->
        console.log('friendSocialGraphMessage')
        doc=socialGraphCollection.findOne({})
        unless doc
            return
        socialGraphCollection.remove({_id:doc._id})
        if doc.type is 'taRead'
            sendPersonalMessageWithURLToRoom(doc.taName+' 读过这篇故事，您还没读过',doc.link, doc.name, doc.desc, doc.image)
            #postOneViewedPost()
        else if doc.type is 'mutualRead'
            sendPersonalMessageWithURLToRoom(doc.taName+' 和 您 都读过这篇故事，是不是很有缘分，TA也在线哦（输入@可以看到在线好友）',doc.link, doc.name, doc.desc, doc.image)

    startFriendSocialGraphMessage = ()->
        console.log('startfriendSocialGraphMessage')
        if !friendSocialGraphMessageInterval
            friendSocialGraphMessageInterval = setInterval(friendSocialGraphMessage,friendSocialGraphMessageIntervalSec)
    stopFriendSocialGraphMessage = ()->
        console.log('stopfriendSocialGraphMessage')
        if friendSocialGraphMessageInterval
            clearInterval(friendSocialGraphMessageInterval)
            friendSocialGraphMessageInterval = null
    restartFriendSocialGraphMessage = ()->
        console.log('restartfriendSocialGraphMessage')
        if !friendSocialGraphMessageInterval
            friendSocialGraphMessageInterval = setInterval(friendSocialGraphMessage,friendSocialGraphMessageIntervalSec)
        else
            stopFriendSocialGraphMessage()
            startFriendSocialGraphMessage()
    processFriendSocialGraph = (socialGraph)->
        currentRoomPostId = FlowRouter.current().params.name
        console.log(socialGraph)
        taName = socialGraph.taName
        if socialGraph.mutualPosts? and socialGraph.mutualPosts.length > 0
            socialGraph.mutualPosts.forEach (key, num)->
                # add mutual post into collection
                #console.log(key)
                #两个人都读过的文章是可以重复的
                unless currentRoomPostId is key.postId or socialGraphCollection.findOne({postId:key.postId, taName: taName, type:'mutualRead'})
                    socialGraphCollection.insert({
                        type:'mutualRead',
                        taName:taName,
                        link:'http://cdn.tiegushi.com/posts/'+key.postId,
                        name:key.name,
                        desc:key.addonTitle,
                        image:key.mainImage
                    })
        if socialGraph.taRead? and socialGraph.taRead.length > 0
            socialGraph.taRead.forEach (key,num)->
                #console.log(key)
                unless socialGraphCollection.findOne({postId:key.postId})
                    socialGraphCollection.insert({
                        postId:key.postId,
                        type:'taRead',
                        taName:taName,
                        link:'http://cdn.tiegushi.com/posts/'+key.postId,
                        name:key.name,
                        desc:key.addonTitle,
                        image:key.mainImage
                    })
    Meteor.startup ->
        Tracker.autorun (t)->
            # 当可以在多个聊天室之间切换以后，此处需要响应是重新计算数据，由于FlowRouter不支持响应式，所以使用Session
            currentRoomId = Session.get('openedRoom')
            if ChatRoom.findOne({_id: currentRoomId})
                # 此处的 stop 后面需要去掉以保持响应式计算，但是需要处理下，已经访问过的聊天室再次切换回去的时候，就不要再计算了
                t.stop()
                Meteor.call 'getPostInfo',ChatRoom.findOne({_id: currentRoomId}).name,(err,data)->
                    if !err and data
                        ###
                        _id:"27ZRmEeXwkoFi6BZC"
                        createdAt:Thu May 28 2015 17:26:48 GMT-0700 (PDT)
                        mainImage:"http://data.tiegushi.com/yDDXttJznF72aR9kL_1432858306301_cdv_photo_002.jpg"
                        ownerName:"微尘"
                        ###
                        console.log data
                        document.title = data.title + '－专属聊天室'
                        window.trackPage(window.location.href,data.title)
                        sendPersonalMessageWithURLToRoom('欢迎来到本贴的专属聊天室，您可以点右上角转发链接到微信朋友圈，让更多的朋友加入聊天室参与匿名聊天。\r\n点击链接可以查看原文:',
                          'http://cdn.tiegushi.com/posts/'+data._id, data.title, data.addonTitle, data.mainImage)
        Tracker.autorun (t)->
            if Meteor.user() and amplify.store('hotshareUserID')
                t.stop()
                fetchReadListFromServer()
                console.log('HotShare ID is '+amplify.store('hotshareUserID'))
        Tracker.autorun ()->
            if onlineUsers > 1
                return
            if MsgTyping.selfTyping.get()
                console.log('Need stop interval since typing')
                stopIdleMessage()
            else
                console.log('not typing now')
                restartIdleMessage()
        Tracker.autorun ()->
            if onlineUsers > 1
                return
            if ChatMessage.findOne({t:{$ne:'bot'}},{sort:{ts:-1}},{fields:{ts:1}})
                console.log('New message arrived')
                restartIdleMessage()
        Tracker.autorun ()->
            if onlineUsers != (_.size(RoomManager.onlineUsers.get())-1)
                onlineUsers = (_.size(RoomManager.onlineUsers.get())-1)
                console.log('Online member: '+onlineUsers)
                if onlineUsers > 1
                    stopIdleMessage()
                    restartFriendSocialGraphMessage()
                    console.log('need get the user')
                    userArray=_.filter(RoomManager.onlineUsers.get(), (obj, key)->
                        unless obj._id
                            return false
                        if obj._id is 'group.cat'
                            return false
                        if obj._id is Meteor.userId()
                            return false
                        if Session.get('user_record_'+obj._id)
                            return false
                        Session.set('user_record_'+obj._id,true)
                        Meteor.call 'calcRelationship',obj._id,(err,result)->
                            processFriendSocialGraph(result)
                            setTimeout friendSocialGraphMessage,2000
                        #sendPersonalMessageToRoom('您的朋友 '+result.taName+' 正在聊天，你们初次相逢，他推荐您看这个帖子：')
                        return true
                    )
                else
                    restartIdleMessage()
                    stopFriendSocialGraphMessage()
