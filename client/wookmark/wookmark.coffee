
window.newLayoutInstances = {}
window.newLayoutinitializing = {}
window.newLayoutImageInDownloading = 0
window.newLayoutWatchIdList = {}
@wookmark_debug = false
predefineColors = [
  "#55303e",
  "#503f32",
  "#7e766c",
  "#291d13",
  "#d59a73",
  "#a87c5f",
  "#282632",
  "#ca9e92",
  "#a7a07d",
  "#846843",
  "#6ea89e",
  "#292523",
  "#637168",
  "#573e1b",
  "#925f3e",
  "#786b53",
  "#aaa489",
  "#a5926a",
  "#6a6b6d",
  "#978d69",
  "#a0a1a1",
  "#4b423c",
  "#5f4a36",
  "#b6a2a9",
  "#1c1c4e",
  "#e0d9dc",
  "#393838",
  "#c5bab3",
  "#a46d40",
  "#735853",
  "#3c3c39"
]
colorLength = predefineColors.length
colorIndex = 0

class @newLayout
  @setRandomlyBackgroundColor = ($node)->
    $node.css("background-color",predefineColors[colorIndex])
    if ++colorIndex >= colorLength
      colorIndex = 0
  @initContainer = (src, layoutId)->
    container = '.newLayout_container_' + src + '_' + layoutId
    $container = $(container)
    elements = '.newLayout_element_' + src + '_' + layoutId
    $elements = $(elements)
    if $elements.length > 0 and $container.length > 0
      wookmark_debug&&console.log('Got element ' + $elements.length)
      wookmark_debug&&console.log('Initializing layout engine for id ' + layoutId);
      newInstance = new Wookmark(container, {
        autoResize: false,
        itemSelector: '.newLayout_element_' +src+'_' + layoutId + '.loaded',
        itemWidth: 400, # Optional, the width of a grid item
        flexibleWidth: '48%',
        direction: 'left',
        align: 'center',
        onLayoutChanged: ()->
          if this.container and this.container.childElementCount is 0
            $(this.container).css({height: '0px'})
      },true)
      window.newLayoutInstances[src+'_'+layoutId] = newInstance
      $elements.each((index,element)->
        $(document).queue (next)->
          newLayout.processElement(element,$container,newInstance)
          next();
      )
  @reduceDownloadingNumber = ()->
    window.newLayoutImageInDownloading--;
    #To protect the exception which should never happened. But if so, the refresh maybe never triggered.
    window.newLayoutImageInDownloading = 0 if window.newLayoutImageInDownloading <0
    if window.newLayoutImageInDownloading is 0
      Session.set('newLayoutImageDownloading',false)
  @appendedItemCallback = ($element)->
    id = $element.attr('id')
    source = $element.attr('source')
    if !window.newLayoutWatchIdList[source+'_'+id]
      $img = $element.find('img')
      src = $img.attr('src')
      $parent = $img.parent()
      newLayout.setRandomlyBackgroundColor($parent)
      watcher = scrollMonitor.create( $img, {top: 1600, bottom: 1600})
      window.newLayoutWatchIdList[source+'_'+id] = watcher
      watcher.enterViewport ()->
        wookmark_debug&&console.log( 'I have entered the viewport ' + id + ' src: ' + src )
        unless $img.hasClass('entered')
          $img.addClass('entered')
        unless $img.is(':visible')
          #if $parent.width() and $parent.width() isnt ''
            #$img.attr('src',src)
          $img.show()
      #$parent[0].style.width=''
      #$parent[0].style.height=''
      watcher.exitViewport ()->
        wookmark_debug&&console.log( 'I have left the viewport ' + id + ' src: ' + src );
        if $img.hasClass('entered') and $img.is(':visible')
          width = $img.width()
          height = $img.height()
          $parent.width(width)
          $parent.height(height)
          #$img.attr('src',"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=")
          #$img.width(width)
          #$img.height(height)
          $img.hide()
    $element.css('opacity',1)
  @processElement = (element,$container,layoutInstence)->
    $element = $(element)
    $element.detach()
    imgLoad = imagesLoaded(element)
    window.newLayoutImageInDownloading++;
    Session.set('newLayoutImageDownloading',true)
    elemClass = $element.attr('class')
    imgLoad.on( 'done', ()->
      wookmark_debug&&console.log('DONE  - all images have been successfully loaded, total ' + NewDynamicMoments.find().count())
      newLayout.reduceDownloadingNumber()
      element.style.display = ""
      $element.css('opacity',0)
      $element.addClass('loaded')
      $container.append($element)
      img = $element.find('img')[0]

      wookmark_debug&&console.log('image outside width is ' + img.offsetHeight)
      if img.offsetHeight is 0
        setTimeout ()->
          wookmark_debug&&console.log('Got error layout ' + img.offsetHeight);
          if img.offsetHeight is 0
            $element.remove()
          else
            layoutInstence.appendItem(element,(err)->
              wookmark_debug&&console.log('Append Element success');
              newLayout.appendedItemCallback($element)
            );
        ,1000
        return
      layoutInstence.appendItem(element,(err)->
        wookmark_debug&&console.log('Append Element success');
        newLayout.appendedItemCallback($element)
      );
    );
    imgLoad.on( 'fail', ()->
      wookmark_debug&&console.log('FAIL - all images loaded, at least one is broken');
      newLayout.reduceDownloadingNumber()
      $element.remove()
    );
