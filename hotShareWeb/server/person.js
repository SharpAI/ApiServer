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
    var personName = PersonNames.findOne({name: name});

    if (!personName)
      PersonNames.insert({url: url, uuid: uuid, id: id, name: name, createAt: new Date(), updateAt: new Date()});
    else
      PersonNames.update({_id: name._id}, {$set: {name: name, url: url, uuid: uuid, id: id, updateAt: new Date()}})

    if (person){
      person.url = url;
      person.updateAt = new Date();
      if(_.pluck(person.faces, 'id').indexOf(id) === -1)
        person.faces.push({id: id, url: url});
      else
        person.faces[_.pluck(person.faces, 'id').indexOf(id)].url = url;
      Person.update({_id: person._id}, {$set: {name: name, url: person.url, updateAt: person.updateAt, faces: person.faces}});
    } else if (Person.find({uuid: uuid, faceId: id}).count() > 0){
      person = Person.findOne({uuid: uuid, faceId: id});
      person.name = name;
      person.url = url;
      person.updateAt = new Date();
      if(_.pluck(person.faces, 'id').indexOf(id) === -1)
        person.faces.push({id: id, url: url});
      else
        person.faces[_.pluck(person.faces, 'id').indexOf(id)].url = url;
      Person.update({_id: person._id}, {$set: {name: name, url: person.url, updateAt: person.updateAt, faces: person.faces}});
    } else {
      person = {
        _id: new Mongo.ObjectID()._str,
        id: Person.find({uuid: uuid, faceId: id}).count() + 1,
        uuid: uuid,
        faceId: id,
        url: url,
        name: name,
        faces: [{id: id, url: url}],
        deviceId: dervice._id,
        DeviceName: dervice.name,
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
  getIdByName: function(uuid, name){
    var person = Person.findOne({uuid: uuid, name: name});
    if (!person)
      return null;
    return {
      id: person.id,
      faceId: person.faceId
    };
  }
};

Meteor.methods({
  'upset-device': function(uuid){
    return PERSON.upsetDevice(uuid);
  },
  'set-person-name': function(uuid, id, url, name){
    return PERSON.setName(uuid, id, url, name);
  },
  'get-id-by-name': function(uuid, name){
    return PERSON.getIdByName(uuid, name) || {};
  }
})