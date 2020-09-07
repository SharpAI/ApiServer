var api = require('../api.js');

var Api = api.ApiV1;

// get
Api.addRoute('ai-messages', {
  authRequired: false
}, {
  get: function () {
    try {
      var params = this.queryParams;
      var personId = params.personId && params.personId.trim();
      var isRead = (params.isRead && params.isRead.trim()) == 'true';
  
      if (!personId) {
        throw new Meteor.Error('error-ai-message-param-not-provided', 'The parameter "personId"is required');
      }

      return AiMessages.find({personId: personId, isRead: isRead}).fetch();
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});