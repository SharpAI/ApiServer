function failure(result, errorType) {
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
    statusCode: 400,
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

module.exports = {
  ApiV1: ApiV1,
  success: success,
  failure: failure,
  retrain: retrain
};
