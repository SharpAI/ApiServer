Meteor.methods({
    //修改设备名
    change_device_name:function(deviceId,uuid,groupId,newName){
        //1.修改设备名
        //2.groupuser里的设备用户名字修改
        //3.user里对应名字修改
        Devices.update({_id:deviceId},{
            $set:{
            name:newName
            }
        });
        Meteor.users.update({username:uuid},{$set:{'profile.fullname':newName}});
        var user = Meteor.users.findOne({username:uuid});
        SimpleChat.GroupUsers.update({group_id:groupId,user_id:user._id},{$set:{user_name:newName}});
        return;
    }
})