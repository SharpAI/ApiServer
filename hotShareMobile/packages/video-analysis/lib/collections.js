// 视频搜索记录
DVA_QueueLists = new Mongo.Collection('dva_queue_lists');
// 用户设备列表
DVA_Devices = new Mongo.Collection('dva_devices');

// DB index 
if (Meteor.isServer) {
  Meteor.startup(function () {
    DVA_Devices._ensureIndex({createdAt: -1});
  })
}