postPageArr = []
pages = ['/user', '/bell', '/search']

#公共函数
@PUB =
    'showWaitLoading':(text)->
        this.hideWaitLoading()
        text = text || '加载中...'
        $('body').append('<div class="actionWaitLoading"><div class="loadingContainer"><img src="/loading.gif" width="28" height="28"/><p>'+text+'</p></div></div>')
    'hideWaitLoading':()->
        $('.actionWaitLoading').remove()
    'Toptip': (text, options, callback)->
        if !text
            return
        if Session.equals('can_show_toptip', false)
            return

        this.hideTopTip()
        config = _.extend({
            timeout: 5000,
            autohide: true
        }, options)

        $("tool_tp").remove()

        div = document.createElement('div')
        div.classList += '_top_tip'
        div.innerHTML = text

        window.ToptipTimeout = null
        if window.ToptipTimeout
            Meteor.clearTimeout(window.ToptipTimeout)
        if config.autohide
            window.ToptipTimeout = Meteor.setTimeout(->
                PUB.hideTopTip()
            ,config.timeout)

        div.addEventListener('click', (e)->
            PUB.hideTopTip()
            callback and callback(e, options)
        )
        $('body').append(div)
    'hideTopTip':->
        $('._top_tip').remove()
        if window.ToptipTimeout
            Meteor.clearTimeout(window.ToptipTimeout)
    'isUrl':(str_url)->
        `
        var strRegex = '^((https|http|ftp|rtsp|mms)?://)'
              + '?(([0-9a-zA-Z_!~*\'().&=+$%-]+: )?[0-9a-zA-Z_!~*\'().&=+$%-]+@)?'
              + '(([0-9]{1,3}.){3}[0-9]{1,3}'
              + '|'
              + '([0-9a-zA-Z_!~*\'()-]+.)*'
              + '([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z].'
              + '[a-zA-Z]{2,6})'
              + '(:[0-9]{1,4})?'
              + '((/?)|'
              + '(/[0-9a-zA-Z_!~*\'().;?:@&=+$,%#-]+)+/?)$';
        `
        re=new RegExp(strRegex)
        if re.test(str_url)
            return true
        else
            return false
    # 该方法实现页面切换
    'page':(pageName)->
        if Session.get('persistentLoginStatus') and !Meteor.userId() and !Meteor.loggingIn() and pages.indexOf(pageName) isnt -1
            window.plugins.toast.showLongCenter("登录超时，需要重新登录~");
            return Router.go('/')

        history = Session.get("history_view")
        view = Session.get("channel")
        if history is null or history is undefined or history is ""
            history = new Array()
        #footerPages = ['/home', '/search', '/addPost', '/bell', '/user']
        footerPages = ['home', 'timeline', 'message', 'user']
        #if current view is one of footer pages, and record the position of these pages
        for page in footerPages
            if view is page
                Session.set 'document_body_scrollTop_'+view, $('.content').scrollTop()
                break
        #if pageName is one of footer pages, we will clear history and need to return back to the last position
        Session.set 'document_body_scrollTop', 0
        if pageName is '/'
            tmpPageName = 'home'
        else if pageName is '/add'
            tmpPageName = 'addPost'
        else
            tmpPageName = pageName.substr(1)
        if Session.get("postContent")
            currentPostView='posts/'+Session.get("postContent")._id
        else
            currentPostView=''
        for page in footerPages
            if tmpPageName is page and view isnt currentPostView
                history = []
                value = Session.get 'document_body_scrollTop_'+page
                if value is undefined
                    value = 0
                Session.set 'document_body_scrollTop', value
                break
        unless view is undefined or view is ""
            scroll_top = document.body.scrollTop
            if _.contains(footerPages,view)
                scroll_top = $('.content').scrollTop()
            if history.length > 0 and view is history[history.length-1].view
                history[history.length-1].scrollTop = scroll_top
            else
                history.push {
                    view: view
                    scrollTop: scroll_top
                }
            Session.set "history_view", history
        #if Session.get('view') isnt 'partner_detail' and Session.get('view') isnt 'add_partner'
        #    Session.set 'referrer',Session.get('view')
