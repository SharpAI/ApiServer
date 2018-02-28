// 视频搜索记录
DVA_QueueLists = new Mongo.Collection('dva_queue_lists');
// 用户设备列表
DVA_Devices = new Mongo.Collection('dva_devices');
// 等待导入的视频
DVA_WaitImportVideo = new Mongo.Collection('dva_wait_import_video');

// videos in deep video analysis devices
DVA_Videos = new Mongo.Collection('dva_videos');

// DB index 
if (Meteor.isServer) {
  Meteor.startup(function () {
    DVA_QueueLists._ensureIndex({createdAt: -1});
    DVA_Devices._ensureIndex({createdAt: -1});
  })
}

if (Meteor.isServer) {
  // allow 
  DVA_QueueLists.allow({
    insert: function (userId, doc) {
      // the user must be logged in, and the document must be owned by the user
      return (userId && doc.userId === userId);
    },
    update: function (userId, doc, fields, modifier) {
      // can only change your own documents
      return doc.userId === userId;
    },
    remove: function (userId, doc) {
      // can only remove your own documents
      return doc.userId === userId;
    }
  });

  DVA_Devices.allow({
    insert: function (userId, doc) {
      // the user must be logged in, and the document must be owned by the user
      return (userId && doc.userId === userId);
    },
    update: function (userId, doc, fields, modifier) {
      // can only change your own documents
      return doc.userId === userId;
    },
    remove: function (userId, doc) {
      // can only remove your own documents
      return doc.userId === userId;
    }
  });

  DVA_WaitImportVideo.allow({
    insert: function (userId, doc) {
      // the user must be logged in, and the document must be owned by the user
      return (userId && doc.userId === userId);
    },
    update: function (userId, doc, fields, modifier) {
      // can only change your own documents
      return doc.userId === userId;
    },
    remove: function (userId, doc) {
      // can only remove your own documents
      return doc.userId === userId;
    }
  });

  // publish
  Meteor.publish('dva_queue_lists', function(limit){
    if(!this.userId) {
      return this.ready();
    }
    var limit = limit || 20;
    return DVA_QueueLists.find({userId: this.userId},{limit: limit, sort:{createdAt: -1}});
  });

  Meteor.publish('dva_queue_info', function(_id) {
    if(!this.userId || !_id) {
      return this.ready();
    }
    return [
      DVA_Devices.find({userId: this.userId},{limit: 10, sort:{createdAt: -1}}),
      DVA_QueueLists.find({_id: _id})
    ];
  })

  Meteor.publish('dva_device_lists', function(limit) {
    if(!this.userId) {
      return this.ready();
    }
    var limit = limit || 20;
    return DVA_Devices.find({userId: this.userId},{limit: limit, sort:{createdAt: -1}});
  });

  Meteor.publish('user_dva_devices', function(){
    if(!this.userId) {
      return this.ready();
    }
    return DVA_Devices.find({userId: this.userId});
  });

  Meteor.publish('getDvaDeviceByMacAddress', function(macAddress) {
    if(!this.userId || !macAddress) {
      return this.ready();
    }
    return DVA_Devices.find({macAddress: macAddress});
  });
  
}