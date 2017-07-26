PERSON = {
  upsetDevice: function(uuid, group_id){
    var device = Devices.findOne({uuid: uuid});
    if (!device){
      device = {
        _id: new Mongo.ObjectID()._str,
        uuid: uuid,
        name: '设备 ' + (Devices.find({}).count() + 1),
        groupId: group_id,
        createAt: new Date()
      };
      Devices.insert(device);
    }
    else if(!device.groupId || (group_id && device.groupId != group_id)) {
      Devices.update({uuid: uuid}, {$set: {groupId: group_id}});
      device = Devices.findOne({uuid: uuid});
    }
    return device;
  },
  removeName: function(group_id,uuid, id){
    var person = null;
    if (group_id && uuid) {
      person = Person.findOne({uuid: uuid, group_id:group_id ,'faces.id': id});
    }
    else if (uuid) {
      person = Person.findOne({uuid: uuid, group_id:group_id ,'faces.id': id});
    }
    if (person){
      if (person.faceId === id){
        if (person.faces.length <= 1)
          return Person.remove({_id: person._id});
        Person.update({_id: person._id}, {
          $set: {faceId: person.faces[0].id, url: person.faces[0].url},
          $pop: {faces: -1}
        });
      } else {
        var faces = person.faces;
        faces.splice(_.pluck(faces, 'id').indexOf(id), 1);
        Person.update({_id: person._id}, {
          $set: {faces: faces}
        });
      }
    }
    //PersonNames.remove({uuid: uuid, id: id});
  },
  setName: function(group_id, uuid, id, url, name){
    var person = Person.findOne({uuid: uuid, group_id:group_id, name: name});
    var dervice = PERSON.upsetDevice(uuid, group_id);
    var personName = PersonNames.findOne({group_id: group_id, name: name});

    if (!personName)
      PersonNames.insert({group_id: group_id, url: url, uuid: uuid, id: id, name: name, createAt: new Date(), updateAt: new Date()});
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
    } else if (Person.find({uuid: uuid, group_id: group_id, faceId: id}).count() > 0){
      person = Person.findOne({uuid: uuid, group_id: group_id, faceId: id});
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
        id: Person.find({uuid: uuid,group_id: group_id, faceId: id}).count() + 1,
        group_id:group_id,
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
  getName: function(uuid,group_id,id){
    var person = null;
    if (uuid && group_id) {
      //person = Person.findOne({uuid: uuid, group_id: group_id, 'faces.id': id});
      person = Person.findOne({group_id: group_id, 'faces.id': id}, {sort: {createAt: 1}});
    }
    else if (uuid){
      person = Person.findOne({uuid: uuid, 'faces.id': id});
    }
    if (person)
      return person.name;
    return null;
  },
  getIdByName: function(uuid, name, group_id){
    var person = null;
    if (uuid && group_id && name) {
      //person = Person.findOne({uuid: uuid, group_id: group_id, name: name});
      person = Person.findOne({group_id: group_id, name: name}, {sort: {createAt: 1}});
    }
    else if (uuid && name) {
      person = Person.findOne({uuid: uuid, name: name});
    }
    else if(group_id && name) {
      person = Person.findOne({group_id: group_id, name: name});
    }
    if (!person)
      return null;
    return {
      id: person.id,
      faceId: person.faceId
    };
  },
  getIdByNames: function(uuid, names, group_id){
    var limit = names.length;
    var persons = null;
    var result = {};
    if (uuid && group_id && names) {
      //persons = Person.find({name: {$in: names}, uuid: uuid ,group_id:group_id}, {sort: {updateAt: -1}, limit: limit}).fetch()
      persons = Person.find({name: {$in: names}, group_id: group_id}, {sort: {createAt: 1}, limit: limit}).fetch()
    }
    else if(uuid && names) {
      persons = Person.find({name: {$in: names}, uuid: uuid}, {sort: {createAt: 1}, limit: limit}).fetch()
    }
    else if(group_id && names) {
      persons = Person.find({name: {$in: names}, group_id: group_id}, {sort: {createAt: 1}, limit: limit}).fetch()
    }

    if (persons.length <= 0){
      for(var i=0;i<names.length;i++)
        result[names[i]] = {id: null, faceId: null};
    } else {
      for(var i=0;i<persons.length;i++)
        result[persons[i].name] = {id: persons[i].id, faceId: persons[i].faceId};
    }

    console.log('getIdByNames:', result);
    return result;
  },
  sendPersonInfoToWeb: function(personInfo){
    var ai_system_url = process.env.AI_SYSTEM_URL || 'http://aixd.raidcdn.cn/restapi/workai';
    personInfo.fromWorkai = true;
    HTTP.call('POST', ai_system_url, {
      data: personInfo, timeout: 5*1000
    }, function(error, res) {
      if (error) {
        return console.log("post person info to aixd.raidcdn failed " + error);
      }
    });
  }
};

Meteor.methods({
  'upset-device': function(uuid){
    return PERSON.upsetDevice(uuid, null);
  },
  'set-person-name': function(group_id, uuid, id, url, name){
    return PERSON.setName(group_id, uuid, id, url, name);
  },
  'get-id-by-name': function(uuid, name){
    return PERSON.getIdByName(uuid, name, null) || {};
  },
  'get-id-by-names': function(uuid, names){
    return PERSON.getIdByNames(uuid, names, null) || {};
  },
  'get-id-by-name1': function(uuid, name, group_id){
    return PERSON.getIdByName(uuid, name, group_id) || {};
  },
  'get-id-by-names1': function(uuid, names, group_id){
    return PERSON.getIdByNames(uuid, names, group_id) || {};
  },
  'set-person-names': function(group_id, items){
    console.log('set-person-names:', items);
    for(var i=0;i<items.length;i++)
      PERSON.setName(group_id, items[i].uuid, items[i].id, items[i].url, items[i].name);
  },
  'remove-person': function(group_id,uuid,id){
    return PERSON.removeName(group_id,uuid, id);
  },
  'remove-persons': function(items){
    for(var i=0;i<items.length;i++)
      PERSON.removeName(null,items[i].uuid, items[i].id);
  },
  'remove-persons1': function(group_id, items){
    for(var i=0;i<items.length;i++)
      PERSON.removeName(group_id, items[i].uuid, items[i].id);
  },
  'send-person-to-web': function(person){
      PERSON.sendPersonInfoToWeb(person);
  }
})
