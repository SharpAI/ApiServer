var view = null;
var images = new ReactiveVar([]);
var message = new ReactiveVar(null);

Template._simpleChatLabelCrop.open = function(msgObj){
  if (view)
    Template._simpleChatLabelCrop.close();

  var imgs = [];
  message.set(msgObj);
  for(var i=0;i<msgObj.images.length;i++){
    if (msgObj.images[i].remove || msgObj.images[i].label)
      continue;
    msgObj.images[i].selected = false;
    if (_.pluck(imgs, '_id').indexOf(msgObj.images[i]._id) === -1)
      imgs.push(msgObj.images[i]);
  }
  images.set(imgs);

  view = Blaze.render(Template._simpleChatLabelCrop, document.body);
};

Template._simpleChatLabelCrop.close = function(){
  if (view)
    Blaze.remove(view);
  view = null;
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
    // if (!t.$('#remove-input-name').val())
    //   return PUB.toast('请输入或选择删除的原因~');
    
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
      var filenameArr = result.split('/');
      var filename = filenameArr[filenameArr.length-1];
      multiThreadUploadFile_new([{
        type: 'image',
        filename: filename,
        URI: result
      }], 1, function(err, res){
        if(err || res.length <= 0){
          window.___message.remove(id);
          return PUB.toast('上传图片失败~');
        }
        window.___message.update(id, res[0].imgUrl);
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
  },
  'click li': function(){
    var imgs = images.get();
    for(var i=0;i<imgs.length;i++){
      if (imgs[i].selected === true && imgs[i]._id !== this._id) {
          PUB.toast('每次只能选择一张进行裁剪哦~');
          break;
      }
      if (imgs[i]._id === this._id){
        imgs[i].selected = !imgs[i].selected;
        images.set(imgs);
        break;
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