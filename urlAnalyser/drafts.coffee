class @draftsClass
  _drafts = []
  _title = ''
  _addontitle = ''
  _successCallback = []
  
  constructor: (@id, @user)->
  
  _imageIndex = ()->
    if _drafts.length <= 0
      return -1
    for i in [0.._drafts.length-1]
      if _drafts[i].type is 'image'
        return i
    return -1
    
  onSuccess: (callback)->
    callback && _successCallback.push(callback)
  
  onFail: (callback)->
  
  itemProcessor: (item,callback)->
    if item.type is 'text'
      console.log('Processing Text')
      _drafts.push {type:'text', toTheEnd:true ,noKeyboardPopup:true,isImage:false, owner:@user._id,\
          text:item.text, style:'',layout:item.layout, data_row:'1', data_col:'3',  data_sizex:'6', data_sizey:'1'}
    else if item.type is 'image'
      console.log('Processing Image ' + item.imageUrl)
      self = this
      if item.imageUrl and item.imageUrl isnt ''
        imageArray = []
        imageArray.push(item.imageUrl)
        return seekSuitableImageFromArrayAndDownloadToLocal imageArray,(file,w,h,found,index,total,source)->
          if file
            @insertDownloadedImage(self.data,source,found,self.inputUrl,file,w,h)
          callback(null,item)
        ,150,true
    else if item.type is 'iframe'
      _drafts.push {
        type:'image',
        isImage:true,
        inIframe:true,
        owner: @user._id,
        toTheEnd: true,
        text:'您当前程序不支持视频观看',
        iframe: item.iframe,
        imgUrl:'http://data.tiegushi.com/res/video_old_version.jpg',
        data_row:'1',
        data_col:'3',
        data_sizex:'6',
        data_sizey:'4'}
    else if item.type is 'music'
      @insertMusicInfo(item.musicInfo)
    else if item.type is 'video'
      self = this
      if item.videoInfo.imageUrl
        imageArray = []
        imageArray.push(item.videoInfo.imageUrl)
        return seekSuitableImageFromArrayAndDownloadToLocal imageArray,(file,w,h,found,index,total,source)->
          if file
            item.videoInfo.imageUrl = 'cdvfile://localhost/persistent/'+file.name
            item.videoInfo.filename = file.name
            item.videoInfo.URI = file.toURL()
            @insertVideoWithDownloadedImage(item.videoInfo, self.data,source,found,self.inputUrl,file,w,h)
          else
            @insertVideoInfo(item.videoInfo)
          callback(null,item)
        ,1,true
      else
        @insertVideoInfo(item.videoInfo)
    Meteor.setTimeout ()->
      callback(null,item)
    ,10
    
  insertVideoWithDownloadedImage = (videoInfo, linkInfo,imageExternalURL,found,inputUrl,file,width,height)->
    if file
      sizey = Math.round( 6 * height / width )
      if sizey <= 0
        sizey = 1
      @insertVideoInfo(videoInfo, sizey.toString())
  
  insertVideoInfo: (videoInfo, sizey)->
    if sizey
      data_sizey = sizey
    else
      data_sizey = '4'
    console.log("data_sizey is "+data_sizey);
    _drafts.push {
      type:'video',
      owner: @user._id,
      toTheEnd: true,
      text:'来自故事贴',
      videoInfo: videoInfo
      data_row:'1',
      data_col:'3',
      data_sizex:'6',
      data_sizey:data_sizey}
    
  insertMusicInfo: (musicInfo)->
    _drafts.push {
      type:'music',
      owner: @user._id,
      toTheEnd: true,
      text:'您当前程序不支持音频播放，请分享到微信中欣赏',
      musicInfo: musicInfo
      data_row:'1',
      data_col:'3',
      data_sizex:'6',
      data_sizey:'1'}
  
  insertDownloadedImage: (linkInfo,imageExternalURL,found,inputUrl,file,width,height)->
    if file
      timestamp = new Date().getTime()
      if(_imageIndex() != -1)
        _drafts[_imageIndex()].url = inputUrl
      sizey = Math.round( 6 * height / width )
      if sizey <= 0
        sizey = 1
      #if sizey >= 12
      #  sizey = 12
      _drafts.push {
        type:'image',
        isImage:true,
        siteTitle:linkInfo.title,
        siteHost:linkInfo.host,
        owner: @user._id,
        imgUrl:'cdvfile://localhost/persistent/'+file.name,
        filename:file.name,
        URI:file.toURL(),
        url:inputUrl,
        toTheEnd: true,
        data_row:'1',
        data_col:'3',
        data_sizex:'6',
        data_sizey:sizey.toString()
      }
        
  insertDefaultImage: (linkInfo,mainImageUrl,found,inputUrl)->
    if mainImageUrl
      timestamp = new Date().getTime()
      if(_imageIndex() != -1)
        _drafts[_imageIndex()].url = inputUrl
      _drafts.push {
        type:'image',
        isImage:true,
        siteTitle:linkInfo.title,
        siteHost:linkInfo.host,
        owner: @user._id,
        imgUrl:mainImageUrl,
        filename:mainImageUrl,
        URI:mainImageUrl,
        url:inputUrl,
        toTheEnd: true,
        data_row:'1',
        data_col:'3',
        data_sizex:'6',
        data_sizey:'6'}
        
  renderResortedArticleAsync: (data,inputUrl,resortedObj)->
    resortedObj.itemProcessor = @itemProcessor
    resortedObj.data = data
    resortedObj.inputUrl = inputUrl
    async.mapLimit(data.resortedArticle,1,resortedObj.itemProcessor.bind(resortedObj),(err,results)->
      console.log('error ' + err)
      processTitleOfPost(data)
    )
    
  processTitleOfPost: (data)->
    if data.title
      console.log 'Title is ' + data.title
      unless (_title and _title isnt '')
        _title = data.title
      unless (_addontitle and _addontitle isnt '')
        _addontitle = ''
        
    for item in _successCallback
      item && item()
      
  getPubObject: ()->
    #layout = JSON.stringify(gridster.serialize())
    pub=[]
    addontitle = _addontitle
    title = _title

    modalUserId = @user._id
    ownerUser = @user

    try
      #ownerIcon = Meteor.user().profile.icon
      ownerIcon = ownerUser.profile.icon
    catch
      ownerIcon = '/userPicture.png'
    console.log 'Full name is ' + Meteor.user().profile.fullname
    #if Meteor.user().profile.fullname && (Meteor.user().profile.fullname isnt '')
    #  ownerName = Meteor.user().profile.fullname
    if ownerUser.profile.fullname && (ownerUser.profile.fullname isnt '')
      ownerName = ownerUser.profile.fullname
    else
      #ownerName = Meteor.user().username
      ownerName = ownerUser.username

    draftData = _drafts；
    postId = @id;
    fromUrl = draftData[0].url;

    #Save gridster layout first. If publish failed, we can recover the drafts
    for i in [0..(draftData.length-1)]
      if i is 0
        mainImage = draftData[i].imgUrl
        mainImageStyle = draftData[i].style
        #mainText = $("#"+draftData[i]._id+"text").val()
      else
  #for some case user did not save the draft, directly published, the layout does not stored.
        #json = jQuery.parseJSON(layout);
        # for item in json
        #   if item.id is draftData[i]._id
        #     draftData[i].data_row = item.row
        #     draftData[i].data_col = item.col
        #     draftData[i].data_sizex = item.size_x
        #     draftData[i].data_sizey = item.size_y
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
    
    return {
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
      publish:true,
      owner:ownerUser._id,
      ownerName:ownerName,
      ownerIcon:ownerIcon,
      createdAt: new Date(),
    }
  destroy: ()->
  