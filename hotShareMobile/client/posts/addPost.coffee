if Meteor.isClient
  window.iabHandle = null
  Session.set('lastImportedUrl','')
  Template.addPost.destroyed = ->
    $('.tool-container').remove();
    $(window).children().off();
  # the only document I found here https://github.com/percolatestudio/transition-helper/blob/master/transition-helper.js#L4    
  Template.addPost.rendered=->
    Meteor.subscribe("saveddrafts");
    window.imageCounter2 = 1
    window.insertRow = 1
    `global_toolbar_hidden = false`
    $('.addPost').css('min-height',$(window).height())
    $('.addPost').css('width',$(window).width())
    $('.mainImage').css('height',$(window).height()*0.55)

    title = document.getElementById("title")
    if title?
      $('#title').css("height", "auto");
      scrollHeight = title.scrollHeight;
      $('#title').css('height', scrollHeight)

    addontitle = document.getElementById("addontitle")
    if addontitle?
      $('#addontitle').css("height", "auto");
      scrollHeight = addontitle.scrollHeight
      $('#addontitle').css('height', scrollHeight);

#    Meteor.setTimeout ->
#      $('#wrapper img').css('height',$(window).height()*0.55)
#    ,200
    console.log 'addPost rendered rev=37'
    #testMenu will be main/font/align. It's for controlling the icon on text menu
    Session.set('textMenu','main')
    Session.set('textareaFocused', false)
    $('.addPost #ViewOnWeb').toolbar
      content: '#linkOption-toolbar-options'
      position: 'top'
      hideOnClick: true
      $('.addPost #ViewOnWeb').on 'toolbarItemClick',(event,buttonClicked)->
        if buttonClicked.id is "del"
          if Drafts.find({type:'image'}).count() > 0
            Drafts.update({_id:Drafts.find({type:'image'}).fetch()[0]._id},{$set:{url:''}})

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
                  Drafts.update({_id: mainImageDoc._id}, {$set: {imgUrl:result.smallImage,filename:result.filename, URI:result.URI }});
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
            image = $(this).find('img').attr("src")
            #style = Drafts.findOne({_id:mainImageId}).style
            style = $('#'+mainImageId).getStyleProp();
            if style is undefined
              style = ''
            scale = Drafts.findOne({_id:mainImageId}).scale
            if scale is undefined
              scale = 1
            console.log "imgUrl is "+image
            console.log "imgWidth is "+imgWidth
            console.log "imgHeight is "+imgHeight
            containerId= "#default"+mainImageId
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
              callback: ()->
                Session.set 'imgSizeW',$("#default"+event.currentTarget.id+" .crop-img").width()/scale
                Session.set 'imgSizeH',$("#default"+event.currentTarget.id+" .crop-img").height()/scale
            }
            if window.device.model is "iPhone7,1"
                height = $('#'+mainImageId).height()
                bottomTop = height
                $('#blur_bottom').css('top',bottomTop)
                docHeight = window.getDocHeight()
                bottomHeight = docHeight - bottomTop
                $('#blur_bottom').css('height',bottomHeight)
                
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

            #Meteor.setTimeout ->
            #  console.log("crop-img width="+$("#default"+node.id+" .crop-img").width()+", scale="+scale)
            #  console.log("crop-img width="+$("#default"+node.id+" .crop-img").height())
            #  Session.set 'imgSizeW',$("#default"+node.id+" .crop-img").width()/scale
            #  Session.set 'imgSizeH',$("#default"+node.id+" .crop-img").height()/scale
            #,300
          return
      return

    #init
    this.find('.content')._uihooks = {
      insertElement: (node, next)->
        $(node)
          .insertBefore(next)
        Deps.afterFlush ->
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

        ###
        $(textarea).click(()->
            console.log("textarea click!")
            #$(textarea).focus()
            console.log("$(textarea).value="+JSON.stringify($(textarea).value));
            console.log("$(textarea).selectionStart="+$(textarea).selectionStart);
        )
        ###

        $(textarea).focus(()->
          Session.set('textareaFocused', true)
          console.log("textareaFocused true")
          $(node).addClass("edit");
          $(textarea).off('focus')
          $(".head").css 'position','absolute'
        )

        ###
        $(textarea).on('blur', 'input, textarea', ()->
          setTimeout(()->
            window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
          , 0)
        )
        ###

        $(textarea).focus()

        $(textarea).focusout(()->
          console.log("focusout")
          $(this).attr("readOnly", true)
          `global_disable_longpress = false`
          `global_toolbar_hidden = false`
          Session.set('textareaFocused', false)
          console.log("textareaFocused false")
          $('#blur_overlay').css('height','')
          $(node).css('z-index', '')
          $(node).removeClass("edit");
          Template.addPost.__helpers.get('saveDraft')()

          $(textarea).off('focusout')
          $(".head").css 'position','fixed'
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
        style = "font-family:" + textarea.css("font-family") + ";font-size:" + textarea.css("font-size") + 
        ";text-align:left"+";background: " + textarea.css("background") + ";padding-left:" + textarea.css("padding-left") + ";padding-right:" + textarea.css("padding-right") + ";color:" + textarea.css("color") + ";height:"+
        textarea.css('height')+";"
        Drafts.update({_id: doc_id}, {$set: {style: style}});
        textarea.attr('style', style)
      else if buttonClicked.id is "aligntocenter"
        console.log 'Need aligntocenter'
        style = "font-family:" + textarea.css("font-family") + ";font-size:" + textarea.css("font-size") + 
        ";text-align:center"+";background: " + textarea.css("background") + ";padding-left:" + textarea.css("padding-left") + ";padding-right:" + textarea.css("padding-right") + ";color:" + textarea.css("color") + ";height:"+
        textarea.css('height')+";"
        Drafts.update({_id: doc_id}, {$set: {style: style}});
        textarea.attr('style', style)
      else if buttonClicked.id is "aligntoright"
        console.log 'Need aligntoright'
        style = "font-family:" + textarea.css("font-family") + ";font-size:" + textarea.css("font-size") +
        ";text-align:right"+";background: " + textarea.css("background") + ";padding-left:" + textarea.css("padding-left") + ";padding-right:" + textarea.css("padding-right") + ";color:" + textarea.css("color") + ";height:"+
        textarea.css('height')+";"
        Drafts.update({_id: doc_id}, {$set: {style: style}});
        textarea.attr('style', style)
      else if buttonClicked.id is "font-normal"
        console.log 'Need font-normal'
        style = 'font-family:;font-size:large' + ';text-align:' + textarea.css('text-align')+';'
        textarea.attr('style', style)
        #Compute the new scrollHeight
        grid_size=Math.floor($('#display').width()/6 - 10);
        min_widget_height = (5 * 2) + grid_size;
        $(textarea).css('height', 'auto');
        scrollHeight = document.getElementById(node.id+"TextArea").scrollHeight
        $(textarea).css('height', scrollHeight);
        sizey = Math.ceil((scrollHeight+10)/min_widget_height)
        resizeItem = $('#'+node.id)
        orig_sizey = parseInt(resizeItem.attr("data-sizey"))
        if sizey isnt orig_sizey
          height = sizey*min_widget_height - 10
          resizeItem.css("height", height)
          $(node).css('height', "")
          sizex = parseInt(resizeItem.attr("data-sizex"))
          gridster.resize_widget(resizeItem, sizex,sizey)
        Drafts.update({_id: doc_id}, {$set: {style: style}})
      else if buttonClicked.id is "font-quato"
        console.log 'Need font-quato'
        style = "font-family:Times New Roman, Times, serif" + ';font-size:15px' +
        ';text-align:'+ textarea.css('text-align')+
        ';background: #F5F5F5;padding-left:3%;padding-right:3%;color:grey;height:'+
        textarea.css('height')+";"
        textarea.attr('style', style)
        #Compute the new scrollHeight
        grid_size=Math.floor($('#display').width()/6 - 10);
        min_widget_height = (5 * 2) + grid_size;
        scrollHeight = document.getElementById(node.id+"TextArea").scrollHeight
        $(textarea).css('height', 'auto').css('height', scrollHeight);
        sizey = Math.ceil((scrollHeight+10)/min_widget_height)
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
      insertedObj = Blaze.getData(node)
      type = insertedObj.type
      if type == "text"
          if grid != undefined
            if window.unSelectedElem
              insert_row = parseInt($(window.unSelectedElem).attr('data-row'))
              window.unSelectedElem = undefined
              console.log('Selected data-row is ' + insert_row)
              grid.add_widget(node, 6, 1, 1, insert_row)
            else if insertedObj.toTheEnd
              grid.add_widget(node, 6, 1, 1)
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
            grid_size=Math.floor($('#display').width()/6 - 10);

            min_widget_height =  grid_size + 10;
            #offset = this.offsetHeight - this.clientHeight;
            $(this).css('height', 'auto').css('height', this.scrollHeight);

            sizey = Math.ceil((this.scrollHeight+10)/min_widget_height)

            resizeItem = $('#'+id)
            #resizeItem.css("height", this.scrollHeight)
            orig_sizey = parseInt(resizeItem.attr("data-sizey"))
            if gridster? and sizey isnt orig_sizey
              $(this).css('height', "")
              sizex = parseInt(resizeItem.attr("data-sizex"))
              gridster.resize_widget(resizeItem, sizex,sizey)
              console.log('propertychange sizey:'+ sizey + 'height:' +height + 'scrollHeight:'+this.scrollHeight)

            height = sizey*min_widget_height - 10
            resizeItem.css("line-height", height+'px')
          )
          text = insertedObj.text
          if text and text isnt ''
            Meteor.defer ()->
              $('#'+node.id+'TextArea').trigger('keyup')
      else if type == "image"
          if grid != undefined
            # Images loaded during rendering
            if Session.get('NewImgAdd') is 'true'
              if (window.imageCounter2 % 3) is 0
                grid.add_widget(node, 6, 3,1,window.insertRow)
                window.insertRow +=3
              else if (window.imageCounter2 % 3) is 1
                grid.add_widget(node, 3, 3,1,window.insertRow)
              else
                grid.add_widget(node, 3, 3,4,window.insertRow)
                window.insertRow +=3
              window.imageCounter2++
            # Images to be inserted before the element
            else if window.unSelectedElem
              currentCount = node.$blaze_range.view.parentView.dataVar.curValue.currentCount
              totalCount = node.$blaze_range.view.parentView.dataVar.curValue.totalCount
              console.log("Now painting currentCount is " + currentCount + " totalCount is " + totalCount)
              if currentCount is 1
                insert_row = parseInt($(window.unSelectedElem).attr('data-row'))
                insert_col = parseInt($(window.unSelectedElem).attr('data-col'))
                insert_sizex = parseInt($(window.unSelectedElem).attr('data-sizex'))
                insert_sizey = parseInt($(window.unSelectedElem).attr('data-sizey'))
                if insert_col is 1
                  window.nextCol = 4
                  insert_sizex = 3
                  insert_sizey = 3
                  window.nextRow = insert_row
                else
                  window.nextCol = 1
                  insert_sizey = 3
                  window.nextRow = insert_row + 3
              else
                insert_sizex = 3
                insert_sizey = 3
                insert_col = window.nextCol
                insert_row = window.nextRow
                if insert_col is 1
                  window.nextCol = 4
                else
                  window.nextCol = 1
                  window.nextRow = insert_row + 3
              if currentCount >= totalCount
                window.unSelectedElem = undefined
              grid.add_widget(node, insert_sizex, insert_sizey, insert_col, insert_row)
            # To be inserted at the end of the screen.
            else if insertedObj.toTheEnd
              grid.add_widget(node, 6, 6)
            # To be inserted on the middle of screen.
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
            #Template.addPost.__helpers.get('saveDraft')()
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
              image = $(node).find('img').attr("src")
              #style = Drafts.findOne({_id:node.id}).style
              style = $('#'+node.id).getStyleProp();
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
                callback: ()->
                  console.log("crop-img width="+$("#default"+node.id+" .crop-img").width()+", scale="+scale)
                  console.log("crop-img width="+$("#default"+node.id+" .crop-img").height())
                  Session.set 'imgSizeW',$("#default"+node.id+" .crop-img").width()/scale
                  Session.set 'imgSizeH',$("#default"+node.id+" .crop-img").height()/scale
              }
              if window.device.model is "iPhone7,1"
                top = $('#'+node.id).offset().top
                $('#blur_overlay').css('height',top)
                $('#blur_overlay').css('z-index', 14)
                height = $('#'+node.id).height()
                bottomTop = top + height
                $('#blur_bottom').css('top',bottomTop)
                docHeight = window.getDocHeight()
                bottomHeight = docHeight - bottomTop
                $('#blur_bottom').css('height',bottomHeight)
                
                $('#blur_left').css('top',top)
                $('#blur_right').css('top',top)
                $('#blur_left').css('height',height)
                $('#blur_right').css('height',height)
                
                left = $('#'+node.id).offset().left
                $('#blur_left').css('width',left)
                screenWidth = window.screen.width
                width = $('#'+node.id).width()
                right = screenWidth - left - width
                $('#blur_right').css('width',right)
                
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

              #Meteor.setTimeout ->
              #  console.log("crop-img width="+$("#default"+node.id+" .crop-img").width()+", scale="+scale)
              #  console.log("crop-img width="+$("#default"+node.id+" .crop-img").height())
              #  Session.set 'imgSizeW',$("#default"+node.id+" .crop-img").width()/scale
              #  Session.set 'imgSizeH',$("#default"+node.id+" .crop-img").height()/scale
              #,300
            return
      return


    this.find('#display')._uihooks = {
      insertElement: (node, next)->
        #console.log('Inserted node id is ' + node.id);
        $(node).insertBefore(next)

        Deps.afterFlush ->
          initToolBar(node, gridster)
          type = Blaze.getData(node).type
          if type == "text" and (!Blaze.getData(node).noKeyboardPopup)
            $(node).trigger("toolbarItemClick", {id:"modify"})
    }

    $("#display").find('.resortitem').each( ( i, itemElem )->
      initToolBar(itemElem, undefined)
    )

    base_size=Math.floor($('#display').width()/6 - 10);
    test = $("#display");
    `gridster = test.gridster({serialize_params: function ($w, wgd) {
      return {
        id: wgd.el[0].id,
        col: wgd.col,
        row: wgd.row,
        size_x: wgd.size_x,
        size_y: wgd.size_y
      };
    }, widget_base_dimensions: [base_size, base_size],widget_margins: [5, 5], min_cols: 3, max_cols:6, resize: {enabled: true, max_size: [9,9], min_size: [2, 2], start: function(e, ui, $widget) {

      }, stop: function(e, ui, $widget) {
        //$widget.actImageFitCover(e, ui, $widget);
        //console.log("stop width:"+ $widget.width())
        var scale = $widget.actImageFitCover('cropStyle');
        Drafts.update({_id: $widget.attr('id')}, {$set: {scale:scale}});
        return;
      }, resize: function(e, ui, $widget) {
        //$widget.actImageFitCover(e, ui, $widget);
        //console.log("resize width:"+ $widget.width())
        $widget.actImageFitCover('cropStyle');
    }
    }}).data('gridster');`
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
    progressBarWidth:->
      Session.get('importProcedure')
    displayUrl:->
      if Drafts.findOne({type:'image'}) and Drafts.findOne({type:'image'}).url and Drafts.findOne({type:'image'}).url isnt ''
        ""
      else
        "display:none"
    linkUrl:->
      if Drafts.find({type:'image'}).count() > 0
        Drafts.find({type:'image'}).fetch()[0].url
    cancelDraftChange:->
      if TempDrafts.find({}).count() is 0
        return
      TempDraftData = TempDrafts.find({}).fetch()[0]
      try
        if SavedDrafts.find({_id:draftId}).count() > 0
          SavedDrafts.update(
            {_id:TempDraftData._id},
            {$set:{
              pub:TempDraftData.pub,
              title:TempDraftData.title,
              addontitle:TempDraftData.addontitle,
              mainImage: TempDraftData.mainImage,
              fromUrl: TempDraftData.fromUrl,
              mainText: TempDraftData.mainText,
              owner:TempDraftData.owner,
              createdAt: TempDraftData.createAt,
            }}
          )
        else
          SavedDrafts.insert {
            _id:TempDraftData._id,
            pub:TempDraftData.pub,
            title:TempDraftData.title,
            addontitle:TempDraftData.addontitle,
            fromUrl:TempDraftData.fromUrl,
            mainImage: TempDraftData.mainImage,
            mainText: TempDraftData.mainText,
            owner:TempDraftData.owner,
            createdAt: TempDraftData.createdAt,
          }
      catch error
        console.log("Insert SavedDrafts error! Try update it...");
        SavedDrafts.update(
          {_id:TempDraftData._id},
          {$set:{
            pub:TempDraftData.pub,
            title:TempDraftData.title,
            addontitle:TempDraftData.addontitle,
            fromUrl:TempDraftData.fromUrl,
            mainImage: TempDraftData.mainImage,
            mainText: TempDraftData.mainText,
            owner:TempDraftData.owner,
            createdAt: TempDraftData.createdAt,
          }}
        )
      TempDrafts.remove {owner: Meteor.userId()}
      return
    saveDraft:->
        layout = JSON.stringify(gridster.serialize())
        pub=[]
        title = $("#title").val()
        console.log "title = " + title
        #if title is ''
        #  title = '[空标题]'
