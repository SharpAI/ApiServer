var api = require('../api.js');

var Api = api.ApiV1;

Api.addRoute('groups', {
  authRequired: false
}, {
  get: function () {
    try {
      var params    = this.queryParams;
      var groupName = params.groupName && params.groupName.trim();
      var creator   = params.creator&& params.creator.trim();

      if (!groupName || !creator) {
        throw new Meteor.Error('error-groups-param-not-provided', 'The parameter "groupName" or "creator" is required');
      }

      var group = SimpleChat.Groups.findOne({name: groupName, 'creator.name': creator});
      return group || api.success({ result: '未找到对应结果' });
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});