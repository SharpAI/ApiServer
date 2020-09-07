var api = require('../api.js');

var Api = api.ApiV1;

// get
Api.addRoute('faces/:id', {
  authRequired: false
}, {
  get: function () {
    try {
      var id = this.urlParams.id && this.urlParams.id.trim();

      if (!id) {
        throw new Meteor.Error('error-faces-param-not-provided', 'The parameter "id" is required');
      }

      var result = Faces.findOne({
        id: id
      });

      return _.isEmpty(result) ? api.success({
        result: '未找到结果'
      }) : result;
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});