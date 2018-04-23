Devices = new Meteor.Collection('devices');

send_motion_mqtt_msg = function(url, uuid, text) {
  var device, user, userGroups;
  device = Devices.findOne({
    uuid: uuid
  });
  user = Meteor.users.findOne({
    username: uuid
  });
  if (!user) {
    return;
  }
  userGroups = SimpleChat.GroupUsers.find({
    user_id: user._id
  });
  if (!userGroups) {
    return;
  }
  userGroups.forEach(function(userGroup) {
    var group;
    group = SimpleChat.Groups.findOne({
      _id: userGroup.group_id
    });
    return sendMqttMessage('/msg/g/' + userGroup.group_id, {
      _id: new Mongo.ObjectID()._str,
      form: {
        id: user._id,
        name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
        icon: user.profile.icon
      },
      to: {
        id: userGroup.group_id,
        name: userGroup.group_name,
        icon: userGroup.group_icon
      },
      images: [
        {
          _id: new Mongo.ObjectID()._str,
          url: url
        }
      ],
      to_type: "group",
      type: "text",
      text: text,
      create_time: new Date(),
      event_type: 'motion',
      is_read: false
    });
  });
};
