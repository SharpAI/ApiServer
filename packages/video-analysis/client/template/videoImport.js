Template.dvaVideoImportHeader.events({
  'click .left': function (e) {
    return Router.go('/deepVideoAnalysis');
  },
  'click .right': function (e) {
    var link = $('#va-video-urls').val();
    link = checkLink(link, true);
    if(!link || link == ''){
      PUB.toast('链接无效');
      return $('#va-video-urls').focus();
    }

    var videoUrl = importVideo.getVideoUrlFromUrl(link);
    if(!videoUrl || videoUrl == '') {
       PUB.toast('无法解析链接地址');
      return $('#va-video-urls').focus();
    }

    DVA_WaitImportVideo.insert({
      userId: Meteor.userId(),
      url: videoUrl,
      type: '',
      createdAt: new Date()
    }, function(error, result) {
      if ( error ) {
        console.log(error);
        return PUB.toast('导入失败，请重试');
      }
      $('#va-video-urls').val('');
      return PUB.toast('已成功添加导入任务');
    });
  }
});

var checkLink = function(link, beforeImport) {
  var importLink, matchArray, regexToken;
  regexToken = /\b(((http|https?)+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
  matchArray = regexToken.exec(link);
  if (matchArray !== null) {
    importLink = matchArray[0];
    if (matchArray[0].indexOf('http') === -1) {
      importLink = "http://" + matchArray[0];
    }
    if (beforeImport) {
      return importLink;
    }
    return $('#va-video-urls').val('importLink');
  } else {
    console.log('链接无效');
    if (beforeImport) {
      return '';
    }
  }
  
};

Template.dvaVideoImport.onRendered(function () {
  if(Meteor.isCordova) {
    cordova.plugins.clipboard.paste(checkLink, function() {
      return console.log("获取粘贴板内容失败");
    });
  }
});