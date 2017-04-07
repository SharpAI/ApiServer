PERSON = {
  upsetDevice: function(uuid){
    var device = Devices.findOne({uuid: uuid});
    if (!device){
      device = {
        _id: new Mongo.ObjectID()._str,
        uuid: uuid,
        name: '设备 ' + (Devices.find({}).count() + 1),
        createAt: new Date()
      };
      Devices.insert(device);
    }
    return device;
  },
  setName: function(uuid, id, url, name){
    var person = Person.findOne({uuid: uuid, name: name});
    var dervice = PERSON.upsetDevice(uuid);

    if (person){
      person.url = url;
      person.updateAt = new Date();
      if(person.faces.indexOf(id) === -1)
        person.faces.push({id: id, url: url});
      else
        person.faces[person.faces.indexOf(id)].url = url;
      Person.update({_id: person._id}, {$set: {url: person.url, updateAt: person.updateAt, faces: person.faces}});
    } else if (Person.find({uuid: uuid, faceId: id}).count() > 0){
      person = Person.findOne({uuid: uuid, faceId: id});
      person.name = name;
      person.url = url;
      person.updateAt = new Date();
      person.faces[person.faces.indexOf(id)].url = url;
      Person.update({_id: person._id}, {$set: {url: person.url, updateAt: person.updateAt, faces: person.faces}});
    } else {
      person = {
        _id: new Mongo.ObjectID()._str,
        id: Person.find({uuid: uuid, faceId: id}).count() + 1,
        uuid: uuid,
        faceId: id,
        url: url,
        name: name,
        faces: [{id: id, url: url}],
        deviceId: device._id,
        DeviceName: device.name,
        createAt: new Date(),
        updateAt: new Date()
      };
      Person.insert(person);
    }

    return person;
  },
  getName: function(uuid, id){
    var person = Person.findOne({uuid: uuid, 'faces.id': id});
    if (person)
      return person.name;
    return null;
  },
  getNames: function(){
    // TODO: 需改为从数据取
    return [
      {name: '张三', url: '/userPicture.png'},
      {name: '李四', url: '/userPicture.png'}
    ];
  }
};

Meteor.methods({
  'upset-device': function(uuid){
    return PERSON.upsetDevice(uuid);
  },
  'set-person-name': function(uuid, id, url, name){
    return PERSON.setName(uuid, id, url, name);
  },
  'get-names': function(){
    return PERSON.getNames();
  }
})