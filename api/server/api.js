function failure(result, errorType, errorCode) {
  if (_.isObject(result)) {
    result.success = false;
  } else {
    result = {
      success: false,
      error: result
    };

    if (errorType) {
      result.errorType = errorType;
    }
  }

  result = {
    statusCode: errorCode || 400,
    body: result,
  };

  return result;
}

function success(result) {
  var result = result || {};
  if (_.isObject(result)) {
    result.success = true;
  }

  result = {
    statusCode: 200,
    body: result,
  };

  return result;
}

function retrain(groupId) {
  var group = SimpleChat.Groups.findOne(groupId);

  if (!group) {
    return;
  }

  var msg = {
    _id: new Mongo.ObjectID()._str,
    from: {},
    to: {
      id: group._id,
      name: group.name,
      icon: group.icon
    },
    to_type: 'group',
    type: 'text',
    text: 'train',
    create_tiem: new Date(),
    is_read: false,
    wait_classify: false
  };

  sendMqttGroupMessage(groupId, msg);
}

var ApiV1 = new Restivus({
  defaultHeaders: {
    'Content-Type': 'application/json'
  },
  onLoggedIn: function () {
    console.log(this.user.username + ' (' + this.userId + ') logged in');
  },
  onLoggedOut: function () {
    console.log(this.user.username + ' (' + this.userId + ') logged out');
  },
  prettyJson: true,
  useDefaultAuth: true,
  version: 'v1'
});

// signup
ApiV1.addRoute('sign-up', {
  authRequired: false
}, {
  post: function() {
    try {
      var params = this.bodyParams;
      var username = params.username && params.username.trim();
      var email = params.email && params.email.trim();
      var password = params.password && params.password.trim();

      if (!username || !email || !password) {
        throw new Meteor.Error('error-sign-up-param-not-provided', 'The parameter "username" or "email" or "password" is required');
      }

      var emailRegExp = /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{2,6}/;
      if (emailRegExp.test(email) == false) {
        throw new Meteor.Error('error-email-address-formatted', 'Is that a correct email address?');
      }

      if (password.length < 6) {
        throw new Meteor.Error('error-password-length', 'Please input a password longer than 6 char');
      }

      Accounts.createUser({
        username:username,
        email: email,
        password: password
      });

      return success();
    } catch (e) {
      return failure(e.message, e.error);
    }
  }
});

module.exports = {
  ApiV1: ApiV1,
  success: success,
  failure: failure,
  retrain: retrain
};
