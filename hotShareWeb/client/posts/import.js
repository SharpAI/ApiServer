var progress = new ReactiveVar(100);
var hasCancel = false;

Template.importPost.onRendered(function () {
  progress.set(100);
  hasCancel = false;
});
Template.importPost.helpers({
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
    history.go(-1);
  },
  'click button.cancel': function () {
    hasCancel = true;
    progress.set(100);
  },
  'click button.import': function () {
    if(!$('#import-post-url').val())
      return alert('请粘贴或输入一个URL地址');
      
    // 调用server进行导入
    // var api_url = 'http://120.24.229.253:8080/import';
    var api_url = 'http://127.0.0.1:8080/import';
    var id = new Mongo.ObjectID()._str;
    
    hasCancel = false;
    api_url += '/' + Meteor.userId();
    api_url += '/' + encodeURIComponent($('#import-post-url').val());
    
    var intrval = Meteor.setInterval(function () {
      if(progress.get() === 100 || hasCancel)
        return Meteor.clearInterval(intrval);
      if(progress.get() < 95)
        progress.set(progress.get()+1);
    }, 200);
    
    progress.set(5);
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
      alert('导入成功，后端还会对图片进行自动优化~');
      location = result.json;
    });
  }
})