
window.newLayoutInstances = {}
window.newLayoutinitializing = {}
window.newLayoutImageInDownloading = 0

class newLayout
  @initContainer = (layoutId)->
    container = '.newLayout_container_' + layoutId
    $container = $(container)
    elements = '.newLayout_element_'+layoutId
    $elements = $(elements)
    if $elements.length > 0 and $container.length > 0
      console.log('Got element ' + $elements.length)
      console.log('Initializing layout engine for id ' + layoutId);
      newInstance = new Wookmark(container, {
        itemSelector: '.newLayout_element.loaded',
        itemWidth: 400, # Optional, the width of a grid item
        flexibleWidth: '48%',
        direction: 'left',
        align: 'center'
      })
      window.newLayoutInstances[layoutId] = newInstance
      Meteor.defer ()->
        $elements.each((index,element)->
          newLayout.processElement(element,$container,newInstance)
        )
  @reduceDownloadingNumber = ()->
    window.newLayoutImageInDownloading--;
    #To protect the exception which should never happened. But if so, the refresh maybe never triggered.
    window.newLayoutImageInDownloading = 0 if window.newLayoutImageInDownloading <0
    if window.newLayoutImageInDownloading is 0
      Session.set('newLayoutImageDownloading',false)
  @processElement = (element,$container,layoutInstence)->
    $element = $(element)
    $element.detach()
    imgLoad = imagesLoaded(element)
    window.newLayoutImageInDownloading++;
    Session.set('newLayoutImageDownloading',true)
    imgLoad.on( 'done', ()->
      console.log('DONE  - all images have been successfully loaded')
      newLayout.reduceDownloadingNumber()
      element.style.display = ""
      $element.addClass('loaded')
      $container.append($element)
      Meteor.defer ()->
        layoutInstence.initItems();
        layoutInstence.layout(true,()->
          console.log('Layout in Element success');
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
    PUB.postPage(id,scrollTop)
    Meteor.setTimeout ()->
      Session.set("Social.LevelOne.Menu",'contactsList')
      Router.go '/redirect/'+postId
    ,300
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
  console.log('newLayoutElement onDestroyed ' + JSON.stringify(this.data))
