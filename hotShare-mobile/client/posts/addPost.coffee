if Meteor.isClient
  Template.addPost.destroyed = ->
    $('.tool-container').remove();
    $(window).children().off();
  # the only document I found here https://github.com/percolatestudio/transition-helper/blob/master/transition-helper.js#L4    
  Template.addPost.rendered=->
    `global_toolbar_hidden = false`
    $('.addPost').css('min-height',$(window).height())
    $('.addPost').css('width',$(window).width())
    $('.mainImage').css('height',$(window).height()*0.55)
#    Meteor.setTimeout ->
#      $('#wrapper img').css('height',$(window).height()*0.55)
#    ,200
    console.log 'addPost rendered rev=37'
    #testMenu will be main/font/align. It's for controlling the icon on text menu
    Session.set('textMenu','main')
    Session.set('textareaFocused', false)

    initMainImageToolBar = ()->
      $('.mainImage').toolbar
        content: '#mainImage-toolbar-options'
        position: 'bottom'
        hideOnClick: true
        $('.mainImage').on 'toolbarItemClick',(event,buttonClicked)->
          console.log $(buttonClicked).attr('id')
          console.log event.currentTarget.id
          if buttonClicked.id == "modify"
            console.log("modify")
            selectMediaFromAblum 1,(cancel, result)->
              if cancel
                if Drafts.find().count() is 0
                  PUB.back()
                return
              if result
                console.log 'image url is ' + result.smallImage
                if Drafts.find({type:'image'}).count() > 0
                  mainImageDoc = Drafts.find({type:'image'}).fetch()[0]
                  Drafts.update({_id: mainImageDoc._id}, {$set: {imgUrl:result.smallImage, filename:result.filename, URI:result.URI }});
          else if buttonClicked.id == "crop"
            console.log("crop "+ event.currentTarget.id)

            
            Session.set 'isReviewMode','3'
            Session.set 'cropDraftId',event.currentTarget.id

            mainImageId = event.currentTarget.id
            imgWidth = document.getElementById(mainImageId).offsetWidth
            imgHeight = document.getElementById(mainImageId).offsetHeight
            
