var zeroconf;
if(Meteor.isCordova){
  Meteor.startup(function(){
    document.addEventListener("deviceready", function(){
      zeroconf = cordova.plugins.zeroconf;
    }, false);
  });
} 

var isScanModal = new ReactiveVar(false); // 是否是设备扫描模式
var isScanning = new ReactiveVar(false); // 是否正在扫描

var limit = new ReactiveVar(20);
// 扫描到的设备列表
var scanLists = new ReactiveVar([]);
var scanIds = new ReactiveVar([]);

Template.dvaDevices.onRendered(function() {
  // subscribe the DVA devices of user
  Meteor.subscribe('dva_device_lists', limit.get());
});

Template.dvaDevices.helpers({
  isScanModal: function() {
    // return isScanModal.get();
    return Session.equals('is_DVA_device_scan_model', true);
  },
  isScanning: function() {
    return isScanning.get()
  },
  scanListsCount: function() {
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

Template.dvaDevices.events({
  'click .startScanDevices': function(e) {
    // isScanModal.set(true);
    Session.set('is_DVA_device_scan_model', true);
    isScanning.set(true);
    scanLists.set([]);
    scanIds.set([]);
    Meteor.setTimeout(function() {
      isScanning.set(false);
    }, 120 * 1000);

    zeroconf && zeroconf.watch('_zhifa._tcp.', 'local.',function(result) {
      var lists = scanLists.get();
      var ids = scanIds.get();

      var action = result.action;
      var service = result.service;

      if( action == 'added' ) {
        console.log('service added', JSON.stringify(service));
        // TODO check is device in db
        lists.push(service);
        ids.push(service.name);
      } else {
        var index = ids.indexOf(service.name);
        if(index > -1){
          ids.splice(index,1);
          lists.splice(index,1);
        }
        console.log('service removed', JSON.stringify(service));
      }

      scanLists.set(lists);
      scanIds.set(ids);
    });
  },
  'click .stopScanDevices': function(e) {
    // isScanModal.set(false);
    Session.set('is_DVA_device_scan_model', false);
    isScanning.set(false);
    zeroconf && zeroconf.unwatch('_zhifa._tcp.', 'local.')
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