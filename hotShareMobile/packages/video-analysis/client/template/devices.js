var zeroconf;
if(Meteor.isCordova){
 zeroconf = cordova.plugins.zeroconf;
} 

var isScanModal = new ReactiveVar(false); // 是否是设备扫描模式
var isScanning = new ReactiveVar(false); // 是否正在扫描

var limit = new ReactiveVar(20);
// 扫描到的设备列表
var scanLists = new ReactiveVar([]);

Template.VA_Devices.onRendered(function() {
  // subscribe the DVA devices of user
  Meteor.subscribe('DVA_device_lists', limit.get());
});

Template.VA_Devices.helpers({
  isScanModal: function() {
    return isScanModal.get();
  },
  isScanning: function() {
    return isScanning.get()
  },
  scanListsCount() {
    return scanLists.get().length;
  },
  lists: function() {
    return DVA_Devices.find({user_id: Meteor.userId()},{limit: limit.get(), sort:{createdAt: -1}}).fetch();
  },
  scanLists: function() {
    return scanLists.get();
  }
});

Template.VA_Devices.events({
  'click .startScanDevices': function(e) {
    isScanModal.set(true);
    isScanning.set(true);
    Meteor.setTimeout(function() {
      isScanning.set(false);
    }, 5 * 1000);

    zeroconf.watch('_zhifa._tcp.', 'local.',function(result) {
      var lists = scanLists.get();

      var action = result.action;
      var service = result.service;

      if( action == 'added' ) {
        console.log('service added', JSON.stringify(service));
        lists.push(service);
      } else {
        console.log('service removed', JSON.stringify(service));
      }

      scanLists.set(lists);
    });
  },
  'click .stopScanDevices': function(e) {
    isScanModal.set(false);
    isScanning.set(false);
    zeroconf.unwatch('_zhifa._tcp.', 'local.')
  }
})