#            $('#mainImage'+mainImageId).css('display',"none")
            $('#'+mainImageId).css('display',"none")
            $('#crop'+mainImageId).css('display',"block")
            $('#'+mainImageId).css('z-index',"12")
            image = Drafts.findOne({_id:mainImageId}).imgUrl
            console.log "imgUrl is "+image
            console.log "imgWidth is "+imgWidth
            console.log "imgHeight is "+imgHeight
            containerId= "#default"+mainImageId
            console.log "containerId is "+containerId
            crop = new CROP()
            crop.init {
              container: containerId,
              image: image,
              width: imgWidth,
              height: imgHeight,
              mask: false,
              zoom: {steps: 0.01,min: 1,max: 2},
            }
            Meteor.setTimeout ->
              Session.set 'imgSizeW',$("#default"+event.currentTarget.id+" .crop-img").width()
              Session.set 'imgSizeH',$("#default"+event.currentTarget.id+" .crop-img").height()
            ,200

    #init
    this.find('.content')._uihooks = {
      insertElement: (node, next)->
        $(node)
          .insertBefore(next)

        initMainImageToolBar()
        ###
        Don't add toolbar on mainImage for now.
        MainImage need replace, we can do it later.
        ###
    }

    #when click to edit stored draft, the uihook will not be called again, so need reinitiate here.
    initMainImageToolBar()

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
        $(textarea).attr('readOnly',false)
        $(textarea).off('focus')
        $(textarea).off('focusout')
        $(textarea).off('blur')
        `global_disable_longpress = true`
        `global_toolbar_hidden = true`

        height = $('.addPost').height()
        $(node).css('z-index', 20)
        $('#blur_overlay').css('height',height)
        #gridster pressed_revert's z-index is 10. blur should be larger than 10. otherwise,
        #some image may not be in blur status.
        $('#blur_overlay').css('z-index', 14)

        $(textarea).click(()->
            console.log("textarea click!")
            #$(textarea).focus()
            console.log("$(textarea).value="+JSON.stringify($(textarea).value));
            console.log("$(textarea).selectionStart="+$(textarea).selectionStart);
        )

        $(textarea).focus(()->
          #$(".head").css 'position','absolute'
          #Session.set('textareaFocused', true)
          console.log("focus get")
          $(node).addClass("edit");
        )
        $(textarea).on('blur', 'input, textarea', ()->
          setTimeout(()->
            window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
          , 0)
        )
        $(textarea).focus()

        $(textarea).focusout(()->
          #$(".head").css 'position','fixed'
          console.log("focusout")
          $(this).attr("readOnly", true)
          `global_disable_longpress = false`
          `global_toolbar_hidden = false`
          #Session.set('textareaFocused', false)

          $('#blur_overlay').css('height','')
          $(node).css('z-index', '')
          $(node).removeClass("edit");
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
        textarea.attr('style', style)
        #Compute the new scrollHeight
        grid_size=($('#display').width()/6 - 10);
        min_widget_height = (5 * 2) + grid_size;
        $(textarea).css('height', 'auto');
        scrollHeight = document.getElementById(node.id+"TextArea").scrollHeight
        $(textarea).css('height', scrollHeight);
        sizey = Math.floor(scrollHeight/min_widget_height)+1
        resizeItem = $('#'+node.id)
        orig_sizey = parseInt(resizeItem.attr("data-sizey"))
        if sizey isnt orig_sizey
          height = sizey*min_widget_height - 10
          resizeItem.css("height", height)
          $(node).css('height', "")
          sizex = parseInt(resizeItem.attr("data-sizex"))
          gridster.resize_widget(resizeItem, sizex,sizey)
        Drafts.update({_id: doc_id}, {$set: {style: style}});
      else if buttonClicked.id is "font-quato"
        console.log 'Need font-quato'
        style = "font-family:Times New Roman, Times, serif" + ';font-size:xx-large' + ';text-align:' + textarea.css('text-align')+';'
        textarea.attr('style', style)
        #Compute the new scrollHeight
        grid_size=($('#display').width()/6 - 10);
        min_widget_height = (5 * 2) + grid_size;
        scrollHeight = document.getElementById(node.id+"TextArea").scrollHeight
        $(textarea).css('height', 'auto').css('height', scrollHeight);
        sizey = Math.floor(scrollHeight/min_widget_height)+1
        resizeItem = $('#'+node.id)
        orig_sizey = parseInt(resizeItem.attr("data-sizey"))
        if sizey isnt orig_sizey
          height = sizey*min_widget_height - 10
          resizeItem.css("height", height)
          $(node).css('height', "")
          sizex = parseInt(resizeItem.attr("data-sizex"))
          gridster.resize_widget(resizeItem, sizex,sizey)
        Drafts.update({_id: doc_id}, {$set: {style: style}});
      return

    initToolBar = (node, grid)->
      #console.log 'Added node id is ' + node.id
      type = node.$blaze_range.view.parentView.dataVar.curValue.type
      if type == "text"
          if grid != undefined
            if window.unSelectedElem
              insert_row = parseInt($(window.unSelectedElem).attr('data-row'))
              window.unSelectedElem = undefined
              console.log('Selected data-row is ' + insert_row)
              grid.add_widget(node, 6, 1, 1, insert_row)
            else
              max_row = 1
              middle = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)/2
              middle = 150 if middle is 0
              $('.resortitem:near-viewport(-'+ middle+')').each( ( i, itemElem )->
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

          $('#'+node.id+'TextArea').on('keyup input',(e)->
            e.preventDefault()
            id = this.id.replace("TextArea", "")
            grid_size=($('#display').width()/6 - 10);

            min_widget_height = (5 * 2) + grid_size;

            #offset = this.offsetHeight - this.clientHeight;
            $(this).css('height', 'auto').css('height', this.scrollHeight);

            sizey = Math.floor((this.scrollHeight)/min_widget_height)+1

            resizeItem = $('#'+id)
            orig_sizey = parseInt(resizeItem.attr("data-sizey"))
            if gridster? and sizey isnt orig_sizey
              height = sizey*min_widget_height - 10
              resizeItem.css("height", height)
              $(this).css('height', "")

              sizex = parseInt(resizeItem.attr("data-sizex"))
              gridster.resize_widget(resizeItem, sizex,sizey)
              console.log('propertychange sizey:'+ sizey + 'height:' +height + 'scrollHeight:'+this.scrollHeight)
          )

      else if type == "image"
          if grid != undefined
            if Session.get('NewImgAdd') is 'true'
              grid.add_widget(node, 3, 3)
            else if window.unSelectedElem
              insert_row = parseInt($(window.unSelectedElem).attr('data-row'))
              insert_col = parseInt($(window.unSelectedElem).attr('data-col'))
              window.unSelectedElem = undefined
              grid.add_widget(node, 3, 3, insert_col, insert_row)
            else
              max_row = 1
              middle = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)/2
              middle = 150 if middle is 0
              $('.resortitem:near-viewport(-'+ middle+')').each( ( i, itemElem )->
                if i == 0
                  max_row = parseInt($(itemElem).attr("data-row"))
                cur_row = parseInt($(itemElem).attr("data-row"))
                console.log("near-viewport id:"+ itemElem.id + " data-row:"+ cur_row)
                if max_row < cur_row
                  max_row = cur_row
              )
              console.log("max_row " + max_row)
              if window.add_image_to_right
                window.add_image_to_right = false
                grid.add_widget(node, 3, 3,4,max_row)
              else
                window.add_image_to_right = true
                grid.add_widget(node, 3, 3,1,max_row)

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
            else if buttonClicked.id == "crop"
              console.log("crop "+ node.id)
              Session.set 'isReviewMode','3'
              Session.set 'cropDraftId',node.id

              $('#isImage'+node.id).css('display',"none")
              $('#crop'+node.id).css('display',"block")
              $('#'+node.id).css('z-index',"12")
              image = Drafts.findOne({_id:node.id}).imgUrl
              style = Drafts.findOne({_id:node.id}).style
              if style is undefined
                style = ''
              scale = Drafts.findOne({_id:node.id}).scale
              if scale is undefined
                scale = 1
              console.log "imgUrl is "+image
              imgWidth = $(node).width()
              imgHeight = $(node).height()
              console.log "imgWidth is "+imgWidth
              console.log "imgHeight is "+imgHeight
              containerId= "#default"+node.id
              console.log "containerId is "+containerId
              crop = new CROP()
              crop.init {
                container: containerId,
                image: image,
                style: style,
                width: imgWidth,
                height: imgHeight,
                mask: false,
                zoom: {steps: 0.01,min: 1,max: 3,value: scale},
              }
              cropimg = $(containerId).find('.crop-overlay')[0]
              hammertime = new Hammer(cropimg)
              pinch = new Hammer.Pinch();
              rotate = new Hammer.Rotate();
              pinch.recognizeWith(rotate);
              hammertime.add([pinch, rotate]);
              initScale = 1
              pinchStatus = 0;
              hammertime.on("pinchstart pinchin pinchout pinchend", (e)->
                e.preventDefault();
                zoom = $(containerId).find('input')
                if e.type is 'pinchstart'
                    initScale = zoom.val()
                    pinchStatus = 1
                else if e.type is 'pinchend'
                    initScale = zoom.val()
                    pinchStatus = 0
                else if e.type is 'pinchin' or e.type is 'pinchout'
                    if pinchStatus is 0
                        return
                    #scale = initScale * (1 + (e.scale-1.0)*0.1);
                    scale = initScale * e.scale;
                    #console.log("hammer on pinch, e.scale="+e.scale+", scale="+scale+", initScale="+initScale);
                    if scale > 3
                      scale = 3
                    else if scale < 1
                      scale = 1
                    crop.slider(scale);
                    #apply background color to range progress
                    zoom.val(scale)
                    #val = scale
                    #min = zoom.attr('min')
                    #max = zoom.attr('max')
                    #pos = Math.round(((val - min) / (max - min)) * 100)
                    #style = "background: linear-gradient(to right, #fbc93d " + pos + "%, #eee " + (pos + 0.1) + "%);"
                    #zoom.attr('style', style);
              )

              Meteor.setTimeout ->
                Session.set 'imgSizeW',$("#default"+node.id+" .crop-img").width()/scale
                Session.set 'imgSizeH',$("#default"+node.id+" .crop-img").height()/scale
              ,300
            return
      return


    this.find('#display')._uihooks = {
      insertElement: (node, next)->
        #console.log('Inserted node id is ' + node.id);
        $(node).insertBefore(next)

        Deps.afterFlush =>
          initToolBar(node, gridster)
          type = node.$blaze_range.view.parentView.dataVar.curValue.type
          if type == "text"
            $(node).trigger("toolbarItemClick", {id:"modify"})
    }

    $("#display").find('.resortitem').each( ( i, itemElem )->
      initToolBar(itemElem, undefined)
    )

    base_size=($('#display').width()/6 - 10);
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
        if Session.get('textareaFocused') is false
          true
        else
          false
      else
        false
    isReviewMode:(value)->
      console.log "value is "+value + ", isReviewMode = "+Session.get('isReviewMode')
      if Session.get('isReviewMode') is value
        if Session.get('isReviewMode') is '1' or Session.get('isReviewMode') is '3'
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
          draftTitles = SavedDrafts.find({_id:draftId}).fetch()[0]
          if draftTitles == null
            draftTitles = {}
            draftTitles.title = Session.get 'draftTitle'
            draftTitles.addontitle = Session.get 'draftAddontitle'
          draftTitles 
    mainImage:->
      Meteor.setTimeout ->
        $('.mainImage').css('height',$(window).height()*0.55)
      ,0
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
    'beUnSelected .resortitem': (e)->
      if window.footbarOppration
        window.unSelectedElem = e.currentTarget
        window.footbarOppration = false
    #'beSelected .resortitem':->
    # console.log('.resortItem seleted')
    'focus [name=textarea]':->
      Session.set('textareaFocused', true)
      $(".head").css 'position','absolute'
    'blur [name=textarea]':->
      Session.set('textareaFocused', false)
      $(".head").css 'position','fixed'
    'change [name=textarea]' : (e,cxt)->
      console.log("textarea change "+ e.currentTarget.value)
      Drafts.update({_id: this._id}, {$set: {text: e.currentTarget.value}});
    'click #addLink': ()->
      console.log 'Add Link'
      commentBox = $('.linkInputBox').bPopup
        onClose: ->
          console.log 'Link Input Modal Closed'
        onOpen: ->
          console.log 'Link Input Modal Opened'
      $('.linkInputBox #pasteLink').off 'click'
      $('.linkInputBox #insertLink').off 'click'

      $('.linkInputBox #pasteLink').on 'click',()->
        console.log $('.linkInputBox #linkToBeInserted').val()
        cordova.plugins.clipboard.paste (text)->
          $('.linkInputBox #linkToBeInserted').val(text)
      $('.linkInputBox #insertLink').on 'click',()->
          console.log $('.linkInputBox #linkToBeInserted').val()
          commentBox.close()

    'click #takephoto': ()->
      window.footbarOppration = true
      if window.takePhoto
        window.takePhoto (result)->
          console.log 'result from camera is ' + JSON.stringify(result)
          if result
            Drafts.insert {type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, data_row:'1', data_col:'3', data_sizex:'3', data_sizey:'3'}

    'click #addmore':->
      window.footbarOppration = true
      #uploadFile (result)->
      Session.set('NewImgAdd','false')
      selectMediaFromAblum(20, (cancel, result)->
        if cancel
          if Drafts.find().count() is 0
            PUB.back()
          return
        if result
          #console.log 'upload success: url is ' + result
          #Drafts.insert {owner: Meteor.userId(), imgUrl:result}
          console.log 'image url is ' + result.smallImage
          Drafts.insert {type:'image', isImage:true, owner: Meteor.userId(), imgUrl:result.smallImage, filename:result.filename, URI:result.URI, data_row:'1', data_col:'3', data_sizex:'3', data_sizey:'3'}
      )
      return
    'click #addText':->
      window.footbarOppration = true
      Drafts.insert {type:'text', isImage:false, owner: Meteor.userId(), text:'', style:'', data_row:'1', data_col:'3',  data_sizex:'6', data_sizey:'1'}
      return
    'click .back':(event)->
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      $('.addPost').addClass('animated ' + animateOutUpperEffect);
      Meteor.setTimeout ()->
        PUB.back()
      ,animatePageTrasitionTimeout
      return
    'click #edit':(event)->
      Session.set 'isReviewMode','0'
      return
    'click #delete':(event)->
      navigator.notification.confirm('您是否要删除草稿？', (r)->
        if r is 1
          return
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
        $('.addPost').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
          PUB.back()
        ,animatePageTrasitionTimeout
        return
      , '删除草稿', ['取消','确定']);

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
        $('.addPost').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
          PUB.back()
        ,animatePageTrasitionTimeout
        return
      catch
        history.back()
    'click #cropDone':->
      cropDraftId = Session.get('cropDraftId')
      
      console.log cropDraftId
      imgSize =
        w : Session.get 'imgSizeW'
        h : Session.get 'imgSizeH'
      imgRatio =
        wh : imgSize.w / imgSize.h
        hw : imgSize.h / imgSize.w
      imgZoomSize =
        w : $("#default"+cropDraftId+" .crop-img").width()
        h : $("#default"+cropDraftId+" .crop-img").height()
      holderSize = 
        w : $("#default"+cropDraftId).width()
        h : $("#default"+cropDraftId).height()
      holderRatio =
        wh : $("#default"+cropDraftId).width() / $("#default"+cropDraftId).height()
        hw : $("#default"+cropDraftId).height() / $("#default"+cropDraftId).width()
