var view = null;
var images = new ReactiveVar([]);
var message = new ReactiveVar(null);

Template._simpleChatLabelCrop.open = function(msgObj){
  if (view)
    Template._simpleChatLabelCrop.close();

  var imgs = [];
  message.set(msgObj);
  for(var i=0;i<msgObj.images.length;i++){
    var id = msgObj.images[i].id || msgObj.people_id;
    msgObj.images[i].selected = false;
    if (_.pluck(imgs, '_id').indexOf(id) === -1)
      imgs.push(msgObj.images[i]);
  }
  images.set(imgs);

  view = Blaze.render(Template._simpleChatLabelCrop, document.body);
  simple_chat_page_stack.push(view);

  if (imgs.length === 1){
    imgs[0].selected = true;
    images.set(imgs);
    Template._simpleChatLabelCrop.crop();
  }
};

Template._simpleChatLabelCrop.close = function(){
  if (view) {
    Blaze.remove(view);
    simple_chat_page_stack.pop();
  }
  view = null;
};

Template._simpleChatLabelCrop.crop = function(){
    var msgObj = message.get();
    var updateObj = {};
    var imgs = images.get();
    var crops = [];
    for (var i=0;i<imgs.length;i++){
      if (imgs[i].selected) {
        crops.push(imgs[i]);
      }
    }
    if (crops.length === 0) {
      return PUB.toast('至少选择一张照片进行裁剪~');
    }
    function cropcallback (result){
      var id = new Mongo.ObjectID()._str;
      window.___message.insert(id); // result.smallImage
      var timestamp = new Date().getTime();
      var originalFilename = result.replace(/^.*[\\\/]/, '');
      var filename = Meteor.userId() + '_' + timestamp + '_' + originalFilename;
      console.log('File name ' + filename);
      //var filenameArr = result.split('/');
      //var filename = filenameArr[filenameArr.length-1];
      var lastQuestionFlag = result.lastIndexOf('?');
      if (lastQuestionFlag >= 0)
        result = result.substring(0, lastQuestionFlag);
      var lastQuestionFlag = filename.lastIndexOf('?');
      if (lastQuestionFlag >= 0)
        filename = filename.substring(0, lastQuestionFlag);
      multiThreadUploadFile_new([{
        type: 'image',
        filename: filename,
        URI: result
      }], 1, function(err, res){
        if(err || res.length <= 0){
          window.___message.remove(id);
          return PUB.toast('上传图片失败~');
        }
        console.log('##RDBG upload image url: ' + res[0].imgUrl);
        window.___message.update(id, res[0].imgUrl);
        // Meteor.setTimeout(function() {
        //     try {
        //       $('.work-ai-img.lazy').lazyload();
        //     } catch (e) {}
        //   }, 2000);
        });
    }
    // set crop img
    for (var i=0;i<crops.length;i++){
      downloadFromBCS(crops[i].url,function(result){
         if (result) {
            plugins.crop(function success(newPath) {
              console.log('plugins crop newpath:'+newPath);
              if (newPath) {
                cropcallback(newPath);
              }
            }, function fail(error) {
              console.log('plugins crop error:'+error);
            }, result);
         }
      });
    }
    Template._simpleChatLabelCrop.close();
};

Template._simpleChatLabelCrop.helpers({
  images: function(){
    return images.get();
  }
});

Template._simpleChatLabelCrop.events({
  'click .leftButton': function(){
    Template._simpleChatLabelCrop.close();
  },
  'click .rightButton.remove': function(e, t){
    Template._simpleChatLabelCrop.crop()
  },
  'click li': function(){
    var imgs = images.get();
    for(var i=0;i<imgs.length;i++){
      if (imgs[i]._id === this._id){
        if (imgs[i].selected) {
          imgs[i].selected = false;
        }
        else {
          for(var j=0;j<imgs.length;j++){
            if (imgs[j].selected)
              return PUB.toast('每次只能选择一张进行裁剪哦~');
          }
          imgs[i].selected = true;
        }
        images.set(imgs);
      }
    }
  },
  // 'click .select': function(e, t){
  //   show_remove(function(text){
  //     if (!text)
  //       return;
  //     t.$('#remove-input-name').val(text);
  //   });
  // }
});
