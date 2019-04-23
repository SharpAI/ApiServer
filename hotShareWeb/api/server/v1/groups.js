var api = require('../api.js');

var Api = api.ApiV1;

function insertFace(params) {
  var doc = {
    uuid:       params.uuid,
    name:       params.name,
    group_id:   params.groupId,
    img_url:    params.imgUrl,
    position:   params.position,
    type:       params.type == 'human_shape' ? params.type : 'face',
    current_ts: new Date().getTime(),
    accuracy:   params.accuracy,
    fuzziness:  params.fuzziness,
    sqlid:      params.sqlid,
    style:      params.style || 'front',
    tid:        params.tid,
    img_ts:     params.img_ts,
    p_ids:      params.p_ids,
    createdAt:  new Date()
  };

  if (!params.name && params.faceId) {
    doc.id = params.faceId;
    var person = Person.findOne({faceId: params.faceId});
    if (!person) {
      throw new Meteor.Error('error-persons-not-found', 'faceId(' + params.faceId + ') person Not Found');
    } else {
      doc.name = person.name;
    }
  } else {
    doc.id = doc.current_ts + doc.uuid;
  }

  var device = Devices.findOne({
    uuid: doc.uuid
  });
  if (device && device.name) {
    doc.device_name = device.name;
  }

  var faceId = Faces.insert(doc);

  return Faces.findOne(faceId);
}

// TODO: person.js 有相应method ”set-person-names“，但是不通用，后期可优化
function label(groupId, items, action = '用户API上传标记') {
  if (!_.isArray(items)) return;

  PERSON.updateLabelTimes(groupId, items);

  _.each(items, function (item) {
    var isHumanShape = item.type == 'human_shape'; // 其他类型默认识别为face
    var person = PERSON.setName(groupId, item.uuid, item.faceId, item.imgUrl, item.name, false, isHumanShape);
    var labelInfo = {
      group_id: groupId,
      uuid:     item.uuid,
      id:       item.faceId,
      url:      item.imgUrl,
      name:     item.name,
      sqlid:    item.sqlid,
      style:    item.style,
      type:     item.type,
      action:   action
    };

    LABLE_DADASET_Handle.insert(labelInfo);

    var trainsetObj = _.defaults({
      type:     'trainset',
      person_id: person._id,
      device_id: person.deviceId,
      face_id:   person.faceId,
      drop:      false,
      img_type:  item.type,
    }, labelInfo);

    sendMqttMessage('/device/' + groupId, trainsetObj);
  });
}

function checkFaceData(face) {
  var imgUrl = face.imgUrl && face.imgUrl.trim();
  var uuid   = face.uuid && face.uuid.trim();
  var name   = face.name && face.name.trim();
  var faceId = face.faceId && face.faceId.trim();
  var type   = face.type && face.type.trim();

  if (!imgUrl || !uuid || !type || (!name && !faceId)) {
    throw new Meteor.Error('error-faces-param-not-provided', 'The parameter "imgUrl" or "type" or "uuid" or "name" or "faceId" is required');
  }

  if (!Devices.findOne({uuid: uuid})) {
    throw new Meteor.Error('error-deivce-not-existed', 'Device(' + uuid + ')  do not exist!');
  }
}

/**
 * 
 * 标注单张
 * @urlParam groupId {string}
 * @bodyParam
 * {
 *    "imgurl":     图片地址, (必填)
 *    "uuid":       设备Id (必填)
 *    "faceId":     face Id (和name 至少存在一个)
 *    "name":       标注名称 (和faceId 至少存在一个)
 *    "position":   位置 (选填)
 *    "type":       类型.默认:face (选填)
 *    "current_ts": 当前时间 毫秒 (选填)
 *    "accuracy":   图片精准度 (选填)
 *    "fuzziness":  图片模糊度 (选填)
 *    "sqlid":      本地sqlid (选填)
 *    "style":      人脸类型(前脸 front,左脸 left_side,右脸right_side)。默认:front (选填)
 *    "tid":        连续图片id (选填)
 *    "img_ts":     图片拍摄时间 毫秒 (选填)
 *    "p_ids":      同一时间拍摄的多张图片 (选填)
 * }
 */
