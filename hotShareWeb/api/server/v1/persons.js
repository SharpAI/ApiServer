var api = require('../api.js');

var Api = api.ApiV1;

// get All
Api.addRoute('persons', {
  authRequired: false
}, {
  get: function () {
    try {
      var groupId = this.queryParams.groupId && this.queryParams.groupId.trim();
      var name = this.queryParams.name && this.queryParams.name.trim();
      var faceId = this.queryParams.faceId && this.queryParams.faceId.trim();

      if (!groupId || !name) {
        throw new Meteor.Error('error-persons-param-not-provided', 'The parameter "groupId" or "name" is required');
      }

      var condition = {
        group_id: groupId,
        name: name
      };
      if (faceId) {
        condition.faceId = faceId;
      }

      var person = Person.find(condition, {
        fields: {
          id: 0,
          faces: 0,
          imgCount: 0,
          DeviceName: 0,
          deviceId: 0
        }
      }).fetch();
      return _.isEmpty(person) ? api.success({
        result: '未找到结果'
      }) : person;
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});

Api.addRoute('persons/:id', {
  authRequired: false
}, {
  get: function() {
    try {
      var id = this.urlParams.id && this.urlParams.id.trim();
      return Person.findOne(id, {fields: {group_id: 1, name: 1, url: 1, faceId: 1}});
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  },
  post: function () {
    try {
      var id = this.urlParams.id && this.urlParams.id.trim();
      var name = this.bodyParams.name && this.bodyParams.name.trim();

      var person = Person.findOne(id);
      if (!person) {
        throw new Meteor.Error('error-persons-doc-not-existed', 'The person is not existed!');
      }

      if (name) {
        if (person.name == name) {
          return api.success();
        }

        Meteor.call('renamePerson', id, name);
      } else {
        throw new Meteor.Error('error-persons-param-not-provided', 'The parametor "name" is required')
      }

      return api.success();
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  },
  delete: function () {
    try {
      var id = this.urlParams.id && this.urlParams.id.trim();
      var person = Person.findOne(id);

      if (!person) {
        throw new Meteor.Error('error-person-doc-not-existed', 'person is not existed!')
      }

      Meteor.call('removePersonById', id);
      var trainsetObj = {
        group_id:    person.group_id,
        face_id:     person.faceId,
        drop_person: true
      };
      sendMqttMessage('/device/' + person.group_id, trainsetObj);

      // 重新训练
      api.retrain(person.group_id);

      return api.success();
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});