#        if title is ''
#          window.plugins.toast.showShortBottom('请为您的故事加个标题')
#          return
        addontitle = $("#addontitle").val()
        draftData = Drafts.find().fetch()
        draftId = draftData[0]._id;
        for i in [0..(draftData.length-1)]
          if i is 0
            if draftData[i].URI isnt '' and device.platform is 'Android'
              mainImage = draftData[i].URI
            else
              mainImage = draftData[i].imgUrl
            mainText = $("#"+draftData[i]._id+"text").val()

          json = jQuery.parseJSON(layout);
          for item in json
            if item.id is draftData[i]._id
              draftData[i].data_row = item.row
              draftData[i].data_col = item.col
              draftData[i].data_sizex = item.size_x
              draftData[i].data_sizey = item.size_y
          if draftData[i].URI isnt '' and device.platform is 'Android'
            draftData[i].imgUrl = draftData[i].URI
          pub.push(draftData[i])

        sortBy = (key, a, b, r) ->
          r = if r then 1 else -1
          return -1*r if a[key] and b[key] and a[key] > b[key]
          return +1*r if a[key] and b[key] and a[key] < b[key]
          return +1*r if a[key] is undefined and b[key]
          return -1*r if a[key] and b[key] is undefined
          return 0
        pub.sort((a, b)->
          sortBy('data_row', a, b)
        )
          #pub.push {
          #  _id: draftData[i]._id,
          #  type: draftData[i].type,
          #  imgUrl:draftData[i].imgUrl,
          #  filename: draftData[i].filename,
          #  URI: draftData[i].URI,
          #  layout: draftData[i].layout
          #}
        fromUrl = ''
        if Drafts.find({type:'image'}).count() > 0
          url = Drafts.find({type:'image'}).fetch()[0].url
        if url and url isnt ''
          fromUrl = url
        try
          if SavedDrafts.find({_id:draftId}).count() > 0
            SavedDrafts.update(
              {_id:draftId},
              {$set:{
              pub:pub,
              title:title,
              addontitle:addontitle,
              mainImage: mainImage,
              fromUrl: fromUrl,
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
              fromUrl:fromUrl,
              mainImage: mainImage,
              mainText: mainText,
              owner:Meteor.userId(),
              createdAt: new Date(),
            }
        catch error
          console.log("Insert SavedDrafts error! Try update it...");
          SavedDrafts.update(
              {_id:draftId},
              {$set:{
              pub:pub,
              title:title,
              addontitle:addontitle,
              fromUrl:fromUrl,
              mainImage: mainImage,
              mainText: mainText,
              owner:Meteor.userId(),
              createdAt: new Date(),
              }}
            )
        #Drafts.remove {owner: Meteor.userId()}
        #history.back()
        #PUB.back()
        return
    showPostFooter:->
      if Session.get('isReviewMode') is '2' or Session.get('isReviewMode') is '0'
        if Session.get('textareaFocused') is false
          console.log("showPostFooter true")
          true
        else
          console.log("showPostFooter false")
          false
      else
        console.log("showPostFooter false")
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
          #Posts.find({_id:draftId}).fetch()[0]
          post = Session.get("postContent")
          draftTitles = {}
          if post?
            draftTitles.title = post.title
            draftTitles.addontitle = post.addontitle
          draftTitles
        else if Session.get('isReviewMode') is '1' or Session.get('isReviewMode') is '0' or Session.get('isReviewMode') is '3'
          draftTitles = SavedDrafts.find({_id:draftId}).fetch()[0]
          if !draftTitles?
            draftTitles = {}
            #draftTitles.title = Session.get 'draftTitle'
            #draftTitles.addontitle = Session.get 'draftAddontitle'
            draftTitles.title = $("#title").val()
            draftTitles.addontitle = $("#addontitle").val()
            console.log("draftTitles.title="+draftTitles.title+", draftTitles.addontitle="+draftTitles.addontitle);
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
        for i in [1..(Drafts.find({}).count()-1)]
          Drafts.find({}).fetch()[i]

    items:()->
      if Drafts.find({type:'image'}).count() > 1
        for i in [1..(Drafts.find({type:'image'}).count()-1)]
          Drafts.find({type:'image'}).fetch()[i]
    texts:()->
      if Drafts.find({type:'text'}).count() > 1
        for i in [1..(Drafts.find({type:'text'}).count()-1)]
          Drafts.find({type:'text'}).fetch()[i]
  insertLink = (linkInfo,mainImageUrl,found,inputUrl)->
    if mainImageUrl
      timestamp = new Date().getTime()
      if Drafts.find({type:'image'}).count() > 0
        Drafts.update({_id:Drafts.find({type:'image'}).fetch()[0]._id},{$set:{url:inputUrl}})
      Drafts.insert {
        type:'image',
        isImage:true,
        siteTitle:linkInfo.title,
        siteHost:linkInfo.host,
        owner: Meteor.userId(),
        imgUrl:mainImageUrl,
        filename:Meteor.userId()+'_'+timestamp+ '_' + mainImageUrl.replace(/^.*[\\\/]/, ''),
        URI:mainImageUrl,
        url:inputUrl
        toTheEnd: true,
        data_row:'1',
        data_col:'3',
        data_sizex:'6',
        data_sizey:'5'}
  insertDownloadedImage = (linkInfo,imageExternalURL,found,inputUrl,file)->
    if file
      timestamp = new Date().getTime()
      if Drafts.find({type:'image'}).count() > 0
        Drafts.update({_id:Drafts.find({type:'image'}).fetch()[0]._id},{$set:{url:inputUrl}})
      if isIOS
        imgUrl = 'cdvfile://localhost/persistent/'+file.name
      Drafts.insert {
        type:'image',
        isImage:true,
        siteTitle:linkInfo.title,
        siteHost:linkInfo.host,
        owner: Meteor.userId(),
        imgUrl:'cdvfile://localhost/persistent/'+file.name,
        filename:file.name,
        URI:file.toURL(),
        url:inputUrl,
        toTheEnd: true,
        data_row:'1',
        data_col:'3',
        data_sizex:'6',
        data_sizey:'5'}
  insertDefaultImage = (linkInfo,mainImageUrl,found,inputUrl)->
    if mainImageUrl
      timestamp = new Date().getTime()
      if Drafts.find({type:'image'}).count() > 0
        Drafts.update({_id:Drafts.find({type:'image'}).fetch()[0]._id},{$set:{url:inputUrl}})
      Drafts.insert {
        type:'image',
        isImage:true,
        siteTitle:linkInfo.title,
        siteHost:linkInfo.host,
        owner: Meteor.userId(),
        imgUrl:mainImageUrl,
        filename:mainImageUrl,
        URI:mainImageUrl,
        url:inputUrl,
        toTheEnd: true,
        data_row:'1',
        data_col:'3',
        data_sizex:'6',
        data_sizey:'5'}
      #if data.title
      #Drafts.insert {type:'text', isImage:false, owner: Meteor.userId(), text:data.title, style:'', data_row:'1', data_col:'3',  data_sizex:'6', data_sizey:'1'}

  processReadableText=(data)->
    fullText = ''
    if data.fullText
      fullText = data.fullText
    else
      documentBody = $.parseHTML( data.body )
      documentBody.innerHTML = data.body
      documentBody.innerHTML.length = data.bodyLength
      extracted = extract(documentBody)
      fullText = $(extracted).text()
      console.log 'Extracted is ' + toDisplay
    if fullText and fullText isnt ''
      toDisplay = fullText.substring(0, 200)
      toDisplay += ' ...'
      Drafts.insert {type:'text', toTheEnd:true ,isImage:false, owner: Meteor.userId(), text:toDisplay, fullText:fullText, style:'', data_row:'1', data_col:'3',  data_sizex:'6', data_sizey:'1'}
    processTitleOfPost(data)
  processTitleOfPost=(data)->
    if data.title
      console.log 'Title is ' + data.title
      Session.set('importProcedure',100)
      Meteor.setTimeout ()->
        unless ($('#title').val() and $('#title').val() isnt '')
          $('#title').val(data.title)
          $('#title').trigger('keyup')
        unless ($('#addontitle').val() and $('#addontitle').val() isnt '')
          $('#addontitle').val(data.host)
      ,1000
  renderResortedArticle = (data,inputUrl,resortedObj)->
    if Session.get('cancelImport')
      Session.set('importProcedure',100)
      console.log('User canceled the url importing by click on the cancel button')
      return
    if (resortedObj.index < resortedObj.length)
      percentage = 5 + Math.round(94*(resortedObj.index/resortedObj.length))
      Session.set('importProcedure',percentage)
      console.log('Index ' + resortedObj.index + '@ ' + Session.get('importProcedure')+'%')
      item = data.resortedArticle[resortedObj.index]
      if item.type is 'text'
        console.log('Processing Text')
        Drafts.insert {type:'text', toTheEnd:true ,noKeyboardPopup:true,isImage:false, owner: Meteor.userId(), text:item.text, style:'', data_row:'1', data_col:'3',  data_sizex:'6', data_sizey:'1'}
        if ++resortedObj.index < resortedObj.length
          renderResortedArticle(data,inputUrl,resortedObj)
        else
          processTitleOfPost(data)
      else if item.type is 'image'
        console.log('Processing Image ' + item.imageUrl)
        if item.imageUrl and item.imageUrl isnt '' and (item.imageUrl isnt resortedObj.mainUrl)
          imageArray = []
          imageArray.push(item.imageUrl)
          seekSuitableImageFromArrayAndDownloadToLocal imageArray,(file,w,h,found,index,total,source)->
            if file
              insertDownloadedImage(data,source,found,inputUrl,file)
            if ++resortedObj.index < resortedObj.length
              renderResortedArticle(data,inputUrl,resortedObj)
            else
              processTitleOfPost(data)
          ,150,true
        else
          if ++resortedObj.index < resortedObj.length
            renderResortedArticle(data,inputUrl,resortedObj)
          else
            processTitleOfPost(data)
  @getURL = (e) ->
    inputUrl = e.url
    console.log "input url: " + inputUrl
    if inputUrl && inputUrl isnt ''
      Session.set('lastImportedUrl',inputUrl)
      if Session.get("channel") isnt 'addPost'
        prepareToEditorMode()
        PUB.page '/add'
      Session.set('importProcedure',1)
      Session.set('cancelImport',false)
      popupProgressBar = $('.importProgressBar').bPopup
        positionStyle: 'absolute'
        position: [0, 0]
        onOpen: ()->
          $(this).find('#cancelImport').on('click',()->
            console.log('Clicked on cancelImport button')
            Session.set('cancelImport',true)
            popupProgressBar.close()
            $('.modal-backdrop.in').remove()
            if Drafts.find().count() < 1
              Router.go('/')
          )
        onClose: ()->
          Session.set('importProcedure',0)
          $(this).find('#cancelImport').off('click')
          $(this).find('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
      Tracker.autorun (handler)->
        $('.importProgressBar').find('.progress-bar').css('width', Session.get('importProcedure')+'%').attr('aria-valuenow', Session.get('importProcedure'));
        if Session.equals('importProcedure',100)
          popupProgressBar.close()
          handler.stop()
      getContentListsFromUrl iabHandle,inputUrl,(data)->
        if data is null
          console.log('AnalyseUrl error, need add error notification')
          return
        console.log('Got data')
        Session.set('NewImgAdd',false)
        resortObj = {}
        seekOneUsableMainImage(data,(file,w,h,found,index,total,source)->
            console.log('found ' + found + ' index ' + index + ' total ' + total + ' fileObject ' + file + ' source ' + source )
            Session.set('importProcedure',5)
            if file
              insertDownloadedImage(data,source,found,inputUrl,file)
              resortObj.mainUrl = source
            else
              insertDefaultImage(data,'http://data.tiegushi.com/res/defaultMainImage1.jpg',false,inputUrl)
            if data.resortedArticle.length > 0
              resortObj.index = 0
              resortObj.length = data.resortedArticle.length
              console.log('resortObj' + JSON.stringify(resortObj))
              renderResortedArticle(data,inputUrl,resortObj)
            else
              processTitleOfPost(data)
          ,200)
    else
      PUB.toast('请粘贴需要引用的链接')
  @handleExitBrowser = ()->
    window.iabHandle = null
  @handleHideBrowser = ()->
    if Session.get("channel") is 'addPost' and Drafts.find().count() is 0
      Router.go '/'
  @handleAddedLink = (url)->
    if iabHandle
      iabHandle.removeEventListener 'import',getURL
      #iabHandle.removeEventListener 'exit',handleExitBrowser
      iabHandle.removeEventListener 'hide',handleHideBrowser
    if url and url isnt ''
      window.iabHandle = window.open(url, '_blank', 'hidden=no,toolbarposition=top')
    else
      window.iabHandle = window.open('', '_blank', 'hidden=no,toolbarposition=top')
    iabHandle.addEventListener 'import',getURL
    #iabHandle.addEventListener 'exit',handleExitBrowser
    iabHandle.addEventListener 'hide',handleHideBrowser
  Template.addPost.events
    ###
    'click #ViewOnWeb' :->
      if Drafts.find({type:'image'}).count() > 0
        url = Drafts.find({type:'image'}).fetch()[0].url
        if url and url isnt ''
          handleAddedLink(url)
    ###
    'beUnSelected .resortitem': (e)->
      if window.footbarOppration
        window.unSelectedElem = e.currentTarget
        window.footbarOppration = false
    #'beSelected .resortitem':->
    # console.log('.resortItem seleted')
    'focus [name=textareatitle]':->
      Session.set('textareaFocused', true)
      $(".head").css 'position','absolute'
    'blur [name=textareatitle]':->
      Session.set('textareaFocused', false)
      $(".head").css 'position','fixed'
    'change [name=textarea]' : (e,cxt)->
      console.log("textarea change "+ e.currentTarget.value)
      Drafts.update({_id: this._id}, {$set: {text: e.currentTarget.value}});
    'click #addLink': ()->
      console.log 'Add Link ' + Session.get('lastImportedUrl')
      handleAddedLink(Session.get('lastImportedUrl'))
    'click #takephoto': ()->
      if Drafts.find().count() > 0
        window.footbarOppration = true
        if window.takePhoto
          window.takePhoto (result)->
            console.log 'result from camera is ' + JSON.stringify(result)
            if result
              Drafts.insert {type:'image', currentCount:1, totalCount:1,isImage:true, owner: Meteor.userId(),imgUrl:result.smallImage, filename:result.filename, URI:result.URI, data_row:'1', data_col:'3', data_sizex:'3', data_sizey:'3'}

    'click #addmore':->
      window.footbarOppration = true
      #uploadFile (result)->
      Session.set 'draftTitle',''
      Session.set 'draftAddontitle',''
      Session.set('NewImgAdd','false')
      selectMediaFromAblum(20, (cancel, result,currentCount,totalCount)->
        if cancel
          if Drafts.find().count() is 0
            PUB.back()
          return
        if result
          #console.log 'upload success: url is ' + result
          #Drafts.insert {owner: Meteor.userId(), imgUrl:result}
          console.log 'Current Count is ' + currentCount + ' Total is ' + totalCount
          console.log 'image url is ' + result.smallImage
          Drafts.insert {type:'image', currentCount:currentCount, totalCount:totalCount,isImage:true, owner: Meteor.userId(),imgUrl:result.smallImage, filename:result.filename, URI:result.URI, data_row:'1', data_col:'3', data_sizex:'3', data_sizey:'3'}
          if (currentCount >= totalCount)
            Meteor.setTimeout ()->
              Template.addPost.__helpers.get('saveDraft')()
            ,100
      )
      return
    'click #addText':->
      window.footbarOppration = true
      Drafts.insert {type:'text', isImage:false, owner: Meteor.userId(), text:'', style:'', data_row:'1', data_col:'3',  data_sizex:'6', data_sizey:'1'}
      return
    'click .back':(event)->
      Drafts.remove {owner: Meteor.userId()}
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
        if r isnt 2
          return
        Session.set 'isReviewMode','1'
        #Delete it from SavedDrafts
        draftData = Drafts.find().fetch()
        draftId = draftData[0]._id
        SavedDrafts.remove draftId
        #Clear Drafts
        Drafts.remove {owner: Meteor.userId()}
        $('.addPost').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
          PUB.back()
        ,animatePageTrasitionTimeout
        return
      , '删除草稿', ['取消','确定']);

      return
    'click .cancle':->
      if TempDrafts.find({}).count()>0
        navigator.notification.confirm('这个操作无法撤销', (r)->
          console.log('r is ' + r)
          if r isnt 1
            return
          Session.set 'isReviewMode','1'
          Template.addPost.__helpers.get('cancelDraftChange')()
          #Clear Drafts
          Drafts.remove {owner: Meteor.userId()}
          TempDrafts.remove {owner: Meteor.userId()}
          $('.addPost').addClass('animated ' + animateOutUpperEffect);
          Meteor.setTimeout ()->
            Router.go('/')
          ,animatePageTrasitionTimeout
          return
        , '您确定要放弃未保存的修改吗？', ['放弃修改','继续编辑']);
      else
        navigator.notification.confirm('这个操作无法撤销', (r)->
          console.log('r is ' + r)
          if r isnt 1
            return
          Session.set 'isReviewMode','1'
          #Delete it from SavedDrafts
          draftData = Drafts.find().fetch()
          if draftData[0] and draftData[0]._id
            draftId = draftData[0]._id
            SavedDrafts.remove draftId
          #Clear Drafts
          Drafts.remove {owner: Meteor.userId()}
          $('.addPost').addClass('animated ' + animateOutUpperEffect);
          Meteor.setTimeout ()->
            Router.go('/')
          ,animatePageTrasitionTimeout
          return
        , '您确定要删除未保存的草稿吗？', ['删除故事','继续创作']);
    'click .cancleCrop':->
      $('#blur_overlay').css('height','')
      $('#blur_bottom').css('height','')
      $('#blur_left').css('height','')
      $('#blur_right').css('height','')
      cropDraftId = Session.get('cropDraftId')
      
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
    'click #cropDone':->
      $('#blur_overlay').css('height','')
      $('#blur_bottom').css('height','')
      $('#blur_left').css('height','')
      $('#blur_right').css('height','')
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
      
      w1 = $("#default"+cropDraftId+" .crop-img").css('width')
      h1 = $("#default"+cropDraftId+" .crop-img").css('height')
      l1 = $("#default"+cropDraftId+" .crop-img").css('left')
      t1 = $("#default"+cropDraftId+" .crop-img").css('top')
      cw = $("#default"+cropDraftId).width()
      ch = $("#default"+cropDraftId).height()

      style2 = "height:" + h1 + ';width:' + w1 + ';top:' + t1 + ';left:' + l1 + ';h_width:' + cw + ';h_height:' + ch + ';'

      style = "height:" + img_height + ';width:' + img_width + ';top:' + img_top + ';left:' + img_left + ';'
      console.log style
      zoom = $("#default"+cropDraftId).find('input')
      Drafts.update({_id: cropDraftId}, {$set: {style: style, scale:zoom.val(), style2:style2}});
      #update the style to the other image, or else there is a photo move after crop done.
      imgs = $('#isImage'+cropDraftId).find('img')
      img = $(imgs[0])
      img.attr('style', 'width:100%; height:100%;position:absolute;'+style);
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
      Template.addPost.__helpers.get('saveDraft')()
      Drafts.remove {owner: Meteor.userId()}
      TempDrafts.remove {owner: Meteor.userId()}
      history.back()
      #PUB.back()

      
    'click #publish':->
      if Meteor.user() is null
        window.plugins.toast.showShortBottom('请登录后发表您的故事')
        Router.go('/user')
        false
      else
        layout = JSON.stringify(gridster.serialize())
        pub=[]
        title = $("#title").val()

        if title is '' or title is '[空标题]'
          $("#title").val('')
          window.plugins.toast.showShortBottom('请为您的故事加个标题')
          return

        addontitle = $("#addontitle").val()
        try
          ownerIcon = Meteor.user().profile.icon
        catch
          ownerIcon = '/userPicture.png'
        draftData = Drafts.find().fetch()
        postId = draftData[0]._id;
        fromUrl = draftData[0].url;

        #Save gridster layout first. If publish failed, we can recover the drafts
        for i in [0..(draftData.length-1)]
          if i is 0
            if draftData[i].imgUrl.toLowerCase().indexOf("http://") == -1 and draftData[i].imgUrl.toLowerCase().indexOf("https://") == -1
              mainImage = 'http://data.tiegushi.com/'+draftData[i].filename
            else
              mainImage = draftData[i].imgUrl
            mainImageStyle = draftData[i].style
            mainText = $("#"+draftData[i]._id+"text").val()
          else
            if draftData[i].isImage and draftData[i].imgUrl.toLowerCase().indexOf("http://") == -1 and draftData[i].imgUrl.toLowerCase().indexOf("https://") == -1
                draftData[i].imgUrl = 'http://data.tiegushi.com/'+draftData[i].filename
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
          return -1*r if a[key] and b[key] and a[key] > b[key]
          return +1*r if a[key] and b[key] and a[key] < b[key]
          return +1*r if a[key] is undefined and b[key]
          return -1*r if a[key] and b[key] is undefined
          return 0
        pub.sort((a, b)->
          sortBy('data_row', a, b)
        )
#       console.log "#####end" + pub

        #get the images to be uploaded
        draftImageData = Drafts.find({type:'image'}).fetch()
        draftToBeUploadedImageData = []
        for i in [0..(draftImageData.length-1)]
            if draftImageData[i].imgUrl.toLowerCase().indexOf("http://")>= 0 or draftImageData[i].imgUrl.toLowerCase().indexOf("https://")>= 0
                continue
            draftToBeUploadedImageData.push(draftImageData[i])
#       console.log "#####" + pub
        #uploadFileWhenPublishInCordova(draftToBeUploadedImageData, postId)
        #Don't add addpost page into history
        multiThreadUploadFileWhenPublishInCordova(draftToBeUploadedImageData, postId, (result, multiThreadsInfo)->
            if result is 'revoke code'
                #$("#title").val(title)
                #$("#addontitle").val(addontitle)
                Session.set 'draftTitle',title
                if addontitle?
                  console.log("addontitle is not null")
                else
                  console.log("addontitle is null")
                Session.set 'draftAddontitle',addontitle
                #Update the gridster layout first
                for i in [1..(draftData.length-1)]
                  #Drafts.update({_id: draftData[i]._id}, {$set: draftData[i]});
                  Drafts.update({_id: draftData[i]._id}, {$set: {data_row:draftData[i].data_row, data_col:draftData[i].data_col, data_sizex:draftData[i].data_sizex, data_sizey:draftData[i].data_sizey}});
                #PUB.back();
                return
            if result is null
                for i in [0..(draftData.length-1)]
                  uploadResult = false
                  for j in [0..(multiThreadsInfo.length-1)]
                    if draftData[i].filename is multiThreadsInfo[j].filename
                      if multiThreadsInfo[j].status is 1
                        uploadResult = true
                        break
                  if uploadResult
                    Drafts.update({_id: draftData[i]._id}, {$set: {imgUrl:draftData[i].imgUrl}});
                return
            Session.set 'draftTitle',''
            Session.set 'draftAddontitle',''
            console.log 'Full name is ' + Meteor.user().profile.fullname
            if Meteor.user().profile.fullname && (Meteor.user().profile.fullname isnt '')
              ownerName = Meteor.user().profile.fullname
            else
              ownerName = Meteor.user().username
            if Session.get('isReviewMode') is '2' or Posts.find({_id:postId}).count()>0
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
                      fromUrl: fromUrl,
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
                  fromUrl: fromUrl,
                  owner:Meteor.userId(),
                  ownerName:ownerName,
                  ownerIcon:ownerIcon,
                  createdAt: new Date(),
                }
                #Router.go('/posts/'+postId)
                #Delete from SavedDrafts if it is a saved draft.
            SavedDrafts.remove({_id:postId})
                #Delete the Drafts
            Drafts.remove({})
            TempDrafts.remove({})
            if Session.get('isReviewMode') is '2'
                Router.go('/posts/'+postId)
            else
                Session.set("TopicPostId", postId)
                Session.set("TopicTitle", title)
                Session.set("TopicAddonTitle", addontitle)
                Session.set("TopicMainImage", mainImage)
                Router.go('addTopicComment')
                #Router.go('/posts/'+postId)
        )
        return
    'click .remove':(event)->
      Drafts.remove this._id
    'click .imgContainer': (e)->
      if Session.get('isReviewMode') isnt '1'
        return
      swipedata = []
      selected = 0
      draftData = Drafts.find({type:'image'}).fetch()
      for i in [1..(draftData.length-1)]
        if draftData[i].imgUrl
          if draftData[i].imgUrl is this.imgUrl
            selected = i-1
          swipedata.push
            href: draftData[i].imgUrl
            title: draftData[i].text
      $.swipebox swipedata,{
        initialIndexOnArray: selected
        hideCloseButtonOnMobile : true
        loopAtEnd: false
      }