Api.addRoute('groups/:groupId/faces', {
  authRequired: false
}, {
  post: function () {
    try {
      var groupId = this.urlParams.groupId && this.urlParams.groupId.trim();
      if (!groupId) {
        throw new Meteor.Error('error-group-faces-param-not-provided', 'The parameter "groupId" is required');
      }

      if (!SimpleChat.Groups.findOne(groupId)) {
        throw new Meteor.Error('error-group-not-existed', 'Group(' + groupId + ') do not exist!');
      }

      var params = this.bodyParams;
      checkFaceData(params);

      var face = insertFace(params);
      var item = {
        uuid: face.uuid,
        faceId: face.id,
        imgUrl: face.img_url,
        name: face.name,
        sqlid: face.sqlid,
        style: face.style,
        type: face.type
      };

      // 标注训练
      label(groupId, [item]);

      return api.success();
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});

/**
 * 
 * batch
 * @urlParam  groupId {string}
 * @bodyParam 
 * {
 *   "create": [
 *      {obj1(格式同标注单张 bodyParam)},
 *      {obj2(格式同标注单张 bodyParam)},
 *      ... 
 *   ]
 * }
 */
Api.addRoute('groups/:groupId/faces/batch', {
  authRequired: false
}, {
  post: function () {
    try {
      var groupId = this.urlParams.groupId && this.urlParams.groupId.trim();
      if (!groupId) {
        throw new Meteor.Error('error-group-faces-param-not-provided', 'The parameter "groupId" is required');
      }

      if (!SimpleChat.Groups.findOne(groupId)) {
        throw new Meteor.Error('error-group-not-existed', 'Group(' + groupId + ') do not exist!');
      }

      var params = this.bodyParams;
      if (_.isEmpty(params) || _.isEmpty(params.create)) {
        throw new Meteor.Error('error-faces-param-not-provided', 'The parameter " " is required');
      }

      var items = [];
      _.each(params.create, function (param) {
        checkFaceData(param);

        var face = insertFace(param);
        var item = {
          uuid: face.uuid,
          faceId: face.id,
          imgUrl: face.img_url,
          name: face.name,
          sqlid: face.sqlid,
          style: face.style
        };

        items.push(item);
      });

      Meteor.setTimeout(function() { 
        label(groupId, items);
      }, 200);
      
      return api.success();
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});

Api.addRoute('groups', {
  authRequired: true
}, {
  get: {
    authRequired: false,
    action: function () {
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
  },
  post: function () {
    try {
      var params = this.bodyParams;
      
      var name = params.name && params.name.trim();
      if (!name) {
        throw new Meteor.Error('error-groups-param-not-provided', 'The parameter "name" is required');
      }

      if (SimpleChat.Groups.findOne({name: name, 'creator.id': this.userId})) {
        throw new Meteor.Error('error-groups-already-existed', 'Group has already existed!');
      }

      var id = new Mongo.ObjectID()._str;
      var user = this.user;
      SimpleChat.Groups.insert({
        _id: id,
        name: name,
        icon: '',
        describe: '',
        create_time: new Date(),
        template: null,
        offsetTimeZone: (new Date().getTimezoneOffset())/-60,
        last_text: '',
        last_time: new Date(),
        barcode: rest_api_url + '/restapi/workai-group-qrcode?group_id=' + id,
        //建群的人
        creator:{
          id: user._id,
          name: user.profile && user.profile.fullname ? user.profile.fullname : user.username
        }
      }, function (err, result) {
        if(err) {
          throw new Meteor.Error('error-groups-created-error', 'created failed!');
        }
        
        SimpleChat.GroupUsers.insert({
          group_id: id,
          group_name: name,
          group_icon: '',
          user_id: user._id,
          user_name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
          user_icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
          create_time: new Date()
        });
      });
      
      return {groupId: id};
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});

Api.addRoute('groups/:groupId/users', {
  authRequired: false
}, {
  post: function() {
    try {
      var userId = this.bodyParams.userId && this.bodyParams.userId.trim();

      if (!userId) {
        throw new Meteor.Error('error-groups-users-param-not-provided', 'The parameter "userId" is required');
      }

      var group = SimpleChat.Groups.findOne(this.urlParams.groupId);
      if (!group) {
        throw new Meteor.Error('error-group-not-existed', 'Group(' + this.urlParams.groupId + ') do not exist!');
      }

      var user = Meteor.users.findOne(userId);
      if (!user) {
        throw new Meteor.Error('error-user-not-existed', 'User(' + userId + ') do not exist!');
      }

      var groupUser = SimpleChat.GroupUsers.findOne({group_id: group._id, user_id: user._id});
      if (groupUser) {
        throw new Meteor.Error('error-group-user-already-existed', 'GroupUsers has already existed!');
      }

      SimpleChat.GroupUsers.insert({
        group_id: group._id,
        group_name: group.name,
        group_icon: '',
        user_id: user._id,
        user_name: user.profile && user.profile.fullname ? user.profile.fullname : user.username,
        user_icon: user.profile && user.profile.icon ? user.profile.icon : '/userPicture.png',
        create_time: new Date()
      });

      return api.success();
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});

Api.addRoute('groups/:groupId/person', {
  authRequired: false
}, {
  get: function() {
    try {
      var groupId = this.urlParams.groupId && this.urlParams.groupId.trim();
      
      var group = SimpleChat.Groups.findOne(groupId);
      if (!group) {
        throw new Meteor.Error('error-group-not-existed', 'Group(' + groupId + ') do not exist!');
      }

      return Person.find({group_id: groupId}, {fields: {group_id: 1, name: 1, url: 1, faceId: 1, faces: 1}}).fetch();
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
});

Api.addRoute('groups/:groupId/devices', {
  authRequired: true
}, {
  post: function() {
    try {
      var groupId = this.urlParams.groupId && this.urlParams.groupId.trim();
      var bodyParams = this.bodyParams;

      var uuid = bodyParams.uuid && bodyParams.uuid.trim();
      var deviceName = bodyParams.deviceName && bodyParams.deviceName.trim();
      var type = bodyParams.type && bodyParams.type.trim();

      if (!uuid || !deviceName || !type) {
        throw new Meteor.Error('error-groups-devices-param-not-provided', 'The parameter "uuid" and "deviceName" and "type" is required');
      }

      Meteor.call('join-group', uuid, groupId, deviceName, type);

      return api.success();
    } catch (e) {
      return api.failure(e.message, e.error);
    }
  }
})

