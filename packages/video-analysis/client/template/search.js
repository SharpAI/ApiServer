var selectedPicture = new ReactiveVar(null);
var deepVideoServer = 'http://192.168.0.117:8000';
var dvaServer = new ReactiveVar('');

var parseQueryResults = function(query_task_id,obj) {
  var videos = {};
  var results = obj.results || [];
  var resultCounts = 0,
      videoCounts = 0;
  for (var x in results) {
    results[x].forEach(function(item) {
      if( videos[''+item.video_id] ){
        videos[''+item.video_id].images.push(item);
      } else {
        videos[''+item.video_id] = {
          images: [item],
          video_id: item.video_id,
          video_name: item.video_name
        }
      }
      resultCounts += 1;
    });
  };

  videoCounts = Object.keys(videos).length;

  console.log( JSON.stringify(videos) );

  DVA_QueueLists.update({_id: query_task_id},{
    $set:{
      status: 'done',
      query_url   :obj.url,
      task_id     :obj.task_id,
      primary_key :obj.primary_key,
      // regions     :obj.regions,
      resultCounts: resultCounts,
      videoCounts: videoCounts,
      results     : videos
    }
  }, function(error, result){
    PUB.hideWaitLoading()
    if(error) {
      return console.log('update query task error');
    } 
    PUB.toast('查询成功');
    return PUB.page('/dvaDetail/'+query_task_id);
  });

}

var sendSearchFunc = function() {
  var image = $('.mainImage')[0];

  // 创建canvas DOM元素，并设置其宽高和图片一样   
  var canvas = document.createElement("canvas");  
  canvas.width = image.width;  
  canvas.height = image.height;  
  // 坐标(0,0) 表示从此处开始绘制，相当于偏移。  
  canvas.getContext("2d").drawImage(image, 0, 0, 260, 260);  

  var base64URL = canvas.toDataURL("image/png"); 
  console.log('base64URL is == '+ base64URL);
  console.log('deepVideoServer is '+ dvaServer.get());
 
  var user = Meteor.user();
  var dva_devices = DVA_Devices.find({user_id: Meteor.userId()}).fetch();

  DVA_QueueLists.insert({
    userId: Meteor.userId(),
    userName: user.profile.fullname ? user.profile.fullname: user.username,
    userIcon: user.profile.icon,
    imgUrl: base64URL,
    devices: dva_devices,
    status: 'pendding',
    createdAt: new Date()
  }, function(error, res){
    if(error) {
      return PUB.toast('创建失败~');
    }
    
    var query_task_id = res;

    $.ajax({
      type: "POST",
      url: dvaServer.get() + '/Search2',
      dataType: 'json',
      async: true,
      data: {
          'image_url': base64URL,
          'count': 20,
          'selected_indexers':'["5_2","5_3","4_1","4_4"]',
          'selected_detectors':'["3"]',
          'generate_tags':false,
          'csrfmiddlewaretoken':'KBmmGgN2MO6UvUKiVbqSvNKF6d8XfIiRRvVDdNAOPhqpfOvnsjnWQ9UvY3YBfhYp'
      },
      password: 'admin:super',
      error: function(xhr,status,error) {
        PUB.hideWaitLoading();
        console.log('ajax xhr = ', JSON.stringify(xhr));
        console.log('ajax status ==' , status);
        console.log('ajax error'+ error);
        try{
          selectedPicture.set(null);
        } catch (error) {}
        DVA_QueueLists.remove({_id: query_task_id});
        PUB.toast('查询失败，请重试');
      },
      success: function (response, status, xhr) {
        console.log(response)

        try{
          selectedPicture.set(null);
        } catch (error) {}

        var query_url = response.url;
        var task_id = response.task_id;
        var primary_key = response.primary_key;
        var regions = response.regions;
        var results = response.results;

        // parse results 
        parseQueryResults(query_task_id,response);
      }
    });
  });

};

Template.dvaSearch.onRendered(function() {
  Meteor.subscribe('dva_device_lists', 10, function() {
    var device = DVA_Devices.findOne({userId: Meteor.userId()});
    if(device && device.ipv4Addresses && device.ipv4Addresses.length > 0) {
      var ip = device.ipv4Addresses[0]
      var port = device.port;
      var url = 'http://'+ ip + ':'+port;
      dvaServer.set(url);
    } else {
      dvaServer.set('');
    }
  });
});

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
    console.log('DVA_server is :', dvaServer.get());
    if (!dvaServer.get()){
      navigator.notification.confirm('您还没有绑定设备！',function(buttonIndex){
        if(buttonIndex == 2) {
          Session.set('DVA_Index_Foot','dvaDevices');
        }
      },'提示',['稍后','绑定设备']);
    }
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
    PUB.showWaitLoading('正在查询');
    return sendSearchFunc();

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
        // send to Deep Video Box 
        sendSearchFunc(result);
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
        imgUrl: URI, 
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