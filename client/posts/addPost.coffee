if Meteor.isClient
  # the only document I found here https://github.com/percolatestudio/transition-helper/blob/master/transition-helper.js#L4

  Template.addPost.rendered=->
#    $('.img').css('max-width',$(window).width())
#    $('.mainImage').css('height',$(window).height()*0.4)
#    $('.title').css('top',$(window).height()*0.25)
#    $('.addontitle').css('top',$(window).height()*0.35)
    console.log 'addPost rendered'
    #init
    this.find('.content')._uihooks = {
      insertElement: (node, next)->
        console.log('Inserted node id is ' + node.id);
        $(node)
          .insertBefore(next)
#        $('.mainImage').css('height',$(window).height()*0.4)
        $('.mainImage').toolbar
          content: '#image-toolbar-options'
          position: 'bottom'
          hideOnClick: true
#        $('.title').css('top',$(window).height()*0.25)
#        $('.addontitle').css('top',$(window).height()*0.35)
    }


    initToolBar = (node, gridster)->
      console.log 'Added node id is ' + node.id
      type = node.$blaze_range.view.parentView.dataVar.curValue.type
      if type == "text"
          if gridster != undefined
            gridster.add_widget(node, 4, 1)
          $(node).toolbar
            content: '#text-toolbar-options'
            position: 'top'
            hideOnClick: true

          $(node).on('toolbarItemClick', (event, buttonClicked)->
            console.log("toolbarItemClick" + buttonClicked.id)
            if buttonClicked.id == "modify"
              textdiv = $(event.target).children('.textdiv')
              textarea = textdiv.children('textarea')
              #$(textarea).removeAttr("disabled")
              $(textarea).attr('disabled',false)
              $(textarea).first().focus()

              $(textarea).focusout(()->
                $(this).attr("disabled", "true")
                id = $(this).attr("text")
                text = $(this).val()
                Drafts.update({_id: id}, {$set: {text: text}});
              )
            if buttonClicked.id == "del"
              console.log("del "+ node.id)
              if gridster != undefined
                gridster.remove_widget2(node, true)
              Drafts.remove node.id
            return
          )

        else if type == "image"
          if gridster != undefined
            gridster.add_widget(node, 3, 3)
          $(node).toolbar
            content: '#image-toolbar-options'
            position: 'top'
            hideOnClick: true
          $(node).on 'toolbarItemClick',(event,buttonClicked)=>
            console.log $(buttonClicked).attr('id') + ' event on nodeid ' + node.id
            if buttonClicked.id == "del"
              console.log("del "+ node.id)

              if gridster != undefined
                gridster.remove_widget2(node, true)
              Drafts.remove node.id
            return
      return


    this.find('#display')._uihooks = {
      insertElement: (node, next)->
        console.log('Inserted node id is ' + node.id);
        $(node).insertBefore(next)

        Deps.afterFlush =>
          initToolBar(node, gridster)
    }

    $("#display").find('.resortitem').each( ( i, itemElem )->
      initToolBar(itemElem, undefined)
    )

    #draftLayout = Session.get("draftLayout")
    if Drafts.find({type:'image'}).count() >= 1
      draftData = Drafts.find({type:'image'}).fetch()
      draftLayout = draftData[0].layout;
      if draftLayout != '' and draftLayout != undefined
        json = jQuery.parseJSON(draftLayout);
        for item in json
          $('#' + item.id).attr('data-row', item.row).attr('data-col', item.col).attr('data-sizex', item.size_x).attr('data-sizey', item.size_y)

    test = $("#display");
    `gridster = test.gridster({serialize_params: function ($w, wgd) {
      return {
        id: wgd.el[0].id,
        col: wgd.col,
        row: wgd.row,
        size_x: wgd.size_x,
        size_y: wgd.size_y
      };
    },
    draggable: {
      stop: function () {
        var json = JSON.stringify(gridster.serialize());
        console.log("draggable draftLayout "+ json);
        var drafts = Drafts.find({type:'image', owner: Meteor.userId()}).fetch();
        for (var i = 0; i < drafts.length; i++){
          Drafts.update({_id: drafts[i]._id}, {$set: {layout: json}});
        }
      }
    }, widget_base_dimensions: [40, 40],widget_margins: [5, 5], min_cols: 3, resize: {enabled: true, stop: function () {
        var json = JSON.stringify(gridster.serialize());
        console.log("resize draftLayout "+ json);
        var drafts = Drafts.find({type:'image', owner: Meteor.userId()}).fetch();
        for (var i = 0; i < drafts.length; i++){
          Drafts.update({_id: drafts[i]._id}, {$set: {layout: json}});
        }
    }}}).data('gridster');`
    #Set is isReviewMode
    draftData = Drafts.find().fetch()
    if draftData and draftData.length>0
      draftId = draftData[0]._id
      if SavedDrafts.find({_id:draftId}).count() > 0
        Session.set 'isReviewMode','true'
        gridster.disable()
        gridster.disable_resize()
        $("#title").attr("disabled", "disabled")
        $("#addontitle").attr("disabled", "disabled")
      else
        Session.set 'isReviewMode','false'
        gridster.enable()
        gridster.enable_resize()
        $("#title").attr("disabled", false)
        $("#addontitle").attr("disabled", false)
    else
      Session.set 'isReviewMode','false'
      gridster.enable()
      gridster.enable_resize()
      $("#title").attr("disabled", false)
      $("#addontitle").attr("disabled", false)
    return

  Template.addPost.helpers
    isReviewMode:->
      if Session.get('isReviewMode') is 'true'
        if gridster?
          console.log "gridster.disable "
          gridster.disable()
          gridster.disable_resize()
        $("#title").attr("disabled", "disabled")
        $("#addontitle").attr("disabled", "disabled")
        'true'
      else
        console.log "gridster.enable "
        if gridster?
          gridster.enable()
          gridster.enable_resize()
        $("#title").attr("disabled", false)
        $("#addontitle").attr('disabled',false)
        null
    draftTitles:->
      draftData = Drafts.find().fetch()
      draftId = draftData[0]._id;
      SavedDrafts.find({_id:draftId}).fetch()[0]
