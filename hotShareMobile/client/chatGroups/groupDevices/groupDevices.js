Template.groupDevices.onRendered(function () {
  var group_id = Router.current().params._id;
  Meteor.subscribe('device_by_groupId', group_id);
});

Template.groupDevices.helpers({
  currentFWVer: function(firmwareVersion){
    if(firmwareVersion){
      return firmwareVersion
    } else {
      return '未知'
    }
  },
  isChecked: function(autoUpdate){
    if(autoUpdate){
      return 'checked'
    } else {
      return ''
    }
  },
  lists: function() {
    var group_id = Router.current().params._id;
    return Devices.find({groupId: group_id}).fetch();
  },
  isEditing:function(uuid){
    if(Session.get('isEditing') == uuid){
      return true;
    }
    return false;
  },
  isShow:function(uuid,tag){
    if(Session.get('isEditing') == uuid && tag==1){
      return 'display:none';
    }
    if(Session.get('isEditing') != uuid && tag==2){
      return 'display:none';
    }
    return '';
  },
  getId:function(uuid){
    return "input_"+uuid;
  },
  isLatest: function(uuid){
    var curDevice = Devices.findOne({uuid:uuid});
    if(!curDevice.islatest && curDevice.islatest == null && curDevice.islatest == undefined){
        return 'display:none';
    }
    return '';
  }
});

var cameraParams = {};
function isValidateIPaddress(ipaddress) {
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
    return (true);
  }

  return (false);
}
Template.groupDevices.events({
  'click .latest_update': function(e,t){
    PUB.toast('您的脸脸安全盒当前是最新版本');
    return
  },
  'click .set-camera': function(e,t){
    cameraParams.id = this._id;
    cameraParams.uuid = this.uuid;
    $('#cameraSettings').modal('show');
  },
  'click .saveCameraSettings': function(e,t){
    var rtsp = $('#rtspurl').val();
    rtsp = rtsp.trim();
    if (rtsp == "") {
      PUB.toast('摄像头RTSP URL不能为空！');
      return;
    }

    var obj = {
      camrtspurl: rtsp,
      uuid: cameraParams.uuid,
      id: cameraParams.id,
      groupId: Router.current().params._id
    };

    console.log('##RDBG obj: ' + JSON.stringify(obj));
    sendMqttMessage('/camerasettings', obj);

    $('#cameraSettings').modal('hide');
  },
  'click #switch_update': function(e,t){
    console.log('switch update')
    if(this.autoUpdate){
        Devices.update({_id:this._id},{$set:{autoUpdate:false}})
    } else {
      Devices.update({_id:this._id},{$set:{autoUpdate:true}})
    }
    return;
  },
  'click .name':function(e){
    var self = this;
    Session.set('isEditing',this.uuid);
    Meteor.setTimeout(function(){
    var node = $("#input_"+self.uuid);
      var t = node.val();
      node.val("").focus().val(t);
    },1000);
    // var td = $(e.currentTarget);
    // var text = $(e.currentTarget).text();
    // var input = $('<input type="text" class="edit" value="'+text+'">');
    // $(e.currentTarget).html(input);
    // $('input').click(function(){
    //   return false;
    // }); //阻止表单默认点击行为
    // var len = text.length;
    // // $('input').setSelectionRange(len,len);
    // $('input').select();
    // $('input').blur(function(event){
    //   var nextxt=$(event.currentTarget).val();
    //   if(nextxt == ''||nextxt == self.name){
    //     nextxt = self.name;
    //   }else{
    //     Meteor.call('change_device_name',self._id,self.uuid,self.groupId,nextxt,function(err){
    //       if(err){
    //         console.log(err);
    //         PUB.toast('修改失败，请重试');
    //         td.html(self.name);
    //       }
    //     })
    //   }
    //   td.html(nextxt);
    // }); //表单失去焦点文本框变成文本
  },
  'blur input':function(e){
    var self = this;
    var newName = $(e.currentTarget).val();
    if(newName == ''||newName == this.name){
      Session.set('isEditing',null);
      return;
    }
    Meteor.call('change_device_name', this._id, this.uuid, this.groupId, newName, function (err) {
      if (err) {
        console.log(err);
        PUB.toast('修改失败，请重试');
      }else{
        Session.set('isEditing',null);
      }
    })
  },
  'click .delBtnContent':function(e){
    var uuid = $(e.currentTarget).data('uuid');
    var id = e.currentTarget.id;
    var group_id = Router.current().params._id;
    //删除设备
    Meteor.call('delete_device',id,uuid,group_id,function(err){
      if(err){
        console.log(err);
        return;
      }
      PUB.toast('删除成功');
    })
  },
  'click .back': function(){
    return PUB.back();
  },
  'click .goTimelime': function(e){
    var group_id = Router.current().params._id;
    Session.set("channel",'groupDevices/'+group_id);
    return PUB.page('/timelineAlbum/'+e.currentTarget.id+'?from=timeline');
  },
  'click .goEdit':function(){
    var self = this;
    if(!self.name){
      self.name = '未知设备';
    }
    Session.set('curDevice',self);
    var group_id = Router.current().params._id;
    Session.set("channel",'groupDevices/'+group_id);
    return PUB.page('/setDevicename');
  }
});
Template.setDevicename.events({
  'click .left-btn':function(){
    PUB.back();
  },
  'click .right-btn':function(){
    $('.setGroupname-form').submit();
  },
  'submit .setGroupname-form':function(e){
    e.preventDefault();
    var newName = e.target.text.value;
    if(newName == ''){
      PUB.toast('请输入设备名');
      return;
    }
    if(newName == this.name){
      PUB.toast('设备名没有修改');
      return;
    }
    Meteor.call('change_device_name',this._id,this.uuid,this.groupId,newName,function(err){
      if(err){
        console.log(err);
        PUB.toast('修改失败，请重试');
      }else{
        return PUB.back();
      }
    })
  }
})