Template.newLayoutContainer.events =
  'click .newLayout_element':(e)->
    wookmark_debug&&console.log('layoutId ' + this.displayId)
    Session.set("historyForwardDisplay", false)
    postId = this.displayId
    if postId is undefined
      postId = this._id
    scrollTop = $(window).scrollTop()
    Session.set("lastPost",postId)
    $(window).children().off()
    $(window).unbind('scroll')
    if typeof PopUpBox isnt "undefined"
      PopUpBox.close()
      # $('.popUpBox, .b-modal').hide()
    Session.set("readMomentsPost",true);
    Router.go '/posts/'+postId
Template.newLayoutContainer.helpers =
  displayId:()->
    if this.data and this.data.displayId
      this.data.displayId
    else
      ''
  layoutId:()->
    if this.data and this.data.layoutId
      this.data.layoutId
    else
      ''
  moreResults:()->
    if NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
      !(NewDynamicMoments.find({currentPostId:Session.get("postContent")._id}).count() < Session.get("momentsitemsLimit"))
    else
      false
  src: ()->
    if this.data and this.data.src
      this.data.src
    else

Template.newLayoutContainer.onRendered ()->
  wookmark_debug&&console.log('newLayoutContainer onRendered ' + JSON.stringify(this.data))
  if this.data and this.data.layoutId
    this.layoutId = this.data.layoutId
  if this.data and this.data.src
    this.src = this.data.src
  unless window.newLayoutInstances[this.src+ '_' +this.layoutId]
    newLayout.initContainer(this.src, this.layoutId)

Template.newLayoutContainer.onDestroyed ()->
  wookmark_debug&&console.log('newLayoutContainer onDestroyed ' + JSON.stringify(this.data))
  delete window.newLayoutInstances[this.data.src+ '_' +this.data.layoutId]
  $('.newLayout_element_'+this.data.src+'_'+this.data.layoutId).removeClass('loaded')

Template.newLayoutElement.onRendered ()->
  wookmark_debug&&console.log('newLayoutElement onRendered ' + JSON.stringify(this.data))
  if this.data and this.data.layoutId
    this.layoutId = this.data.layoutId
  if this.data and this.data.src
    this.src = this.data.src
  instance = window.newLayoutInstances[this.src+'_'+this.layoutId]
  container = '.newLayout_container_' + this.src + '_' + this.layoutId
  $container = $(container)
  if instance and $container.length > 0
    newLayout.processElement(this.firstNode,$container,instance)
  else
    newLayout.initContainer(this.src, this.layoutId)
Template.newLayoutElement.onDestroyed ()->
  wookmark_debug&&console.log('newLayoutElement onDestroyed ' + this.data.displayId + ' data: ' + JSON.stringify(this.data))
  id = this.data.src + '_' +this.data.displayId
  if window.newLayoutWatchIdList[id]
    watcher = window.newLayoutWatchIdList[id]
    watcher.destroy()
    delete window.newLayoutWatchIdList[id]
  if this.data and this.data.layoutId
    instance = window.newLayoutInstances[this.data.src + '_' + this.data.layoutId]
    if instance
      wookmark_debug&&console.log('Need remove item');
      $('.newLayout_element_'+ this.data.src + '_' + this.data.layoutId + '#' + this.data.displayId).removeClass('loaded');
      setTimeout ()->
        instance.initItems();
        instance.layout(true);
      ,1000
Template.newLayoutElement.events
  'click .postAlreadyRead':(e)->
     console.log('Click on lpAlreadyRead '+this._id)
     console.log('Click on lpAlreadyRead '+this.readPostId)
     Session.setPersistent('hideSuggestPost_'+this.readPostId,true)
     return false
  'click .suggestAlreadyRead':(e)->
    console.log('Click on suggestAlreadyRead')
    Session.setPersistent('hideSuggestPost_'+this._id,true)
    return false