Template.importPost.events({
  'click .left-btn': function () {
    history.go(-1);
  },
  'click button': function () {
    if(!$('#import-post-url').val())
      return alert('请粘贴或输入一个URL地址');
      
    //TODO:调用server进行导入
    
    //TODO:所功后打开贴子
    // Router.go('/posts/' + id);
  }
})