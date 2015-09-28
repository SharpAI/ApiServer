
window.newLayoutInstances = {}
window.newLayoutinitializing = {}
window.newLayoutImageInDownloading = 0
window.newLayoutWatchIdList = {}

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
  @initContainer = (layoutId)->
    container = '.newLayout_container_' + layoutId
    $container = $(container)
    elements = '.newLayout_element_'+layoutId
    $elements = $(elements)
    if $elements.length > 0 and $container.length > 0
      console.log('Got element ' + $elements.length)
      console.log('Initializing layout engine for id ' + layoutId);
      newInstance = new Wookmark(container, {
        autoResize: false,
        itemSelector: '.newLayout_element.loaded',
        itemWidth: 400, # Optional, the width of a grid item
        flexibleWidth: '48%',
        direction: 'left',
        align: 'center'
      },true)
      window.newLayoutInstances[layoutId] = newInstance
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
    if !window.newLayoutWatchIdList[id]
      $img = $element.find('img')
      src = $img.attr('src')
      $parent = $img.parent()
      newLayout.setRandomlyBackgroundColor($parent)
      watcher = scrollMonitor.create( $img, {top: 1600, bottom: 1600})
      window.newLayoutWatchIdList[id] = watcher
      watcher.enterViewport ()->
        console.log( 'I have entered the viewport ' + id + ' src: ' + src )
        unless $img.hasClass('entered')
          $img.addClass('entered')
        unless $img.is(':visible')
          #if $parent.width() and $parent.width() isnt ''
            #$img.attr('src',src)
          $img.show()
      #$parent[0].style.width=''
      #$parent[0].style.height=''
      watcher.exitViewport ()->
        console.log( 'I have left the viewport ' + id + ' src: ' + src );
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
    imgLoad.on( 'done', ()->
      console.log('DONE  - all images have been successfully loaded, total ' + DynamicMoments.find().count())
      newLayout.reduceDownloadingNumber()
      element.style.display = ""
      $element.css('opacity',0)
      $element.addClass('loaded')
      $container.append($element)
      img = $element.find('img')[0]
      console.log('image outside width is ' + img.offsetHeight)
      if img.offsetHeight is 0
        Meteor.setTimeout ()->
          console.log('Got error layout ' + img.offsetHeight);
          if img.offsetHeight is 0
            $element.remove()
          else
            layoutInstence.appendItem(element,(err)->
              console.log('Append Element success');
              newLayout.appendedItemCallback($element)
            );
        ,1000
        return
      layoutInstence.appendItem(element,(err)->
        console.log('Append Element success');
        newLayout.appendedItemCallback($element)
      );
    );
    imgLoad.on( 'fail', ()->
      console.log('FAIL - all images loaded, at least one is broken');
      newLayout.reduceDownloadingNumber()
      $element.remove()
    );
Template.newLayoutContainer.events =
  'click .newLayout_element':(e)->
    Session.set 'displayShowPostLeftBackBtn',true
    console.log('layoutId ' + this.displayId)
    postId = this.displayId
    scrollTop = $(window).scrollTop()
    if postId is undefined
      postId = this._id
    $(window).children().off()
    $(window).unbind('scroll')
    id = Session.get("postContent")._id
    #PUB.postPage(id,scrollTop)
    #Session.set("Social.LevelOne.Menu",'contactsList')
    Router.go '/redirect/'+postId
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
    if DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
      !(DynamicMoments.find({currentPostId:Session.get("postContent")._id}).count() < Session.get("momentsitemsLimit"))
    else
      false
Template.newLayoutContainer.onRendered ()->
  console.log('newLayoutContainer onRendered ' + JSON.stringify(this.data))
  if this.data and this.data.layoutId
    this.layoutId = this.data.layoutId
  unless window.newLayoutInstances[this.layoutId]
    newLayout.initContainer(this.layoutId)

Template.newLayoutContainer.onDestroyed ()->
  console.log('newLayoutContainer onDestroyed ' + JSON.stringify(this.data))
  delete window.newLayoutInstances[this.data.layoutId]
  $('.newLayout_element_'+this.data.layoutId).removeClass('loaded')

Template.newLayoutElement.onRendered ()->
  console.log('newLayoutElement onRendered ' + JSON.stringify(this.data))
  if this.data and this.data.layoutId
    this.layoutId = this.data.layoutId
  instance = window.newLayoutInstances[this.layoutId]
  container = '.newLayout_container_' + this.layoutId
  $container = $(container)
  if instance and $container.length > 0
    newLayout.processElement(this.firstNode,$container,instance)
  else
    newLayout.initContainer(this.layoutId)
Template.newLayoutElement.onDestroyed ()->
  console.log('newLayoutElement onDestroyed ' + this.data.displayId + ' data: ' + JSON.stringify(this.data))
  id = this.data.displayId
  if window.newLayoutWatchIdList[id]
    watcher = window.newLayoutWatchIdList[id]
    watcher.destroy()
    delete window.newLayoutWatchIdList[id]
  if this.data and this.data.layoutId
    instance = window.newLayoutInstances[this.data.layoutId]
    if instance
      console.log('Need remove item');
      $('.newLayout_element #'+id).removeClass('loaded');
      Meteor.setTimeout ()->
        instance.initItems();
        instance.layout(true);
      ,1000
