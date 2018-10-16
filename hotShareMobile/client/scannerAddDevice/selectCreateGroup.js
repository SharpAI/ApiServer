var view = null;
var d = null;
var cb = null;

SELECT_CREATE_GROUP = {
  show: function(data, callback){
    SELECT_CREATE_GROUP.close();
    d = data;
    if (callback) {
      cb = callback;
    }
    view = Blaze.renderWithData(Template.selectCreateGroup, data, document.body );
  },
  close: function(){
    if(view){
      Blaze.remove(view);
      view = null;
      d = null;
      cb = null;
    }
  },
  isShow: function(){
    return view != null;
  }
};
window.SELECT_CREATE_GROUP = SELECT_CREATE_GROUP;

var isCreating = new ReactiveVar(false);
var addDeviceToGroup = function(group_id, group_name) {
  d.groupId = group_id;
  d.groupName = group_name;

  var uuid = d.uuid;
  console.log(d);
  PUB.showWaitLoading('正在添加设备');
  Meteor.subscribe('devices-by-uuid',uuid, function() {
    if ( Devices.find({uuid: uuid}).count() > 0 ) {
      PUB.hideWaitLoading()
      // return PUB.toast('该设备已被其他用户绑定');
      changeDeviceGroup(group_id,group_name);
    } else {
      var user = Meteor.user();
      d.userId = Meteor.userId();
      d.userName = user.profile.fullname ? user.profile.fullname: user.username;
      d.userIcon = user.profile.icon;
      d.latestUpdateAt = new Date();
      d.status = 'online';

      Devices.insert(d, function(error , result){
        PUB.hideWaitLoading();
        if(error){
          console.log(error);
          return PUB.toast('添加设备失败~');
        }
        cb && cb();
        //$.post("http://workaihost.tiegushi.com/restapi/workai-join-group", {uuid: uuid, group_id: group_id, name: uuid, in_out: "in"}, function(data) {
        //  var msgBody = {_id: new Mongo.ObjectID()._str, uuid: uuid, type: 'text', text: 'groupchanged'};
        //  sendMqttMessage('/msg/d/'+uuid, msgBody);
        //});

        Meteor.call('join-group',uuid, group_id, uuid, "in",function(err,result){
          console.log('meteor call result:',result)
          //var msgBody = {_id: new Mongo.ObjectID()._str, group_id: group_id, uuid: uuid, type: 'text', text: 'groupchanged'};
          //sendMqttMessage('/msg/d/'+uuid, msgBody);
        });
        SELECT_CREATE_GROUP.close();
        //return PUB.toast('添加设备成功');
        $('#addDeviceResultText').html('添加设备成功');
        $('#addDeviceResult').modal('show');
      });
    }
  });
};

var changeDeviceGroup = function(group_id,group_name){
  PUB.showWaitLoading('正在处理');
  var uuid = (d.txtRecord && d.txtRecord.uuid) ? d.txtRecord.uuid:'';
  console.log("d._id="+d._id+", uuid="+uuid);
  Devices.update({_id:d._id}, {
    $set:{
      groupId: group_id,
      groupName: group_name,
      uuid: uuid
    }
  },function(error , result){
    PUB.hideWaitLoading();
    if(error){
      console.log(error);
      return PUB.toast('请重试~');
    }
    cb && cb();

    Meteor.call('join-group',uuid, group_id, uuid, "in",function(err,result){
      console.log('meteor call result:',result)
      //var msgBody = {_id: new Mongo.ObjectID()._str, group_id:group_id , uuid: uuid, type: 'text', text: 'groupchanged'};
      //sendMqttMessage('/msg/d/'+uuid, msgBody);
    });
    //$.post("http://workaihost.tiegushi.com/restapi/workai-join-group", {uuid: uuid, group_id: group_id, name: uuid, in_out: "in"}, function(data) {
    //  var msgBody = {_id: new Mongo.ObjectID()._str, uuid: uuid, type: 'text', text: 'groupchanged'};
    //  sendMqttMessage('/msg/d/'+uuid, msgBody);
    //});
    SELECT_CREATE_GROUP.close();
    //return PUB.toast('群组已更改');
    $('#addDeviceResultText').html('添加设备成功');
    $('#addDeviceResult').modal('show');
  })
}

Template.selectCreateGroup.onRendered(function () {
  Meteor.subscribe('get-my-group',Meteor.userId());
});

Template.selectCreateGroup.helpers({
  groups: function() {
    return SimpleChat.GroupUsers.find({user_id: Meteor.userId()}).fetch();
  },
  isCreating: function() {
    return isCreating.get();
  }
});

Template.selectCreateGroup.events({
  'click .back': function (e) {
    return SELECT_CREATE_GROUP.close();
  },
  'click .createNewGroup': function (e) {
    isCreating.set(true);
  },
  'click .cancel': function (e) {
    isCreating.set(false);
  },
  'click .save': function (e) {
      return $('.setGroupname-form').submit();
  },
  'submit .setGroupname-form': function(e) {
    e.preventDefault();
    if (e.target.text.value == '') {
      return PUB.toast('请输入群组名');
    }
    var name = e.target.text.value;
    var offsetTimeZone = (new Date().getTimezoneOffset())/-60;

    var id = new Mongo.ObjectID()._str;
    var user = Meteor.user();
    SimpleChat.Groups.insert({
      _id: id,
      name: name,
      icon: '',
      describe: '',
      create_time: new Date(),
      template:null,
      offsetTimeZone: offsetTimeZone,
      last_text: '',
      last_time: new Date(),
      barcode: rest_api_url + '/restapi/workai-group-qrcode?group_id=' + id,
      //建群的人
      creator:{
        id:user._id,
        name:user.profile && user.profile.fullname ? user.profile.fullname : user.username
      }
    }, function(error, result){
      if(error) {
        console.log(error);
        return PUB.toast('创建群组失败');
      }
      SimpleChat.GroupUsers.insert({
        group_id: id,
        group_name: name,
        group_icon: '',
        user_id: user._id,
        user_name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
        user_icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
        create_time: new Date()
      });
      if(d.get_group_only){
        cb && cb(id, name)
        return
      }
      if(d.groupId) { // 如果有group_id, 设备更换新的群组
        return changeDeviceGroup(id, name);
      }
      return addDeviceToGroup(id, name);
    });
  },
  'click .selectGroup': function (e) {
    if(d.get_group_only){
      cb && cb(this.group_id,this.group_name)
      return
    }
    if(d.groupId) { // 如果有group_id, 设备更换新的群组
        return changeDeviceGroup(this.group_id,this.group_name);
      }
    return addDeviceToGroup(this.group_id, this.group_name);
  }
})