#      if findResult.count() > 0
#        findResult.fetch()[0]
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
        for i in [1..(Drafts.find().count()-1)]
          Drafts.find().fetch()[i]

    items:()->
      if Drafts.find({type:'image'}).count() > 1
        for i in [1..(Drafts.find({type:'image'}).count()-1)]
          Drafts.find({type:'image'}).fetch()[i]
    texts:()->
      if Drafts.find({type:'text'}).count() > 1
        for i in [1..(Drafts.find({type:'text'}).count()-1)]
          Drafts.find({type:'text'}).fetch()[i]

  Template.addPost.events
    'click #addmore':->
      #uploadFile (result)->
      selectMediaFromAblum (result)->
        #console.log 'upload success: url is ' + result
        #Drafts.insert {owner: Meteor.userId(), imgUrl:result}
        console.log 'upload success: url is ' + result.smallImage
        Drafts.insert {type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, layout:''}
      return
    'click #addText':->
      Drafts.insert {type:'text', isImage:false, owner: Meteor.userId(), text:''}
      return
    'click #back':(event)->
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      PUB.back()
      return
    'click #edit':(event)->
      Session.set 'isReviewMode','false'
      return
    'click #delete':(event)->
      Session.set 'isReviewMode','true'
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
    'click #cancle':->
      draftData = Drafts.find().fetch()
      draftId = draftData[0]._id;
      if SavedDrafts.find({_id:draftId}).count() > 0
        Session.set 'isReviewMode','true'
      else
        #Router.go('/')
        Drafts
          .find {owner: Meteor.userId()}
          .forEach (drafts)->
            Drafts.remove drafts._id
      history.back()
      return
    'click #saveDraft':->
        layout = {}     #JSON.stringify(gridster.serialize())
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
              layout: layout
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
              layout: layout
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
        #Session.set("draftLayout", '');
        layout = JSON.stringify(gridster.serialize())
        #console.log("layout serialize "+ layout)
        pub=[]
        title = $("#title").val()
        addontitle = $("#addontitle").val()
        try
          ownerIcon = Meteor.user().profile.icon
        catch
          ownerIcon = 'http://bcs.duapp.com/travelers-km/S6zs7oYvfw2SHQ76m_1421318419747.jpg'
        draftData = Drafts.find().fetch()
        postId = draftData[0]._id;
#        console.log "#####" + pub
        uploadFileWhenPublishInCordova(draftData, postId)
        for i in [0..(draftData.length-1)]
#          console.log i
          if i is 0
            mainImage = 'http://bcs.duapp.com/travelers-km/'+draftData[i].filename
            mainText = $("#"+draftData[i]._id+"text").val()
          else
            pub.push(draftData[i])

#        console.log "#####end" + pub
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
          layout: layout
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
