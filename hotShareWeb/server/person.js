PERSON = {
  upsetDevice: function(uuid, group_id,name,in_out){
    var device = Devices.findOne({uuid: uuid});
    if (!device){
      device = {
        _id: new Mongo.ObjectID()._str,
        uuid: uuid,
        name: name ? name : '设备 ' + (Devices.find({}).count() + 1),
        in_out:in_out,
        groupId: group_id,
        createAt: new Date()
      };
      Devices.insert(device);
    }
    else{
      if (group_id && name && in_out) {
        Devices.update({uuid: uuid}, {$set: {groupId: group_id,name:name,in_out:in_out}});
      }
      device = Devices.findOne({uuid: uuid});
    }
    return device;
  },
  removeName: function(group_id,uuid, id){
    var person = null;
    if (group_id && id) {
      person = Person.findOne({group_id:group_id ,'faces.id': id}, {sort: {createAt: 1}});
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
    var person = Person.findOne({group_id:group_id, name: name}, {sort: {createAt: 1}});
    var dervice = Devices.findOne({uuid: uuid});
    var personName = PersonNames.findOne({group_id: group_id, name: name});

    if (!personName)
      PersonNames.insert({group_id: group_id, url: url, id: id, name: name, createAt: new Date(), updateAt: new Date()});
    else
      PersonNames.update({_id: name._id}, {$set: {name: name, url: url, id: id, updateAt: new Date()}})

    if (person){
      person.url = url;
      person.updateAt = new Date();
      if(_.pluck(person.faces, 'id').indexOf(id) === -1)
        person.faces.push({id: id, url: url});
      else
        person.faces[_.pluck(person.faces, 'id').indexOf(id)].url = url;
      Person.update({_id: person._id}, {$set: {name: name, url: person.url, updateAt: person.updateAt, faces: person.faces}});
    } else if (Person.find({group_id: group_id, faceId: id}).count() > 0){
      person = Person.findOne({group_id: group_id, faceId: id}, {sort: {createAt: 1}});
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
        id: Person.find({group_id: group_id, faceId: id}).count() + 1,
        group_id:group_id,
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
    if (id && group_id) {
      person = Person.findOne({group_id: group_id, 'faces.id': id}, {sort: {createAt: 1}});
    }
    if (person)
      return person.name;
    return null;
  },
  getIdByName: function(uuid, name, group_id){
    var person = null;
    if (group_id && name) {
      person = Person.findOne({group_id: group_id, name: name}, {sort: {createAt: 1}});
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
    if(group_id && names) {
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
    groupDevice = Devices.findOne({'uuid': personInfo.uuid})
    if (!groupDevice || !groupDevice.uuid || !groupDevice.in_out) {
        console.log('groupDevice:' + groupDevice.uuid + ' dir:' + groupDevice.in_out)
        return console.log("Device not found, please scanf qrcode to join group")
    }
    personInfo.in_out = groupDevice.in_out;
    Activity.insert(personInfo);

    var ai_system_url = process.env.AI_SYSTEM_URL || 'http://aixd.raidcdn.cn/restapi/workai';
    personInfo.fromWorkai = true;
    HTTP.call('POST', ai_system_url, {
      data: personInfo, timeout: 5*1000
    }, function(error, res) {
      if (error) {
        return console.log("post person info to aixd.raidcdn failed " + error);
      }
    });
  },
  //App用户关联过的员工，更新考勤信息
  updateWorkStatus: function(ai_person_id){
    relation = WorkAIUserRelations.findOne({'ai_persons.id': ai_person_id})
    if(!relation || !relation.group_id || !relation.ai_persons || !relation.person_name) {
      console.log("invalid arguments of updateWorkStatus")
      return
    }
    //TODO: 两边时间格式不统一，比较起来不方便
    //var now = new Date();
    //var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    var time_offset = 8; //US is -7, China is +8 
    
    // if (relation.group_id == '73c125cc48a83a95882fced3'){
    //   //SWLAB 
    //   time_offset = -7
    // }else if (relation.group_id == 'd2bc4601dfc593888618e98f'){
    //   //Kuming LAB
    //   time_offset = 8
    // }
    
    var group = SimpleChat.Groups.findOne({_id: relation.group_id});
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }
    
    console.log('offsetTimeZone ' + time_offset);
    function DateTimezone(offset) {
      var d = new Date();
      var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      var local_now = new Date(utc + (3600000*offset))

      return local_now;
    }
    
    var now = DateTimezone(time_offset);
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var today_utc = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      0, 0, 0, 0);


    //不是今天的记录都设置为0
    relation.checkout_time = (!relation.checkout_time) ? 0 : (relation.checkout_time < today) ? 0 : relation.checkout_time;
    relation.checkin_time  = (!relation.checkin_time)  ? 0 : (relation.checkin_time  < today) ? 0 : relation.checkin_time;
    relation.ai_in_time    = (!relation.ai_in_time)    ? 0 : (relation.ai_in_time    < today) ? 0 : relation.ai_in_time;
    relation.ai_out_time   = (!relation.ai_out_time)   ? 0 : (relation.ai_out_time   < today) ? 0 : relation.ai_out_time;
    relation.ai_lastest_in_time   = (!relation.ai_lastest_in_time)   ? 0 : (relation.ai_lastest_in_time   < today) ? 0 : relation.ai_lastest_in_time;

    var outtime = 0;
    outtime = (relation.checkout_time > relation.ai_out_time) ? relation.checkout_time : relation.ai_out_time;
    outtime = (outtime > today) ? outtime : 0;

    //最新一次进门的时间
    var lastest_in_time = (relation.checkin_time > relation.ai_lastest_in_time) ? relation.checkin_time : relation.ai_lastest_in_time;

    var intime = 0;
    if(relation.ai_in_time == 0 || relation.checkin_time == 0) {
      //取出不等于0的就是intime
      intime = (relation.ai_in_time > relation.checkin_time) ? relation.ai_in_time : relation.checkin_time;
    }
    else {
      //取出较小的就是intime
      intime = (relation.ai_in_time > relation.checkin_time) ? relation.checkin_time : relation.ai_in_time;
    }
    // var in_time = null;//上班时间
    // if (intime > 0) {
    //   var in_time_date = new Date(intime);
    //   in_time = in_time_date.getHours()+':'+in_time_date.getMinutes();

    // }
    // var out_time = null;//下班时间
    // if (outtime > 0) {
    //   var out_time_date = new Date(outtime);
    //   out_time = out_time_date.getHours()+':'+out_time_date.getMinutes();

    // }

    var in_image = '';
    var out_image = '';
    var now_status = "out"; //in/out
    var in_status = "unknown";
    var out_status = "unknown";
    //normal   工作时间大于8小时 或 9:00am前上班

    //in/out image
    if(intime > today && intime == relation.checkin_time)
      in_image = relation.checkin_image;
    else if(intime > today && intime == relation.ai_in_time)
      in_image = relation.ai_in_image;
    if(outtime > today && outtime == relation.checkout_time)
      out_image = relation.checkout_image;
    else if(outtime > today && outtime == relation.ai_out_time)
      out_image = relation.ai_out_image;

    //有in没有out就是绿色，其他是灰色
    if(lastest_in_time > today && lastest_in_time > outtime)
      now_status = "in";

    //9点以前上班是绿色, 之后是红色
    if(intime == 0)
      in_status = "unknown";
    else if(intime > 0 && intime <= (today + 9*60*60*1000))
      in_status = "normal";
    else if(intime > 0 && intime > (today + 9*60*60*1000))
      in_status = "warning";

    if(outtime == 0)
      out_status = "unknown";
    //没看到in却有out,或者先看到出后看到进
    else if(outtime > 0 && (intime ==0 || intime > outtime))
      out_status = "error"
    //不足8小时
    else if(outtime > 0 && intime > 0 && outtime > intime && (outtime - intime) < 8*60*60*1000)
      out_status = "warning"
    else if(outtime > 0 && intime > 0 && outtime > intime && (outtime - intime) >= 8*60*60*1000)
      out_status = "normal"

    var in_uuid = relation.in_uuid;
    var out_uuid = relation.out_uuid;

    //var date = Date.now();
    //var mod = 24*60*60*1000;
    //today2 = date - (date % mod);

    var setObj = {
        "status"      : now_status,
        "in_status"   : in_status,
        "out_status"  : out_status,
        "in_time"     : intime,
        "out_time"    : outtime
    };
    if(relation.in_uuid)
      setObj.in_uuid = relation.in_uuid;
    if(relation.out_uuid)
      setObj.out_uuid = relation.out_uuid;
    if(in_image)
      setObj.in_image = in_image;
    if(out_image)
      setObj.out_image = out_image;

    if (relation.app_user_id) {
      workstatus = WorkStatus.findOne({'group_id': relation.group_id, 'app_user_id': relation.app_user_id, 'date': today_utc});
    }
    else{
      workstatus = WorkStatus.findOne({'group_id': relation.group_id, 'person_name': relation.person_name, 'date': today_utc});
    }
    if (!workstatus) {
      WorkStatus.insert({
        "app_user_id" : relation.app_user_id,
        "group_id"    : relation.group_id,
        "date"        : today_utc,
        "person_id"   : relation.ai_persons,
        "person_name" : relation.person_name,
        "status"      : now_status,
        "in_status"   : in_status,
        "out_status"  : out_status,
        "in_uuid"     : relation.in_uuid,
        "out_uuid"    : relation.out_uuid,
        "whats_up"    : "",
        "in_time"     : intime,
        "in_image"    : in_image,
        "out_image"   : out_image,
        "out_time"    : outtime
      });
    }
    else {
      WorkStatus.update({_id: workstatus._id}, {$set: setObj});
    }
  },
  // update Device TimeLine
  updateToDeviceTimeline: function(uuid,group_id,obj){
    console.log('updateToDeviceTimeline= uuid:'+uuid+', group_id:'+group_id+' ,obj:'+JSON.stringify(obj));
    if(!uuid || !group_id || !obj){
      return;
    }
    var hour = new Date();
    hour.setMinutes(0);
    hour.setSeconds(0);
    hour.setMilliseconds(0);

    var minutes = new Date();
    minutes = minutes.getMinutes();

    var selector = {
      hour: hour,
      uuid: uuid,
      group_id: group_id
    };
    var modifier = {
      $push:{}
    };
    if(!obj.ts){
      obj.ts = Date.now();
    }
    modifier["$push"]["perMin."+minutes] = obj;
    DeviceTimeLine.update(selector, modifier, {upsert: true},function(err,res){
      if(err){
        console.log('updateToDeviceTimeline2 Err:'+err);
      } else {
        console.log('updateToDeviceTimeline2 Success');
      }
    });
  },
  updateToDeviceTimeline2: function(obj){
    console.log('updateToDeviceTimeline2= '+JSON.stringify(obj));
    if(!obj.uuid || !obj.group_id || !obj.ts){
      return;
    }
    var ts = obj.ts;
    var person_name = obj.person_name || null;

    var hour = new Date(ts);
    hour.setMinutes(0);
    hour.setSeconds(0);
    hour.setMilliseconds(0);

    var minutes = new Date(ts);
    minutes = minutes.getMinutes();

    var selector = {
      hour: hour,
      uuid: obj.uuid,
      group_id: obj.group_id,
    };
    var modifier = {
      $set:{}
    };
    selector["perMin."+minutes+".ts"] = ts
    if(obj.user_id && obj.user_name){
      modifier["$set"]["perMin."+minutes+".$.app_user_id"] = obj.user_id;
      modifier["$set"]["perMin."+minutes+".$.app_user_name"] = obj.user_name;
    }
    modifier["$set"]["perMin."+minutes+".$.person_name"] = person_name;
    DeviceTimeLine.update(selector,modifier,function(err,res){
      if(err){
        console.log('updateToDeviceTimeline2 Err:'+err);
      } else {
        console.log('updateToDeviceTimeline2 Success');
      }
    });

  }
};

Meteor.methods({
  'upset-device': function(uuid){
    return PERSON.upsetDevice(uuid, null,null,null);
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
      personItem = Person.findOne({faceId:person.id,group_id:person.group_id});
      person.id = personItem._id;
      PERSON.sendPersonInfoToWeb(person);
  },
  'update-device-name':function(id,val,option){
    var user = Meteor.users.findOne({_id:id});
    console.log('update-device-name');
    var text = '';
    if (!user) {
      return;
    }
    if (user.profile && user.profile.fullname) {
      text = user.profile.fullname + '更名为：'+val;
    }
    else{
      text = '设备['+user.username+']更名为：'+val;
    }
    Meteor.users.update({_id: id}, {$set: {'profile.fullname': val}});
    SimpleChat.GroupUsers.update({user_id:id},{$set:{'user_name':val}},{multi: true, upsert:false});
    var optionUser =  Meteor.users.findOne({_id:option});
    SimpleChat.GroupUsers.find({user_id: id}).observe({
         added: function(document) {
           sendMqttMessage('/msg/g/'+ document.group_id, {
              _id: new Mongo.ObjectID()._str,
              form: {
                id: optionUser._id,
                name: optionUser.profile.fullname || option.username,
                icon: optionUser.profile.icon
              },
              to: {
                id: document.group_id,
                name: document.group_name,
                icon: document.group_icon
              },
              images: [],
              to_type: "group",
              type: "text",
              text: text,
              create_time: new Date(),
              is_read: false
            })
         }
      });
  },
    
  // 群相册里的批量标注
  'upLabels': function(groupId, labelName, waitLabels){
    this.unblock();

    waitLabels.map(function(wait){
      var name = PERSON.getIdByName(wait.uuid, labelName, groupId);
      var mqttMsg = {
        group_id: groupId,
        type: 'trainset',
        url: wait.url,
        person_id: name && name.id ? name.id : '',
        device_id: wait.uuid,
        face_id: name && name.faceId ? name.faceId : wait.id,
        drop: false,
        img_type: wait.img_type,
        style: wait.style,
        sqlid: wait.sqlid
      };
      sendMqttMessage('/device/' + groupId, mqttMsg);
      console.log('send mqtt to device:', mqttMsg);
      PERSON.setName(groupId, wait.uuid, wait.id, wait.url, labelName)
    });
    return true;
  }
})
