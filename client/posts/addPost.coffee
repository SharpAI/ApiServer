if Meteor.isClient
  # the only document I found here https://github.com/percolatestudio/transition-helper/blob/master/transition-helper.js#L4

  Template.addPost.rendered=->
    $('.addPost').css('min-height',$(window).height())

    console.log 'addPost rendered rev=37'
    #testMenu will be main/font/align. It's for controlling the icon on text menu
    Session.set('textMenu','main')
    #init
    this.find('.content')._uihooks = {
      insertElement: (node, next)->
        $(node)
          .insertBefore(next)
        ###
        Don't add toolbar on mainImage for now.
        MainImage need replace, we can do it later.
        $('.mainImage').toolbar
          content: '#image-toolbar-options'
          position: 'bottom'
          hideOnClick: true
        ###
    }

    toolbarHiddenHandle = (event,node)->
      if Session.get('textMenu') isnt 'main'
        setTimeout ()->
            Session.set 'textMenu','main'
            $(node).data('toolbarObj').options.content= '#text-toolbar-options'
            $(node).data('toolbarObj').reInitializeToolbar()
          ,500
    toolbarMainMenuClickHandle = (event, buttonClicked,node,grid)->
      $(node).data('toolbarObj').hide()
      textdiv = $(event.target).children('.textdiv')
      textarea = textdiv.children('textarea')
      doc_id =  $(textarea).attr("text")
      if buttonClicked.id == "modify"
        $(textarea).attr('disabled',false)
        $(textarea).off('focus')
        $(textarea).off('focusout')
        $(textarea).off('blur')

        $(textarea).focus(()->
          console.log("focus get")
        )
        $(textarea).on('blur', 'input, textarea', ()->
          setTimeout(()->
            window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
          , 0)
        )
        $(textarea).focus()

        $(textarea).focusout(()->
          console.log("focusout")
          $(this).attr("disabled", "true")

        )

      else if buttonClicked.id == "del"
        console.log("del "+ node.id)
        if gridster?
          gridster.remove_widget2(node, false)
        Drafts.remove node.id
      else if buttonClicked.id is "font"
        setTimeout ()->
            Session.set 'textMenu','font'
            $(node).data('toolbarObj').options.content= '#text-font-toolbar-options'
            $(node).data('toolbarObj').reInitializeToolbar()
            $(node).data('toolbarObj').show()
          ,500
      else if buttonClicked.id is "align"
        setTimeout ()->
            Session.set 'textMenu','align'
            $(node).data('toolbarObj').options.content= '#text-align-toolbar-options'
            $(node).data('toolbarObj').reInitializeToolbar()
            $(node).data('toolbarObj').show()
          ,500
      else if buttonClicked.id is "aligntoleft"
        console.log 'Need aligntoleft'
        style = "font-family:" + textarea.css("font-family") + ';font-size:' + textarea.css("font-size") + ';text-align:left;'
        Drafts.update({_id: doc_id}, {$set: {style: style}});
      else if buttonClicked.id is "aligntocenter"
        console.log 'Need aligntocenter'
        style = "font-family:" + textarea.css("font-family") + ';font-size:' + textarea.css("font-size") + ';text-align:center;'
        Drafts.update({_id: doc_id}, {$set: {style: style}});
      else if buttonClicked.id is "aligntoright"
        console.log 'Need aligntoright'
        style = "font-family:" + textarea.css("font-family") + ';font-size:' + textarea.css("font-size") + ';text-align:right;'
        Drafts.update({_id: doc_id}, {$set: {style: style}});
      else if buttonClicked.id is "font-normal"
        console.log 'Need font-normal'
        style = 'font-family:;font-size:large' + ';text-align:' + textarea.css('text-align')+';'
        Drafts.update({_id: doc_id}, {$set: {style: style}});
      else if buttonClicked.id is "font-quato"
        console.log 'Need font-quato'
        style = "font-family:Times New Roman, Times, serif" + ';font-size:xx-large' + ';text-align:' + textarea.css('text-align')+';'
        Drafts.update({_id: doc_id}, {$set: {style: style}});
      return

    initToolBar = (node, grid)->
      #console.log 'Added node id is ' + node.id
      type = node.$blaze_range.view.parentView.dataVar.curValue.type
      if type == "text"
          if grid != undefined
            max_row = 1
            $('.resortitem:near-viewport(-150)').each( ( i, itemElem )->
              if i == 0
                max_row = parseInt($(itemElem).attr("data-row"))
              cur_row = parseInt($(itemElem).attr("data-row"))
              console.log("near-viewport id:"+ itemElem.id + " data-row:"+ cur_row)

              if max_row < cur_row
                max_row = cur_row
            )
            console.log("max_row " + max_row)
            grid.add_widget(node, 6, 1, 1, max_row)
            #grid.manage_movements($(node), 1, max_row)
            #gridster.mutate_widget_in_gridmap($(node), { col: 1, row: parseInt($(node).attr("data-row")), size_x: 6, size_y: 1 }, { col: 1, row: max_row, size_x: 6, size_y: 1 })
          $(node).toolbar
            content: '#text-toolbar-options'
            position: 'top'
            hideOnClick: true
          $(node)
            .on 'toolbarItemClick', (event, buttonClicked)=>
              #console.log("toolbarItemClick on " + buttonClicked.id)
              toolbarMainMenuClickHandle(event, buttonClicked,node,grid)
            .on 'toolbarHidden', (event)=>
              console.log("toolbarHidden")
              toolbarHiddenHandle(event,node)


          $('#'+node.id+'TextArea').bind('propertychange input',(e)->
            e.preventDefault()
            id = this.id.replace("TextArea", "")
            sizey = Math.round this.scrollHeight/40
            if gridster?
              resizeItem = $('#'+id)
              resizeItem.css("height", this.scrollHeight)
              sizex = parseInt(resizeItem.attr("data-sizex"))
              gridster.resize_widget(resizeItem, sizex,sizey)
              #console.log('propertychange sizey:'+ sizey + ' scrollHeight:'+this.scrollHeight)
          )

      else if type == "image"
          if grid != undefined
            if Session.get('NewImgAdd') is 'true'
              grid.add_widget(node, 3, 3)
            else
              max_row = 1
              $('.resortitem:near-viewport(-150)').each( ( i, itemElem )->
                if i == 0
                  max_row = parseInt($(itemElem).attr("data-row"))
                cur_row = parseInt($(itemElem).attr("data-row"))
                console.log("near-viewport id:"+ itemElem.id + " data-row:"+ cur_row)

                if max_row < cur_row
                  max_row = cur_row
              )
              console.log("max_row " + max_row)
              size_y = size_x = Math.floor((Math.random() * 3) + 1);
              col = Math.floor((Math.random() * 6) + 1)
              grid.add_widget(node, 3, 3, col, max_row)

          $(node).toolbar
            content: '#image-toolbar-options'
            position: 'top'
            hideOnClick: true
          $(node).on 'toolbarItemClick',(event,buttonClicked)=>
            console.log $(buttonClicked).attr('id') + ' event on nodeid ' + node.id
            if buttonClicked.id == "del"
              console.log("del "+ node.id)

              if gridster?
                gridster.remove_widget2(node, false)
              Drafts.remove node.id

            ###
            else if buttonClicked.id == "crop"

             imgWidth = $(node).width()
             imgHeight = $(node).height()
             $('#'+node.id+'Img').cropbox({
               width: imgWidth,
               height: imgHeight
             }).on('cropbox', (e, data)->
               console.log('crop window: ' + data)
             )
            ###
            return
      return


    this.find('#display')._uihooks = {
      insertElement: (node, next)->
        #console.log('Inserted node id is ' + node.id);
        $(node).insertBefore(next)

        Deps.afterFlush =>
          initToolBar(node, gridster)
    }

    $("#display").find('.resortitem').each( ( i, itemElem )->
      initToolBar(itemElem, undefined)
    )

    base_size=($( window ).width()/6 - 10);
    test = $("#display");
    `gridster = test.gridster({serialize_params: function ($w, wgd) {
      return {
        id: wgd.el[0].id,
        col: wgd.col,
        row: wgd.row,
        size_x: wgd.size_x,
        size_y: wgd.size_y
      };
    }, widget_base_dimensions: [base_size, base_size],widget_margins: [5, 5], min_cols: 3, max_cols:6, resize: {enabled: true}}).data('gridster');`
    #Set is isReviewMode
    console.log "rendered isReviewMode="+Session.get('isReviewMode')
    if Session.get('isReviewMode') is '1'
        if gridster?
          console.log "rendered: gridster.disable 2"
          gridster.disable()
          gridster.disable_resize()
        $("#title").attr("disabled", "disabled")
        $("#addontitle").attr("disabled", "disabled")
        `global_toolbar_hidden = true`
    else if Session.get('isReviewMode') is '2' or Session.get('isReviewMode') is '0'
        console.log "rendered: gridster.enable "
        if gridster?
          gridster.enable()
          #gridster.enable_resize()
        $("#title").attr("disabled", false)
        $("#addontitle").attr('disabled',false)
        `global_toolbar_hidden = false`
    return

  Template.addPost.helpers
    showPostFooter:->
      if Session.get('isReviewMode') is '2' or Session.get('isReviewMode') is '0'
        true
      else
        false
    isReviewMode:(value)->
      console.log "value is "+value + ", isReviewMode = "+Session.get('isReviewMode')
      if Session.get('isReviewMode') is value
        if Session.get('isReviewMode') is '1'
            if gridster?
              console.log "gridster.disable 2"
              gridster.disable()
              gridster.disable_resize()
            $("#title").attr("disabled", "disabled")
            $("#addontitle").attr("disabled", "disabled")
            `global_toolbar_hidden = true`
            true
        else if Session.get('isReviewMode') is '2' or Session.get('isReviewMode') is '0'
            console.log "gridster.enable "
            if gridster?
              gridster.enable()
              gridster.enable_resize()
            $("#title").attr("disabled", false)
            $("#addontitle").attr('disabled',false)
            `global_toolbar_hidden = false`
            true
      else
        false
    draftTitles:->
      if Drafts.find().count() > 0
        draftData = Drafts.find().fetch()
        draftId = draftData[0]._id;
        if Session.get('isReviewMode') is '2'
          Posts.find({_id:draftId}).fetch()[0]
        else if Session.get('isReviewMode') is '1' or Session.get('isReviewMode') is '0'
          SavedDrafts.find({_id:draftId}).fetch()[0]
    mainImage:->
