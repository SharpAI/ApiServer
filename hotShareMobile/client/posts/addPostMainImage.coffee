
if Meteor.isClient

  titleBorderColor = ()->
    if $("#title").is(':focus') is true and $("#title").css('border-color') is 'rgb(255, 255, 255)'
      $("#title").css('border-color', '#00c4ff')
    if $("#title").is(':focus') is false and $("#title").css('border-color') isnt 'rgb(255, 255, 255)'
      $("#title").css('border-color', 'rgb(255, 255, 255)')
    if $("#addontitle").is(':focus') is true and $("#addontitle").css('border-color') is 'rgb(255, 255, 255)'
      $("#addontitle").css('border-color', '#00c4ff')
    if $("#addontitle").is(':focus') is false and $("#addontitle").css('border-color') isnt 'rgb(255, 255, 255)'
      $("#addontitle").css('border-color', "rgb(255, 255, 255)")
    
  initMainImageToolBar = ()->
    $('.mainImage').toolbar
      content: '#mainImage-toolbar-options'
      position: 'bottom'
      hideOnClick: true
      $('.mainImage').on 'toolbarItemClick',(event,buttonClicked)->
        console.log $(buttonClicked).attr('id')
        console.log event.currentTarget.id
        if buttonClicked.id == "mainImageToolBar"
          pubImages=[]
          draftData = Drafts.find().fetch()
          for i in [0..(draftData.length-1)]
            if draftData[i].isImage is true
              doc = {
                imageId: draftData[i]._id,
                URI: draftData[i].URI,
                imgUrl: draftData[i].imgUrl,
                filename: draftData[i].filename
              }
              pubImages.push(doc)
          Session.set('pubImages',pubImages)
          $('body').attr('style', 'background-color:#fff;')
          $('.addPost').hide()
          $('.mainImagesList').show()
          
        else if buttonClicked.id == "modify"
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
                $('#mainImage'+mainImageDoc._id).attr('src','')
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
              scale = initScale * e.scale;
              if scale > 3
                scale = 3
              else if scale < 1
                scale = 1
              crop.slider(scale);
              #apply background color to range progress
              zoom.val(scale)
          )
        return
    return

  Template.addPostMainImage.onRendered ()->
    initMainImageToolBar()
    Meteor.setInterval ()->
        titleBorderColor()
      ,50
    $("#title").textareaAutoSize()
    $("#addontitle").textareaAutoSize()
  Template.addPostMainImage.helpers
    draftTitles:->
      mainImage= Drafts.findOne({type:'image'})
      if mainImage
        draftId = mainImage._id
        draftTitles = {}
        if draftId and draftId isnt ''
          if Session.get('isReviewMode') is '2'
            post = Session.get("postContent")
            if post?
              draftTitles.title = post.title
              draftTitles.addontitle = post.addontitle
            draftTitles
          else if Session.get('isReviewMode') is '1' or Session.get('isReviewMode') is '0' or Session.get('isReviewMode') is '3'
            draftTitles = SavedDrafts.findOne({_id:draftId})
            if !draftTitles?
              draftTitles = {}
              draftTitles.title = $("#title").val()
              draftTitles.addontitle = $("#addontitle").val()
              console.log("draftTitles.title="+draftTitles.title+", draftTitles.addontitle="+draftTitles.addontitle);
              draftTitles
      else
        draftTitles = {'title':'','addontitle':''}
      $("#title").trigger('input')
      $("#addontitle").trigger('input')
      draftTitles
    mainImage:->
      ReactiveVar(Drafts.findOne({type:'image'})).get()
    getImagePath: (path,uri,id)->
      getImagePath(path,uri,id)
    getMainImageHeight:()->
      $(window).height()*0.55