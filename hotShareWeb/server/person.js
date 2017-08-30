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

    var time_offset = 8; //US is -7, China is +8 

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
    
    intime = (intime > today_utc)?intime:0
    outtime = (outtime >= intime)?outtime: 0;

    var in_image = '';
    var out_image = '';
    var now_status = "out"; //in/out
    var in_status = "unknown";
    var out_status = "unknown";
    var in_video = '';
    var out_video = '';
    //normal   工作时间大于8小时 或 9:00am前上班

    //in/out image
    if(intime > today && intime == relation.checkin_time){
      in_image = relation.checkin_image;
      in_video = relation.checkin_video;
    }
    else if(intime > today && intime == relation.ai_in_time)
      in_image = relation.ai_in_image;
    if(outtime > today && outtime == relation.checkout_time){
      out_image = relation.checkout_image;
      out_video = relation.checkout_video;
    }
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
    if (in_video) {
      setObj.in_video = in_video;
    }
    if (out_video) {
      setObj.out_video = out_video;
    }

    var workstatus = null;
    if (relation.app_user_id) {
      workstatus = WorkStatus.findOne({'group_id': relation.group_id, 'app_user_id': relation.app_user_id, 'date': today_utc});
    }
    if (!workstatus && relation.person_name) {
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
        "in_video"    : in_video,
        "out_image"   : out_image,
        "out_time"    : outtime,
        "out_video"   : out_video
      });
    }
    else {
      if (outtime > workstatus.out_time){
        
        var deviceUser = Meteor.users.findOne({username: relation.out_uuid});

        if (deviceUser) {
          var msgObj = {
            _id: new Mongo.ObjectID()._str,
            form:{
              id: deviceUser._id,
              name: deviceUser.profile.fullname,
              icon: deviceUser.profile.icon
            },
            to: {
              id:   relation.app_user_id,
              name: relation.person_name,
              icon: ''
            },
            to_type: 'user',
            type: 'text',
            text: '你已经下班了吗?',
            create_time: new Date(),
            is_read: false,
          };
          
          if(relation.app_user_id){
            console.log(msgObj)
            // sendMqttUserMessage(relation.app_user_id,msgObj);
          }
        }
      }
      
      if (!workstatus.app_user_id && relation.app_user_id) {
        setObj.app_user_id = relation.app_user_id;
      }
      WorkStatus.update({_id: workstatus._id}, {$set: setObj});
    }
  },
  //更新历史考勤信息
  updateWorkStatusHistory: function(workStatusObj){
  //{
  //  "group_id": "cc30c1b5b49ea17c7145b270",
  //  "in_uuid": "7YRBBDB712001377",
  //  "checkin_time": 1503559323910,
  //  "checkin_image": "http://workaiossqn.tiegushi.com/ed506346-889c-11e7-bcbb-d065caa7da61",
  //  "app_user_id": "iXSQHnLkDqEQ9cZFC",
  //  "app_user_name": "天天向上",
  //  "isWaitRelation": false,
  //  "person_name": "lambda"
  //}
    if(!(workStatusObj && (workStatusObj.checkin_time || workStatusObj.checkout_time) && workStatusObj.group_id))
      return;

    var time_offset = 8; //US is -7, China is +8 
    var group = SimpleChat.Groups.findOne({_id: workStatusObj.group_id});
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }

    if(workStatusObj.checkin_time)
      var day = new Date(workStatusObj.checkin_time);
    else if(workStatusObj.checkout_time)
      var day = new Date(workStatusObj.checkout_time);
    var day_utc = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate() , 0, 0, 0, 0);
    var day_local = day_utc - (3600000*time_offset)
    var workstatus = null;

    var workstatus = null;
    if (workStatusObj.app_user_id) {
      workstatus = WorkStatus.findOne({'group_id': workStatusObj.group_id, 'app_user_id': workStatusObj.app_user_id, 'date': day_utc});
    }
    if (!workstatus && workStatusObj.person_name) {
      workstatus = WorkStatus.findOne({'group_id': workStatusObj.group_id, 'person_name': workStatusObj.person_name, 'date': day_utc});
    }

    var in_image = '';
    var out_image = '';
    var in_video = '';
    var out_video = '';
    var now_status = "out"; //in/out
    var in_status = "unknown";
    var out_status = "unknown";
    var intime = 0;
    var outtime = 0;
    var checkin_time = 0;
    var checkout_time = 0;

    if(workStatusObj && workStatusObj.in_uuid && workStatusObj.checkin_time && workStatusObj.checkin_image) {
      checkin_time = workStatusObj.checkin_time;
    }
    else if(workStatusObj && workStatusObj.out_uuid && workStatusObj.checkout_time && workStatusObj.checkout_image) {
      checkout_time = workStatusObj.checkout_time;
    }

    //这一天存在考勤记录
    if (workstatus) {
      intime = workstatus.in_time ? workstatus.in_time : 0;
      outtime = workstatus.out_time ? workstatus.out_time : 0;

      //进
      if(checkin_time>0) {
          intime = (intime>0 && intime<checkin_time) ? intime : checkin_time;
          in_image = (intime>0 && intime>checkin_time) ? workstatus.in_image : workStatusObj.checkin_image;
          in_video = (intime>0 && intime>checkin_time) ? workstatus.checkin_video : workStatusObj.checkin_video;
          in_status = workstatus.in_status;
          out_status = workstatus.out_status;
      }
      //出
      if(checkout_time>0) {
          outtime = (outtime>0 && outtime>checkout_time) ? outtime : checkout_time;
          out_image = (outtime>0 && outtime>checkout_time) ? workstatus.out_image : workStatusObj.checkout_image;
          out_video = (outtime>0 && outtime>checkout_time) ? workstatus.out_video : workStatusObj.checkout_video;
          in_status = workstatus.in_status;
          out_status = workstatus.out_status;
      }
    }
    else {
      if(checkin_time>0) {
        in_image = workstatus.in_image;
        intime = checkin_time;
      }
      if(checkout_time>0) {
        out_image = workstatus.out_image;
        outtime = checkout_time;
      }
    }

    //9点以前上班是绿色, 之后是红色
    if(intime == 0)
      in_status = "unknown";
    else if(intime > 0 && intime <= (day_local + 9*60*60*1000))
      in_status = "normal";
    else if(intime > 0 && intime > (day_local + 9*60*60*1000))
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

    var setObj = {
        "status"      : now_status,
        "in_status"   : in_status,
        "out_status"  : out_status,
        "in_time"     : intime,
        "out_time"    : outtime
    };
    if(workStatusObj.in_uuid)
      setObj.in_uuid = workStatusObj.in_uuid;
    if(workStatusObj.out_uuid)
      setObj.out_uuid = workStatusObj.out_uuid;
    if(in_image)
      setObj.in_image = in_image;
    if(out_image)
      setObj.out_image = out_image;
    if (workStatusObj.checkin_video) {
      setObj.in_video = workStatusObj.checkin_video;
    }
    if (workStatusObj.checkout_video) {
      setObj.out_video = workStatusObj.checkout_video;
    }

    if (!workstatus) {
      WorkStatus.insert({
        "app_user_id" : workStatusObj.app_user_id,
        "group_id"    : workStatusObj.group_id,
        "date"        : day_utc,
        "person_id"   : workStatusObj.ai_persons,
        "person_name" : workStatusObj.person_name,
        "status"      : now_status,
        "in_status"   : in_status,
        "out_status"  : out_status,
        "in_uuid"     : workStatusObj.in_uuid,
        "out_uuid"    : workStatusObj.out_uuid,
        "whats_up"    : "",
        "in_time"     : intime,
        "in_image"    : in_image,
        "in_video"    : workStatusObj.checkin_video,
        "out_image"   : out_image,
        "out_time"    : outtime,
        "out_video"   : workStatusObj.checkout_video
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