#      Meteor.setTimeout ->
#        $('.mainImage').css('height',$(window).height()*0.55)
#        0
      if Drafts.find({type:'image'}).count() > 0
        Drafts.find({type:'image'}).fetch()[0]
      else
        null

    pub:()->
      if Drafts.find().count() > 1
        for i in [1..(Drafts.find({}, {sort: {data_row:1}}).count()-1)]
          Drafts.find({}, {sort: {data_row:1}}).fetch()[i]

    items:()->
      if Drafts.find({type:'image'}).count() > 1
        for i in [1..(Drafts.find({type:'image'}).count()-1)]
          Drafts.find({type:'image'}).fetch()[i]
    texts:()->
      if Drafts.find({type:'text'}).count() > 1
        for i in [1..(Drafts.find({type:'text'}).count()-1)]
          Drafts.find({type:'text'}).fetch()[i]

  Template.addPost.events
    'change [name=textarea]' : (e,cxt)->
      console.log("textarea change "+ e.currentTarget.value)
      Drafts.update({_id: this._id}, {$set: {text: e.currentTarget.value}});

    'click #takephoto': ()->
      if window.takePhoto
        window.takePhoto (result)->
          console.log 'result from camera is ' + JSON.stringify(result)
          if result
            Drafts.insert {type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, data_row:'1', data_col:'3', data_sizex:'3', data_sizey:'3'}

    'click #addmore':->
      #uploadFile (result)->
      Session.set('NewImgAdd','false')
      selectMediaFromAblum (result)->
        if result
          #console.log 'upload success: url is ' + result
          #Drafts.insert {owner: Meteor.userId(), imgUrl:result}
          console.log 'image url is ' + result.smallImage
          Drafts.insert {type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, data_row:'1', data_col:'3', data_sizex:'3', data_sizey:'3'}
      return
    'click #addText':->
      Drafts.insert {type:'text', isImage:false, owner: Meteor.userId(), text:'', style:'', data_row:'1', data_col:'3',  data_sizex:'6', data_sizey:'1'}
      return
    'click .back':(event)->
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      PUB.back()
      return
    'click #edit':(event)->
      Session.set 'isReviewMode','0'
      return
    'click #delete':(event)->
      Session.set 'isReviewMode','1'
      #Delete it from SavedDrafts
      draftData = Drafts.find().fetch()
      draftId = draftData[0]._id
      SavedDrafts.remove draftId
      #Clear Drafts
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      PUB.back()
      return
    'click .cancle':->
      try 
        draftData = Drafts.find().fetch()
        draftId = draftData[0]._id
        if SavedDrafts.find({_id:draftId}).count() > 0
          Session.set 'isReviewMode','1'
        else
          #Router.go('/')
          Drafts
            .find {owner: Meteor.userId()}
            .forEach (drafts)->
              Drafts.remove drafts._id
        history.back()
        return
      catch
        history.back()
    'click #saveDraft':->
        layout = JSON.stringify(gridster.serialize())
        pub=[]
        title = $("#title").val()
        console.log "title = " + title
        if title is ''
          window.plugins.toast.showShortBottom('请为您的故事加个标题')
          return
        addontitle = $("#addontitle").val()
        draftData = Drafts.find().fetch()
        draftId = draftData[0]._id;
        for i in [0..(draftData.length-1)]
          if i is 0
            mainImage = draftData[i].imgUrl
            mainText = $("#"+draftData[i]._id+"text").val()

          json = jQuery.parseJSON(layout);
          for item in json
            if item.id is draftData[i]._id
              draftData[i].data_row = item.row
              draftData[i].data_col = item.col
              draftData[i].data_sizex = item.size_x
              draftData[i].data_sizey = item.size_y

          pub.push(draftData[i])
          #pub.push {
          #  _id: draftData[i]._id,
          #  type: draftData[i].type,
          #  imgUrl:draftData[i].imgUrl,
          #  filename: draftData[i].filename,
          #  URI: draftData[i].URI,
          #  layout: draftData[i].layout
          #}
        if SavedDrafts.find({_id:draftId}).count() > 0
            SavedDrafts.update(
              {_id:draftId},
              {$set:{
              pub:pub,
              title:title,
              addontitle:addontitle,
              mainImage: mainImage,
              mainText: mainText,
              owner:Meteor.userId(),
              createdAt: new Date(),
              }}
            )
        else
            SavedDrafts.insert {
              _id:draftId,
              pub:pub,
              title:title,
              addontitle:addontitle,
              mainImage: mainImage,
              mainText: mainText,
              owner:Meteor.userId(),
              createdAt: new Date(),
            }
        Drafts
          .find {owner: Meteor.userId()}
          .forEach (drafts)->
            Drafts.remove drafts._id
        PUB.back()
        return
    'click #publish':->
      if Meteor.user() is null
        Router.go('/user')
        false
      else
        layout = JSON.stringify(gridster.serialize())
        pub=[]
        title = $("#title").val()

        if title is ''
          window.plugins.toast.showShortBottom('请为您的故事加个标题')
          return

        addontitle = $("#addontitle").val()
        try
          ownerIcon = Meteor.user().profile.icon
        catch
          ownerIcon = 'http://bcs.duapp.com/travelers-km/S6zs7oYvfw2SHQ76m_1421318419747.jpg'
        draftData = Drafts.find().fetch()
        draftImageData = Drafts.find({type:'image'}).fetch()
        draftToBeUploadedImageData = []
        for i in [0..(draftImageData.length-1)]
            if draftImageData[i].imgUrl.indexOf("http://")>= 0
                continue
            draftToBeUploadedImageData.push(draftImageData[i])
        postId = draftData[0]._id;
