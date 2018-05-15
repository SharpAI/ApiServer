Devices = new Meteor.Collection('devices');

send_motion_mqtt_msg = function(url, uuid, text, group,show_type) {
  console.log("url:", url)
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
  
  return sendMqttMessage('/msg/g/' + group._id, {
      _id: new Mongo.ObjectID()._str,
      form: {
        id: user._id,
        name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
        icon: user.profile.icon
      },
      to: {
        id: group._id,
        name: group.name,
        icon: group.icon
      },
      images: [
        {
          _id: new Mongo.ObjectID()._str,
          url: url
        }
      ],
      people_id: 'people_id_gif',
      to_type: "group",
      type: "text",
      text: text,
      create_time: new Date(),
      event_type: 'motion',
      show_type:show_type,
      is_read: false
    })
};
