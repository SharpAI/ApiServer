importVideo = {
  clearEvent: function(){
    if(iabHandle){
      iabHandle.removeEventListener('loadstart', importVideo.stratEvent);
      iabHandle.removeEventListener('loadstop', importVideo.stopEvent);
      iabHandle.removeEventListener('loaderror', importVideo.errorEvent);
    }
  },
  stopEvent: function(e){
    if(!window.popupProgressBar)
      showPopupProgressBar();

    Session.set('importProcedure',4);

    var inputUrl = e.url;
    importVideo.clearEvent();
    popupProgressBar.close();

    if(!inputUrl)
      return window.plugins.toast.showLongCenter("请输入正确的URL地址!");

    getContentListsFromUrl(iabHandle,inputUrl,function(data){
      if(!Session.equals('cancelImport', true)){
        var video_info = null;

        if(data && data.resortedArticle && data.resortedArticle.length > 0){
          for(var i=0;i<data.resortedArticle.length;i++){
            if(data.resortedArticle[i].type === 'video'){
              video_info = data.resortedArticle[i];
              break;
            }
          }
        }

        if(!video_info && data && data.body)
          video_info = importVideo.getVideoByHtml(inputUrl, data);
        if(!video_info || !video_info.videoInfo){
          window.plugins.toast.showShortCenter("导入视频失败，如有需要请重新尝试~");
        }else{
          video_info.type = 'video';
          video_info.owner = Meteor.userId();
          video_info.text = '来自故事贴';
          video_info.data_row = '1';
          video_info.data_col = '3';
          video_info.data_sizex = '6';
          video_info.data_sizey = '4';
          video_info.toTheEnd = true;
          Drafts.insert(video_info);
        }
      }
    });
  },
  errorEvent: function(e){
    importVideo.clearEvent();
    window.plugins.toast.showShortCenter("导入视频失败，如有需要请重新尝试~");
  },
  stratEvent: function(e){
    Session.set('importProcedure',3);
  },
  getVideoByHtml: function(url, data){
    window.import_video_data = data;
    console.log('getVideoByHtml data:', data);
    var $video = $(data.body).find('video');
    if($video.length > 0 && $video[0].src){
      var video_info = {
        type:'video',
        videoInfo: {
          playUrl: $video[0].src,
          imageUrl: ''
        }
      };
      console.log('getVideoByHtml video:', video_info);
      return video_info;
    }

    return null;
  }
}