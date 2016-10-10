var progress = new ReactiveVar(100);
var hasCancel = false;
var importType = 'new'; // new/old
var task_id = new Mongo.ObjectID()._str;

Session.setDefault('import-post-info', null);
Template.importPost.onRendered(function () {
  progress.set(100);
  hasCancel = false;
  Session.set('import-post-info', null);
});
Template.importPost.helpers({
  postInfo: function () {
    return Session.get('import-post-info');
  },
  hasPostInfo: function () {
    return Session.get('import-post-info') && Session.get('import-post-info').json && Session.get('import-post-info').title;
  },
  importUrl: function () {
    return Session.get('import-post-info-url');
  },
  importTypeByNew: function () {
    return importType === 'new';
  },
  hasImport: function () {
    return progress.get() != 100;
  },
  progress: function () {
    return progress.get();
  },
  minIimg: function () {
    return $('.import-post').width() <= 640;
  }
});
Template.importPost.events({
  'click .left-btn': function () {
    Session.set('import-post-info', null);
    Session.set('import-post-info-url', '');
    history.go(-1);
  },
  'click button.cancel': function () {
    var xmlhttp = jQuery.ajaxSettings.xhr();
    xmlhttp.open("GET", '/import-cancel/' + task_id, true);
    xmlhttp.send(null);
        
    Session.set('import-post-info', null);
    Session.set('import-post-info-url', '');
    hasCancel = true;
    progress.set(100);
  },
  'submit form.import-post-form': function () {
    Meteor.setTimeout(function(){
      if(!$('#import-post-url').val())
        return alert('请粘贴或输入一个URL地址~');
      if(!($('#import-post-url').val().indexOf('http://') === 0 || $('#import-post-url').val().indexOf('https://') === 0))
        return alert('您输的不是URL地址~');
        
      // 调用server进行导入
      var cancel_url = import_cancel_url;
      var api_url = import_server_url;
      var id = new Mongo.ObjectID()._str;
      
      hasCancel = false;
      task_id = new Mongo.ObjectID()._str;
      api_url += '/' + (window.localStorage.getItem('static_login_userId') || Meteor.userId());
      api_url += '/' + encodeURIComponent($('#import-post-url').val());
      api_url += '?task_id=' + task_id;
      Session.set('import-post-info-url', $('#import-post-url').val());
      
      if(importType === 'new'){
        Session.set('import-post-info', null);
        Session.set('import-post-info-url', null);
        $('.posts .title').html($('#import-post-url').val());
        progress.set(5);
        var xmlhttp = jQuery.ajaxSettings.xhr();
        xmlhttp.timeout = 30000;
        var hasDone = false;
        var submitDone = function (res) {
          var result = res.split('\r\n');
          result = result[result.length-1];
          console.log(result);
          result = JSON.parse(result)
          
          switch (result.status) {
            case 'importing':
              var html = '<div class="title">'+result.json.title+'</div>';
              html += '<div class="body">';
              html += '<div class="img"><img src="'+result.json.mainImg+'" /></div>';
              html += '<div class="remark">'+result.json.remark+'</div>';
              html += '</div>';
              $('.posts').html(html);
              Session.set('import-post-info', result);
              break;
            case 'succ':
              progress.set(100);
              hasDone = true;
              Router.go('/static/' + result.json.substr(result.json.lastIndexOf('/')+1));
              break;
            default:
              hasCancel = true;
              Session.set('import-post-info', null);
              Session.set('import-post-info-url', '');
              progress.set(100);
              alert('导入失败，请重试~');
              break;
          }
        };
        xmlhttp.ontimeout = function(e) {
          //console.log('>>> in xhr timeout, will cancel the import job! ');
          var xmlhttp = jQuery.ajaxSettings.xhr();
          xmlhttp.open("GET", '/import-cancel/' + task_id, true);
          xmlhttp.send(null);
              
          Session.set('import-post-info', null);
          Session.set('import-post-info-url', '');
          hasCancel = true;
          progress.set(100);
          alert('导入超时，请重试~');
        };        
        xmlhttp.onreadystatechange = function () {
          if(xmlhttp.readyState === 4 && xmlhttp.status === 200 && !hasDone && !hasCancel){
            submitDone(xmlhttp.responseText);
          }else if(xmlhttp.readyState === 3 && xmlhttp.responseText.length > 0 && !hasDone && !hasCancel){
            submitDone(xmlhttp.responseText);
          }
        };
        xmlhttp.open("GET", '/import-server/' + (window.localStorage.getItem('static_login_userId') || Meteor.userId()) + '/' + encodeURIComponent($('#import-post-url').val()), true);
        xmlhttp.send(null);
      }else{
        var intrval = Meteor.setInterval(function () {
          if(progress.get() === 100 || hasCancel)
            return Meteor.clearInterval(intrval);
          if(progress.get() < 95)
            progress.set(progress.get()+1);
        }, 200);
        
        progress.set(5);
        console.log("api_url="+api_url);
        try {
          Meteor.call('httpCall', 'GET', api_url, function (err, res) {
            progress.set(100);
            if(hasCancel)
              return;
            if(err)
              return alert('导入失败，请重试~');
            //console.log(res.content);
            var result = JSON.parse(res.content);
            if(!result || result.status != 'succ')
              return alert('导入失败，请重试~')
            
            // 所功后打开贴子
            //alert('导入成功，后端还会对图片进行自动优化~!!');
            Router.go('/posts/' + result.json.substr(result.json.lastIndexOf('/')+1));
          });
        } catch (error) {
            progress.set(100);
            alert('导入失败，请重试~');
            console.log("ERROR: httpCall, api_url="+api_url);
        }
      }
    }, 0);
    
    return false;
  }
})