#      if imgZoomSize.w * holderRatio.hw * imgRatio.wh < imgZoomSize.h * holderRatio.wh * imgRatio.hw
      if imgZoomSize.w * holderRatio.hw < imgZoomSize.h * holderRatio.wh
        img_width = (imgZoomSize.w / imgSize.w)*100 + '%'
        img_height = (imgZoomSize.h / imgSize.h)*imgRatio.hw*holderRatio.wh*100 + '%'
      else
        img_width = (imgZoomSize.w / imgSize.w)*imgRatio.wh*holderRatio.hw*100 + '%'
        img_height = (imgZoomSize.h / imgSize.h)*100 + '%'
#      img_height = $("#default"+cropDraftId+" .crop-img").css('height')
#      img_width = $("#default"+cropDraftId+" .crop-img").css('width')
      imgMove = 
        t : $("#default"+cropDraftId+" .crop-img").css('top')
        l : $("#default"+cropDraftId+" .crop-img").css('left')
      console.log "imgRatio is "
      console.log imgRatio
      console.log "holderRatio is "
      console.log holderRatio
      img_top = (parseFloat(imgMove.t) / holderSize.h)*100 + '%'
      img_left = (parseFloat(imgMove.l) / holderSize.w)*100 + '%'
      console.log "imgSize is "+imgSize
      console.log imgSize
      console.log "imgZoomSize is "
      console.log imgZoomSize
      console.log "holderSize is "
      console.log holderSize
      console.log "imgMove is "
      console.log imgMove
      console.log "img_top is "
      console.log img_top
      
      style = "height:" + img_height + ';width:' + img_width + ';top:' + img_top + ';left:' + img_left + ';'
      console.log style
      zoom = $("#default"+cropDraftId).find('input')
      Drafts.update({_id: cropDraftId}, {$set: {style: style, scale:zoom.val()}});
      $('#isImage'+cropDraftId).css('display',"block")
      $('#'+cropDraftId).css('display',"block")
      $('#crop'+cropDraftId).css('display',"none")
      Meteor.setTimeout ()->
        document.getElementById('default'+cropDraftId).innerHTML=""
      ,120
      $('#'+cropDraftId).css('z-index',"2")
      if Posts.find({_id:Drafts.find().fetch()[0]._id}).count() > 0
        Session.set 'isReviewMode','2'
      else
        Session.set 'isReviewMode','0'
      
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
        history.back()
        #PUB.back()
        return
    'click #publish':->
      if Meteor.user() is null
        window.plugins.toast.showShortBottom('请登录后发表您的故事')
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
          ownerIcon = '/userPicture.png'
        draftData = Drafts.find().fetch()
        postId = draftData[0]._id;

        draftImageData = Drafts.find({type:'image'}).fetch()
        draftToBeUploadedImageData = []
        for i in [0..(draftImageData.length-1)]
            if draftImageData[i].imgUrl.indexOf("http://")>= 0
                continue
            draftToBeUploadedImageData.push(draftImageData[i])
