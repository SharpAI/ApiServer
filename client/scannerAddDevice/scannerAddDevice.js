var zeroconf;
if(Meteor.isCordova){
  Meteor.startup(function(){
    document.addEventListener("deviceready", function(){
      zeroconf = cordova.plugins.zeroconf;
    }, false);
  });
}
// 扫描到的设备列表
var scanLists = new ReactiveVar([]);
var scanIds = new ReactiveVar([]);

Template.scannerAddDevice.helpers({
  isScanning: function() {
    return isScanning.get();
  },
  scanLists: function() {
   return scanLists.get();
  },
  isInDB: function() {
    return this.isInDB ? this.isInDB : false;
  },
  getIp: function() {
    var ipv4 = this.ipv4Addresses;
    if(ipv4 && ipv4.length > 0) {
      return ipv4[0];
    }
  },
  formatDate: function(date) {
    if (!date) {
      return ''
    }
    var d = new Date(date);
    return d.parseDate('YYYY/MM/DD hh:ss');
  }
});

Template.scannerAddDevice.events({
  'click .leftButton': function(e) {
    return PUB.page('/');
  },
  /**
   * add device
   * 1. select or create a group
   * 2. add device to group
   */
  'click .scanListItem': function(e) {
    var self = this;
    console.log("self = "+JSON.stringify(self));
    return window.SELECT_CREATE_GROUP.show(self, function() {
      var lists = scanLists.get();
      var ids = scanIds.get();

      var uuid = (self.txtRecord && self.txtRecord.uuid) ? self.txtRecord.uuid:'';
      var index = ids.indexOf(uuid);
      if(index > -1){
        ids.splice(index,1);
        lists.splice(index,1);
      }
      scanLists.set(lists);
      scanIds.set(ids);
    }); // see selectCreateGroup.js
  }
});

Template.scannerAddDevice.onRendered(function() {
  console.log("Template.scannerAddDevice.onRendered")
  scanLists.set([]);
  scanIds.set([]);
  var watchStr = '_DeepEye._tcp.';
  if (device.platform === 'iOS')
    watchStr = '_DeepEye._tcp';
  // 页面初始化完成后， 自动开始扫描设备
  zeroconf && zeroconf.watch(watchStr, 'local.',function(result) {
      console.log("zeroconf.watch in");
      console.log("zeroconf.watch in, result="+JSON.stringify(result));
      var lists = scanLists.get();
      var ids = scanIds.get();

      var action = result.action;
      var service = result.service;

      var uuid = (service.txtRecord && service.txtRecord.uuid) ? service.txtRecord.uuid:'';
      var index = ids.indexOf(uuid);

      Meteor.call('upsetDeepVideoDevices', result);

      if( action == 'added' ) {
        console.log('service added', JSON.stringify(service));
        if(index < 0 && service && service.name && service.ipv4Addresses && service.ipv4Addresses.length > 0){
          // check is device in db
          console.log("service.ipv4Addresses="+service.ipv4Addresses);
          Meteor.call('isDeviceInDB', uuid, function(error, result){
            console.log('isDeviceInDB result = ', JSON.stringify(result))
            function isUuidInList(uuid, lists) {
              for (var i = 0; i < lists.length; i++) {
                if (lists[i].uuid == uuid)
                  return true;
              }
              return false;
            }
            if(!error/* && !result*/) {
              service.uuid = uuid;
              if (result && result.length > 0) {
                service.isInDB = true;
                service._id = result[0]._id;
                service.groupId = result[0].groupId;
              } else {
                service.isInDB = false;
              }
              if (!isUuidInList(uuid, lists)) {
                lists.push(service);
                ids.push(uuid);
              }
            }
            scanLists.set(lists);
            scanIds.set(ids);
            console.log('scanLists is ', JSON.stringify(scanLists.get()));
          });
        }

      } else {
        if(index > -1){
          ids.splice(index,1);
          lists.splice(index,1);
        }
        scanLists.set(lists);
        scanIds.set(ids);
        console.log('scanLists is ', JSON.stringify(scanLists.get()));
        console.log('service removed', JSON.stringify(service));
      }
    });
});

Template.scannerAddDevice.onDestroyed(function (){
  var watchStr = '_DeepEye._tcp.';
  if (device.platform === 'iOS')
    watchStr = '_DeepEye._tcp';
  zeroconf && zeroconf.unwatch(watchStr, 'local.');
});
