var isLoading = new ReactiveVar(false);
var limit = new ReactiveVar(20);
var lists = new ReactiveVar([]);

Template.dvaVideos.onRendered(function() {
  // get user bind devices 
  isLoading.set(true);
  Meteor.subscribe('user_dva_devices', function () {
     var tmpArr = lists.get() || [];
     DVA_Devices.find({userId: Meteor.userId()}).forEach(function(item){
       var ip = (item.ipv4Addresses && item.ipv4Addresses[0]) ? item.ipv4Addresses[0] : '';
       var port = (item.port && item.port) ? item.port : null;
       var deviceName = item.name;

       if(ip && port){
         var dvaBoxUrl = 'http://' + ip + ':' + port + '/api/videos';
        //  getVideos 
        dvaBoxUrl = 'http://192.168.0.117:8000/api/videos/';
        $.get(dvaBoxUrl, function(result) {
          result.forEach(function(item){
            item.dvaBoxUrl = dvaBoxUrl;
            item.deviceIP = ip;
            item.deviceName = deviceName;
            tmpArr.push(item);
          });
          lists.set(tmpArr);
        });
       }
     });
     isLoading.set(false);
  });
});

Template.dvaVideos.helpers({
  lists: function () {
    return lists.get();
  },
  isLoading: function() {
    return isLoading.get();
  }
});

Template.dvaVideos.events({
  'click .va-video-lists': function(e) {
    Session.set('dva_video_info', this);
    return PUB.page('/dva/video/'+this.id+'?url='+encodeURIComponent(this.dvaBoxUrl) );
  }
});