#       console.log "#####" + pub
        #uploadFileWhenPublishInCordova(draftToBeUploadedImageData, postId)
        #Don't add addpost page into history
        multiThreadUploadFileWhenPublishInCordova(draftToBeUploadedImageData, postId, (result)->
            if result is null
                #$("#title").val(title)
                #$("#addontitle").val(addontitle)
                Session.Set 'draftTitle',title
                Session.Set 'draftAddontitle',addontitle
                PUB.back();
                return
            for i in [0..(draftData.length-1)]
              if i is 0
                mainImage = 'http://bcs.duapp.com/travelers-km/'+draftData[i].filename
                mainImageStyle = draftData[i].style
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

#           console.log "#####end" + pub

            console.log 'Full name is ' + Meteor.user().profile.fullname
            if Meteor.user().profile.fullname && (Meteor.user().profile.fullname isnt '')
              ownerName = Meteor.user().profile.fullname
            else
              ownerName = Meteor.user().username
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
                      mainImageStyle:mainImageStyle,
                      mainText: mainText,
                      owner:Meteor.userId(),
                      ownerName:ownerName,
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
                  browse:0,
                  heart:[],  #点赞
                  retweet:[],#转发
                  comment:[], #评论
                  commentsCount:0,
                  addontitle:addontitle,
                  mainImage: mainImage,
                  mainImageStyle:mainImageStyle,
                  mainText: mainText,
                  owner:Meteor.userId(),
                  ownerName:ownerName,
                  ownerIcon:ownerIcon,
                  createdAt: new Date(),
                }
                #Router.go('/posts/'+postId)
                #Delete from SavedDrafts if it is a saved draft.
            if SavedDrafts.find({_id:postId}).count() > 0
                SavedDrafts.remove postId
                #Delete the Drafts
            Drafts.remove({})
            if Session.get('isReviewMode') is '2'
                Router.go('/posts/'+postId)
            else
                Session.set("TopicPostId", postId)
                Session.set("TopicTitle", title)
                Session.set("TopicAddonTitle", addontitle)
                Session.set("TopicMainImage", mainImage)
                Router.go('addTopicComment')
        )
        return
    'click #publishOld':->
      if Meteor.user() is null
        window.plugins.toast.showShortBottom('请登录后发表您的故事')
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
          ownerIcon = '/userPicture.png'
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
            mainImageStyle = draftData[i].style
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
        console.log 'Full name is ' + Meteor.user().profile.fullname
        if Meteor.user().profile.fullname && (Meteor.user().profile.fullname isnt '')
          ownerName = Meteor.user().profile.fullname
        else
          ownerName = Meteor.user().username
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
                  mainImageStyle: mainImageStyle,
                  mainText: mainText,
                  owner:Meteor.userId(),
                  ownerName:ownerName,
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
              browse:0,
              heart:[],  #点赞
              retweet:[],#转发
              comment:[], #评论
              commentsCount:0,
              addontitle:addontitle,
              mainImage: mainImage,
              mainImageStyle:mainImageStyle,
              mainText: mainText,
              owner:Meteor.userId(),
              ownerName:ownerName,
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
