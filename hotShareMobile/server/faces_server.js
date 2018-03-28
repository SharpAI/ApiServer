
var generatePersonName = function (group_id) {
  var count = PersonNames.find({group_id: group_id}).count();
  count += 1;
  var person_name = 'Person '+count;
  return person_name;  
}

Meteor.methods({
  'faceLabelAsUnknown': function(_id){
    return Faces.remove({_id: _id});
  },
  'faceLabelAsPerson': function(face){
    // Step 1. generate a person name 
    var name = generatePersonName(face.group_id);
    // Step 2. add to group person name 
    PersonNames.insert({
      group_id: face.group_id,
      uuid: face.uuid,
      url: face.img_url,
      id: face.id,
      name: name,
      createAt: new Date()
    });
    // Step 3. add to group person 
    var device = Devices.findOne({uuid: face.uuid});
    Person.insert({
      id: 1,
      group_id: face.group_id,
      uuid: face.uuid,
      faceId: face.id,
      url: face.img_url,
      name: name,
      faces: [
        {
          id: face.id,
          url: face.img_url
        }
      ],
      deviceId: device._id,
      DeviceName: device.name,
      createAt: new Date(),
      updateAt: new Date(),
      imgCount: 1
    });
    // Step 4. remove the face 
    Faces.remove({_id: face._id});
  }
});