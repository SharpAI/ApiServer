
if Meteor.isClient
    Session.setDefault('visitedRooms', []);
    window.socialGraphCollection = new Meteor.Collection(null)
    idleMessageInterval = null
    timeIn = Date.now()
    idleMessageIntervalSec = Meteor.settings.public.MESSAGE_PUSH_TIME or 20000
    mystate = null
    onlineUsers = 0
    todisplayList=[]
    todisplayListIds = []
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
    sendPersonalMessageWithURLSToRoom = (message, urls)->
        new_urls = []
        _.map urls, (item)->
            url = if item.url? then item.url else 'http://www.tiegushi.com/'
            alink = document.createElement 'a'
            alink.href = url
            
            new_urls.push {
                "url" : url, #http://www.tiegushi.com/posts/NYtJcHfCKSE6GWhmj
                "meta" : {
                    "ogSiteName" : "故事贴",
                    "ogTitle" : if item.title? then item.title else "", #千老这个称谓的来历
                    "ogUrl" :url, #http://www.tiegushi.com/posts/NYtJcHfCKSE6GWhmj
                    "ogImage" : if item.mainImageUrl? then item.mainImageUrl else "", #http://data.tiegushi.com/2Yfmd5PmEDsoECLvg_1459975484141_cdv_photo_001.jpg
                    "ogDescription" : if item.description? then item.description else "", #早点一咬牙一跺脚转CS，现在幸福日子望不到头呢！…
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
            urls : new_urls         
        } 

        ChatMessage.insert msg
    unless amplify.store('readListDisplayed')
        amplify.store('readListDisplayed',1)
    postOneViewedPost = ()->
        while !data and todisplayList and todisplayList.length > 0
             data = todisplayList.pop()[1]
             if !~todisplayListIds.indexOf(data.postId)
                 todisplayListIds.push(data.postId)
             else
                console.log('repeat post: ', data.name)
                data = null
             amplify.store('readListDisplayed',amplify.store('readListDisplayed')+1)


        #if todisplayList and todisplayList.length > 0
        if data
            #data=todisplayList.pop()[1]
            console.log(data)

            Session.set('showReadList',Session.get('showReadList')+1)
            sendPersonalMessageWithURLToRoom('朋友们可能还在看帖子，您可以回顾一下浏览过的故事贴('+Session.get('showReadList')+'/'+Session.get('gotReadList')+'):','http://cdn.tiegushi.com/posts/'+data.postId, data.name, data.addontitle, data.mainImage)
            #amplify.store('readListDisplayed',amplify.store('readListDisplayed')+1)
        else if needToFethReadlist
            fetchReadListFromServer()
    idleMessage = ()->
        console.log('idleMessage')
        #if onlineUsers <= 1 or socialGraphCollection.find().count() is 0
        if friendSocialGraphMessage() is true
            return
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
        Meteor.call 'getMyState',amplify.store('hotshareUserID'),amplify.store('readListDisplayed'),5,(err,list)->
            console.log('Got my list: '+list)
            if list and list.length > 0
                todisplayList = list
                Session.set('gotReadList',list.length)
                Session.set('showReadList',0)
                setTimeout postOneViewedPost,2000
                needToFethReadlist=true
            else if amplify.store('readListDisplayed')>0
                amplify.store('readListDisplayed',0)
                #fetchReadListFromServer()

    friendSocialGraphMessage = ()->
        console.log('friendSocialGraphMessage')
        doc=socialGraphCollection.findOne({})
        unless doc
            return false
        socialGraphCollection.remove({_id:doc._id})

        Session.set('ViewedSocialMessageTotal',Session.get('ViewedSocialMessageTotal')+1)
        if doc.type is 'taRead'
            sendPersonalMessageWithURLToRoom(doc.taName+' 读过这篇故事，您还没读过 ('+Session.get('ViewedSocialMessageTotal')+'/'+Session.get('SocialMessageTotal')+')',doc.link, doc.name, doc.desc, doc.image)
            return true
        else if doc.type is 'mutualRead'
            #现在TA也在线不准，修好了之后再说吧
            #sendPersonalMessageWithURLToRoom(doc.taName+' 和 您 都读过这篇故事，是不是很有缘分，TA也在线哦（输入@可以看到在线好友'+Session.get('ViewedSocialMessageTotal')+'/'+Session.get('SocialMessageTotal')+'）',doc.link, doc.name, doc.desc, doc.image)
            sendPersonalMessageWithURLToRoom(doc.taName+' 和 您 都读过这篇故事，是不是很有缘分（'+Session.get('ViewedSocialMessageTotal')+'/'+Session.get('SocialMessageTotal')+'）',doc.link, doc.name, doc.desc, doc.image)
            return true
        return false

    processFriendSocialGraph = (socialGraph)->
        # 如果在线用户没有对应的故事贴关联信息，这边会报 TypeError: Cannot read property 'taName' of undefined
        if !socialGraph?
            return
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
        Session.set('SocialMessageTotal',socialGraphCollection.find().count())
        Session.set('ViewedSocialMessageTotal',0)

    sendPostStatToOwner = (postId) ->
        Meteor.call 'getPostStat', postId, (err, stat) ->
            if !err and stat
                if stat.browses?
                    sendPersonalMessageToRoom('您的这个故事帖已经被' + stat.browses + '人读过')
                if stat.posts? and stat.totalbrowses?
                    sendPersonalMessageToRoom('您一共创作、发表了' + stat.posts + '篇故事贴, 总共有' + stat.totalbrowses + '人读过您的帖子')
                if stat.locations? and stat.locations.length > 0
                    sendPersonalMessageToRoom('他们大多来自于 ' + stat.locations.jion(', '))

    Meteor.startup ->
        Tracker.autorun (t)->
            # 当可以在多个聊天室之间切换以后，此处需要响应是重新计算数据，由于FlowRouter不支持响应式，所以使用Session
            currentRoomId = Session.get('openedRoom')
            visitedRooms = Session.get('visitedRooms')
            if ChatRoom.findOne({_id: currentRoomId}) and !~visitedRooms.indexOf(currentRoomId)
                visitedRooms.push(currentRoomId)
                Session.set('visitedRooms', visitedRooms)
                # 此处的 stop 后面需要去掉以保持响应式计算，但是需要处理下，已经访问过的聊天室再次切换回去的时候，就不要再计算了
                #t.stop()
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

                        # begin - 尝试解决document.title 在 ios 下不生效的bug
                        iframe = document.createElement('iframe')
                        iframe.setAttribute('src', '/favicon.ico')
                        iframe.setAttribute('height', '0')
                        iframe.setAttribute('width', '0')

                        iframe.addEventListener('load', cb=() ->
                            setTimeout(()->
                                iframe.removeEventListener('load', cb);
                                document.body.removeChild(iframe);                                
                            , 0);
                        );
                        
                        document.body.appendChild(iframe)
                        # end - 尝试解决document.title 在 ios 下不生效的bug

                        window.trackPage(window.location.href,data.title)
                        sendPersonalMessageWithURLToRoom('欢迎来到本贴的专属聊天室，您可以点右上角转发链接到微信朋友圈，让更多的朋友加入聊天室参与匿名聊天。\r\n点击链接可以查看原文:',
                          'http://cdn.tiegushi.com/posts/'+data._id, data.title, data.addontitle, data.mainImage)
                        if Meteor.user() and amplify.store('hotshareUserID') and data.owner is amplify.store('hotshareUserID')
                            sendPostStatToOwner(data._id)
        Tracker.autorun (t)->
            if Meteor.user() and amplify.store('hotshareUserID')
                t.stop()
                fetchReadListFromServer()
                console.log('HotShare ID is '+amplify.store('hotshareUserID'))
        Tracker.autorun ()->
            if MsgTyping.selfTyping.get()
                console.log('Need stop interval since typing')
                stopIdleMessage()
            else
                console.log('not typing now')
                restartIdleMessage()
        Tracker.autorun ()->
            if ChatMessage.findOne({t:{$ne:'bot'}},{sort:{ts:-1}},{fields:{ts:1}})
                console.log('New message arrived')
                restartIdleMessage()
        Tracker.autorun ()->
            if onlineUsers != (_.size(RoomManager.onlineUsers.get())-1)
                onlineUsers = (_.size(RoomManager.onlineUsers.get())-1)
                console.log('Online member: '+onlineUsers)
                if onlineUsers > 1
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
                            if result and result.length > 0
                                processFriendSocialGraph(result)
                                setTimeout friendSocialGraphMessage,1000
                            #sendPersonalMessageToRoom('您的朋友 '+result.taName+' 正在聊天，你们初次相逢，他推荐您看这个帖子：')
                        return true
                    )
                    
        # 故事贴推荐贴子的推送
        Tracker.autorun ()->
            
            if Meteor.userId() and Session.get('openedRoom')
                Meteor.call 'getFeedsByLogin', (err, res)->
                    if err
                        return
                    urls = []
                    _.map res, (item)->
                        urls.push {
                            url: 'http://cdn.tiegushi.com/posts/' + item.postId
                            title: item.postTitle
                            description: '作者：' + item.ownerName
                            mainImageUrl: item.mainImage
                        }
                    if urls.length > 0
                        sendPersonalMessageWithURLSToRoom '新故事推荐：', urls