#        console.log "#####" + pub
        uploadFileWhenPublishInCordova(draftToBeUploadedImageData, postId)
        #Don't add addpost page into history
        if draftToBeUploadedImageData.length is 0
            Router.go('/posts/'+postId);
        for i in [0..(draftData.length-1)]
#          console.log i
          if i is 0
            mainImage = 'http://bcs.duapp.com/travelers-km/'+draftData[i].filename
            mainText = $("#"+draftData[i]._id+"text").val()
          else
            if draftData[i].isImage
              draftData[i].imgUrl = 'http://bcs.duapp.com/travelers-km/'+draftData[i].filename
            #for some case user did not save the draft, directly published, the layout does not stored.
            json = jQuery.parseJSON(layout);
            for item in json
              if item.id is draftData[i]._id
                draftData[i].data_row = item.row
                draftData[i].data_col = item.col
                draftData[i].data_sizex = item.size_x
                draftData[i].data_sizey = item.size_y
            pub.push(draftData[i])

        sortBy = (key, a, b, r) ->
          r = if r then 1 else -1
          return -1*r if a[key] > b[key]
          return +1*r if a[key] < b[key]
          return 0

        sortedPub = pub.sort((a, b)->
          sortBy('data_row', a, b)
        )

#        console.log "#####end" + pub
        if Session.get('isReviewMode') is '2'
            Posts.update(
              {_id:postId},
              {$set:{
                  pub:pub,
                  title:title,
                  heart:[],  #点赞
                  retweet:[],#转发
                  comment:[], #评论
                  addontitle:addontitle,
                  mainImage: mainImage,
                  mainText: mainText,
                  owner:Meteor.userId(),
                  ownerName:Meteor.user().username,
                  ownerIcon:ownerIcon,
                  createdAt: new Date(),
                }
              }
            )
        else
            Posts.insert {
              _id:postId,
              pub:pub,
              title:title,
              heart:[],  #点赞
              retweet:[],#转发
              comment:[], #评论
              addontitle:addontitle,
              mainImage: mainImage,
              mainText: mainText,
              owner:Meteor.userId(),
              ownerName:Meteor.user().username,
              ownerIcon:ownerIcon,
              createdAt: new Date(),
            }
            #Router.go('/posts/'+postId)
            #Delete from SavedDrafts if it is a saved draft.
            if SavedDrafts.find({_id:postId}).count() > 0
                SavedDrafts.remove postId
            #Delete the Drafts
        Drafts
          .find {owner: Meteor.userId()}
          .forEach (drafts)->
            Drafts.remove drafts._id
          return
    'click .remove':(event)->
      Drafts.remove this._id
