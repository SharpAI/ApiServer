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
  Meteor.subscribe('dva_device_lists', limit.get());
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
    return DVA_Devices.find({userId: Meteor.userId()},{limit: limit.get(), sort:{createdAt: -1}}).fetch();
  },
  scanLists: function() {
    return scanLists.get();
  },
  getIPV4: function(){
    var ips = this.ipv4Addresses;
    return ips[0];
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
  },
  // bind user and device 
  'click .scanDeviceItem': function(e) {
    var self = this;
    console.log(self);
    // 'domain' : 'local.',
    // 'type' : '_http._tcp.',
    // 'name': 'Becvert\'s iPad',
    // 'port' : 80,
    // 'hostname' : 'ipad-of-becvert.local',
    // 'ipv4Addresses' : [ '192.168.1.125' ], 
    // 'ipv6Addresses' : [ '2001:0:5ef5:79fb:10cb:1dbf:3f57:feb0' ],
    // 'txtRecord' : {
    //     'foo' : 'bar'
    // }
    var obj = self;
    var user = Meteor.user();
    obj.userId = Meteor.userId();
    obj.userName = user.profile.fullname ? user.profile.fullname: user.username;
    obj.userIcon = user.profile.icon;
    PUB.showWaitLoading('正在添加设备');
    DVA_Devices.insert(obj, function(error , result){
      PUB.hideWaitLoading();
      if(error){
        console.log(error);
        return PUB.toast('添加设备失败~');
      }
      return PUB.toast('添加设备成功');
    });
  }
})