#        Meteor.setTimeout ->
#            document.body.scrollTop = 0
#            350
#        Session.set 'view',pageName
        for tmpPage in history
            console.log "Frank.PUB: page, tmpPage = "+JSON.stringify(tmpPage)
        console.log "pageName is :"+pageName
        if pageName is '/bell'
            Session.set('canClearUnreadMessage',true)
        else
            if Session.equals('canClearUnreadMessage',true)
                Session.set('canClearUnreadMessage',false)
                Session.set('updataFeedsWithMe',true)
                Meteor.call 'updataFeedsWithMe', Meteor.userId()
        Router.go(pageName)
        return
    # 返回上一页
    'back':->
        try
          if typeof PopUpBox isnt "undefined"
            PopUpBox.close()
            # $('.popUpBox, .b-modal').hide()
        catch error
          console.log error
        history = Session.get("history_view")
        unless history is null or history is undefined or history is ""
            for tmpPage in history
                console.log "Frank.PUB: back, tmpPage = "+JSON.stringify(tmpPage)
            if history.length > 0
                page =  history.pop()
                if Session.get("postContent")
                    currentPostView='posts/'+Session.get("postContent")._id
                else
                    currentPostView=''
                if page.view is currentPostView and history.length >0
                    unless page.parent and page.parent is 'postItem'
                        page = history.pop()
                Session.set "document_body_scrollTop", page.scrollTop
                Session.set "history_view", history
                #Session.set "view", page.view
                if page.view is 'addPost'
                    Router.go('/add')
                else if page.view is 'home'
                    Router.go('/')
                else if page.view is 'message' and Session.get('_timelineAlbumFromGroupId')
                    Router.go('/simple-chat/to/group?id=' + Session.get('_timelineAlbumFromGroupId'))
                    Session.set('_timelineAlbumFromGroupId', '')
                else
                    Router.go('/'+page.view)
            else
                Router.go('/')
        else
          Router.go('/')
        #nowPage = Session.get('view')
        #Session.set 'view',Session.get('referrer')
        #if nowPage isnt 'partner_detail' and nowPage isnt 'add_partner'
        #    Session.set 'referrer',nowPage
        return
    'pagepop':->
        history = Session.get("history_view")
        unless history is undefined or history is ""
            if history.length > 0
                page =  history.pop()
                Session.set "history_view", history
    'toast':(msg)->
        try
            window.plugins.toast.showLongBottom(msg)
        catch error
            alert msg
    "alert":(msg, callback)->
        try
            navigator.notification.alert(
                msg
                callback
                '提示'
                '确定'
            )
        catch error
            alert(msg)
            callback
    "confirm":(msg, callback)->
        try
            navigator.notification.confirm(
                msg
                (index)->
                    if index is 2
                       callback()
                '提示'
                ['取消','确定']
            )
        catch error
            if confirm(msg)
                callback()

#       可以浏览图片，放大，缩小，下一张
#        items 格式
#        items = [
#            {src: '/home/111.jpg',w: 300,h: 350},
#            {src: '/home/112.jpg',w: 300,h: 450}
#          ]
#    "photos":(items)->
#        window.openPhotoSwipe(items)
      "postPage":(postID,scrollTop)->
          Session.set("postPageScrollTop", 0)
          postIdJson = {
            postId: postID,
            scrollTop: scrollTop
          }
          postPageArr.push(postIdJson)
      "postPageBack":->
          if postPageArr.length is 0
            $(window).children().off()
            $(window).unbind('scroll')
            $('.showPosts').addClass('animated ' + animateOutUpperEffect)
            $('.showPostsFooter').addClass('animated ' + animateOutUpperEffect)
            setTimeout ()->
              PUB.back()
              if Session.get("Social.LevelOne.Menu") is 'userProfile'
                Session.set("Social.LevelOne.Menu",'contactsList')
                return
            ,animatePageTrasitionTimeout
          else
            post = postPageArr.pop()
            postId = post.postId
            if post.scrollTop is undefined
              postPageScrollTop = 0
            else
              postPageScrollTop = post.scrollTop
            Session.set("postPageScrollTop", postPageScrollTop)
            Router.go '/posts/'+postId
      "actionSheet": (menuArray, title, callback)->
          if Meteor.isCordova
            if title
              options = {
                  'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                  'title': title,
                  'buttonLabels': menuArray,
                  'androidEnableCancelButton' : true,
                  'winphoneEnableCancelButton' : true,
                  'addCancelButtonWithLabel': '取消',
                  'position': [20, 40]
              }
            else
              options = {
                  'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                  'buttonLabels': menuArray,
                  'androidEnableCancelButton' : true,
                  'winphoneEnableCancelButton' : true,
                  'addCancelButtonWithLabel': '取消',
                  'position': [20, 40]
              }
            window.plugins.actionsheet.show(options,callback)
