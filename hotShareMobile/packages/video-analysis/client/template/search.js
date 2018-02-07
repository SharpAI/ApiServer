var selectedPicture = new ReactiveVar(null);

Template.dvaSearch.helpers({
  selectedPicture: function() {
    return selectedPicture.get();
  },
  getImagePath: function(path,uri,id){
    return getImagePath(path,uri,id);
  }
})

Template.dvaSearch.events({
  // take a photo or select picture from  photo library
  'click #selectPic': function (e) {
    var self = this;

    var options = {
      title: '拍摄照片或从相册选择图片',
      buttonLabels: ['拍照','从相册选择'],
      addCancelButtonWithLabel: '取消',
      androidEnableCancelButton: true
    };

    var setSelectedPic = function(result) {
      selectedPicture.set({
        id: new Mongo.ObjectID()._str, 
        type: 'image',
        owner: Meteor.userId(), 
        imgUrl:result.smallImage, 
        filename:result.filename, 
        URI:result.URI
      });
    }

    window.plugins.actionsheet.show(options, function(index) {
      switch (index) {
        case 1:
          if (window.takePhoto) {
            window.takePhoto (setSelectedPic);
          }
          break;
        case 2:
          selectMediaFromAblum(1, function(cancel, result) {
            if(cancel){
              return;
            }
            if(result){
              setSelectedPic(result); 
            }
          });
          break;
        default:
          break;
      }
    });
  },
  // start query task
  'click #startQuery': function (e) {
    var picObj = selectedPicture.get();

    var createQueryQueue = function(imgUrl) {
      PUB.showWaitLoading('正在创建查询任务');
      // create the query queue
      var dva_devices = DVA_Devices.find({user_id: Meteor.userId()}).fetch();
      var user = Meteor.user();
      DVA_QueueLists.insert({
        userId: Meteor.userId(),
        userName: user.profile.fullname ? user.profile.fullname: user.username,
        userIcon: user.profile.icon,
        imgUrl: imgUrl,
        devices: dva_devices,
        status: 'pendding',
        createdAt: new Date()
      }, function(error, result){
        PUB.hideWaitLoading();
        if(error) {
          return PUB.toast('创建失败~');
        }
        selectedPicture.set(null);
        return PUB.toast('查询任务已经添加到队列');
        // return PUB.confirm('查询任务已经添加到队列，点击『确定』查看',function(){
        //   template('VA_History')
        // });
      });
    }

    if(picObj.imgUrl && picObj.imgUrl.indexOf('http') > -1) {
      createQueryQueue(picObj.imgUrl);
    } else {
      PUB.showWaitLoading('正在上传图片');
      multiThreadUploadFile_new([picObj], 1, function(err, res){
        PUB.hideWaitLoading();
        if(err || res.length <= 0){
          return PUB.toast('上传图片失败~');
        }
        console.log('##RDBG upload image url: ' + res[0].imgUrl);
        picObj.imgUrl = res[0].imgUrl;
        selectedPicture.set(picObj);

        createQueryQueue(res[0].imgUrl);

      });
    }
  },
  // cropPic 
  'click #cropPic': function (e) {
    var img = selectedPicture.get();

    var cropcallback = function(result){
      var filename = '';
      var URI = result;
      var imgUrl = '';
      var timestamp = new Date().getTime();
      var originalFilename = result.replace(/^.*[\\\/]/, '');

      filename = Meteor.userId() + '_' + timestamp + '_' + originalFilename;
      console.log('File name ' + filename);

      var lastQuestionFlag = result.lastIndexOf('?');
      if (lastQuestionFlag >= 0){
        URI = result.substring(0, lastQuestionFlag);
      }
      var lastQuestionFlag = filename.lastIndexOf('?');
      if (lastQuestionFlag >= 0) {
        filename = filename.substring(0, lastQuestionFlag);
        imgUrl = imgUrl+'/'+filename;
      }
      console.log('filename==',filename)
      console.log('URI==',URI)

      selectedPicture.set({
        id: new Mongo.ObjectID()._str, 
        type: 'image',
        owner: Meteor.userId(), 
        imgUrl: imgUrl, 
        filename: filename, 
        URI: URI
      });
    };

    plugins.crop(function success(newPath){
      console.log('plugins crop newPath:' + newPath);
      if (newPath) {
        cropcallback(newPath)
      }
    },function fail(error){
      console.log('plugins crop Err='+ JSON.stringify(error));
    },img.URI);
  }
})