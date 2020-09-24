//秒倒计时
var resetTime = function(time){
  var timer=null;
  var s=time;
  function countDown(){
   s--;
   if(s == 1){
     clearInterval(timer);
   }
   $('#scanTimeDown').html('正在扫描, '+s+ ' s');
  }
  timer=setInterval(countDown,1000);
};

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

    resetTime(60);
    Meteor.setTimeout(function() {
      isScanning.set(false);
    }, 60 * 1000);

    zeroconf && zeroconf.watch('_DeepEye._tcp', 'local.',function(result) {
      var lists = scanLists.get();
      var ids = scanIds.get();

      var action = result.action;
      var service = result.service;

      var index = ids.indexOf(macAddress);
      var macAddress = (service.txtRecord && service.txtRecord.macAddress) ? service.txtRecord.macAddress:'';

      if( action == 'added' ) {
        console.log('service added', JSON.stringify(service));
        // TODO check is device in db
        if(index < 0 && service && service.name && service.ipv4Addresses && service.ipv4Addresses.length > 0){
          lists.push(service);
          ids.push(macAddress);
        }
        // watch device ipv4Addresses change , if is changed , update
        var device = DVA_Devices.findOne({macAddress: macAddress});
        if( device && device.ipv4Addresses && device.ipv4Addresses[0] && service.ipv4Addresses && service.ipv4Addresses[0] ) {
          if(device.ipv4Addresses[0] != service.ipv4Addresses[0]){
            DVA_Devices.update({_id: device._id},{
              $set:{
                ipv4Addresses: service.ipv4Addresses
              }
            });
          }
        }
      } else {
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
    zeroconf && zeroconf.unwatch('_DeepEye._tcp', 'local.')
  },
  // bind user and device 
  'click .scanDeviceItem': function(e) {
    var self = this;
    var macAddress = (self.txtRecord && self.txtRecord.macAddress) ? self.txtRecord.macAddress:'';
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
    // check is device aleardy bind by user 
    PUB.showWaitLoading('正在添加设备');
    Meteor.subscribe('getDvaDeviceByMacAddress', macAddress, function() {
      if ( DVA_Devices.find({macAddress: macAddress}).count() > 0 ) {
        PUB.hideWaitLoading()
        return PUB.toast('该设备已被其他用户绑定');
      } else {
        var obj = self;
        var user = Meteor.user();
        obj.userId = Meteor.userId();
        obj.userName = user.profile.fullname ? user.profile.fullname: user.username;
        obj.userIcon = user.profile.icon;
        obj.macAddress = macAddress;
        obj.latestUpdateAt = new Date();
        obj.status = 'online';
        
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
  },
  // unbind device 
  'click .userDeviceItem': function(e) {
    var self = this;
    PUB.confirm('要解绑设备『'+self.name+'』吗？', function() {
      PUB.showWaitLoading('正在解绑');
      DVA_Devices.remove({_id: self._id}, function(error, result) {
        PUB.hideWaitLoading();
          if(error){
            console.log(error);
            return PUB.toast('解绑失败~');
          }
          return PUB.toast('已解绑设备『'+self.name+'』');
      });
    })
  }
})