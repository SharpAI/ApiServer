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
  useDefaultAuth: true,
  version: 'v1',
  prettyJson: true
});

module.exports = {
  ApiV1: ApiV1,
  success: success,
<<<<<<< HEAD
  failure: failure
};

// if (Meteor.isServer) {
//   var Api = new Restivus({
//     useDefaultAuth: true,
//     version: 'v1',
//     prettyJson: true
//   });

//   // Api.addCollection(Faces);
//   // faces
//   Api.addRoute('faces', {authRequired: false}, {
//     get: function() {
//       var result;
//       try {
//         console.log(this.queryParams);
//         var groupId = this.queryParams.groupId && this.queryParams.groupId.trim();
//         var name = this.queryParams.name && this.queryParams.name.trim();

//         if (!groupId || !name) {
//           throw new Meteor.Error('error-faces-param-not-provided', 'The parameter "groupId" or "name" is required');
//         } 

//         result = Person.findOne({group_id: groupId, name: name}, {fields: {_id: 0, group_id: 1, name: 1, faceId: 1, url: 1}});
//         result = result || success({result: '未找到结果'});
//       } catch (e) {
//         result = failure(e.message, e.error);
//       }

//       return result;
//     },
//     post: function () {
//       var result;
//       try {
//         console.log(this.bodyParams.groupId);
//         console.log(this.bodyParams.imgUrl);
//         console.log(this.bodyParams.uuid);
        
//         var groupId = this.bodyParams.groupId && this.bodyParams.groupId.trim();
//         var imgUrl = this.bodyParams.imgUrl && this.bodyParams.imgUrl.trim();
//         var uuid = this.bodyParams.uuid && this.bodyParams.uuid.trim();

//         if (!groupId || !imgUrl || !uuid) {
//           throw new Meteor.Error('error-faces-param-not-provided', 'The parameter "groupId" or "imgUrl" or "uuid" is required');
//         }

//         var doc = {
//           uuid:     uuid,
//           group_id: groupId,
//           img_url:  imgUrl,
//           position: this.bodyParams.position,
//           type:     'face',
//           current_ts: new Date().getTime(),
//           accuracy:   this.bodyParams.accuracy,
//           fuzziness:  this.bodyParams.fuzziness,
//           sqlid:      this.bodyParams.sqlid,
//           style:      this.bodyParams.style,
//           tid:        this.bodyParams.tid,
//           img_ts:     this.bodyParams.img_ts,
//           p_ids:      this.bodyParams.p_ids
//         };
//         doc.id = doc.current_ts + uuid;

//         console.log(doc);
//         Faces.insert(doc);

//         result = success({faceId: doc.id});
//       } catch (e) {
//         result = failure(e.message, e.error);
//       }

//       return result;
//     }
//   });
// }
=======
  failure: failure,
  retrain: retrain
};
>>>>>>> 标注API & README
