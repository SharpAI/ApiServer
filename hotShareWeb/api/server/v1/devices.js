var api = require('../api.js');

var Api = api.ApiV1;

Api.addRoute('devices', {
  authRequired: true
}, {
  get: {
    authRequired: false,
    action: function () {
      try {
        var groupId = this.queryParams.groupId && this.queryParams.groupId.trim();
  
        if (!groupId) {
          throw new Meteor.Error('error-devices-param-not-provided', 'The parameter "groupId" is required');
        }

        if (!SimpleChat.Groups.findOne(groupId)) {
          throw new Meteor.Error('error-group-not-existed', 'Group(' + groupId + ') do not exist!');
        }
  
        var devices = Devices.find({
          groupId: groupId
        }, {
          fields: {
            _id: 0
          }
        }).fetch();
  
        return _.isEmpty(devices) ? api.success({ result: '未找到结果' }) : devices;
      } catch (e) {
        return api.failure(e.message, e.error);
      }
    }
  }
});

Api.addRoute('devices/:uuid', {
  authRequired: true
}, {
  delete: function () {
    try {
      var uuid = this.urlParams.uuid && this.urlParams.uuid.trim();

      if (!uuid) {
        throw new Meteor.Error('error-devices-param-not-provided', 'The parameter "uuid" is required');
      }

      var device = Devices.findOne({
        uuid: uuid
      });
      if (!device) {
        return api.success({
          result: '未找到结果'
        });
      }

      Meteor.users.remove({
        username: uuid
      });
      SimpleChat.GroupUsers.remove({
        group_id: device.gorupId,
        user_name: uuid
      });
      Devices.remove({
        uuid: uuid
      });

      return api.success();
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});