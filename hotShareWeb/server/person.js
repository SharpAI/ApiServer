cleanLeftRelationAndStatusDate = function(){
  // 清理，移除person后遗留的相关数据（仅在本地开发环境下使用）
  WorkAIUserRelations.find({}).forEach(function(item){
    item.ai_persons.forEach(function(personIds){
      var person = null;
      person = Person.findOne({_id: personIds.id});
      if(!person){
        console.log(item.person_name+' need remove from relations at group '+ item.group_id + ' and person id is '+ personIds.id);
        WorkAIUserRelations.remove({_id: item._id});
        WorkStatus.remove({group_id: item.group_id, 'person_id.id': personIds.id});
      }
    })
  });
};


var Fiber = Npm.require('fibers');
var gLastTrainTimestamp = {};

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
  removeName: function(group_id,uuid, id,url,is_video){
    console.log('try remove name');
    console.log('>>> id=' + id + ' url=' + url)

    /* 这张图片是误识别的，并且被人错误标注“对” */
    // Person.find({group_id:group_id ,'faces.url': url}).forEach(function(item){
    //     console.log('>>> remove mistake url and id, person.name=' + item.name + ' id=' + id + ' url=' + url)
    //     Person.update({"_id": item._id}, {$pull: {'faces': {"url": url}}})
    // });

    var person = null;
    if (group_id && id) {
      person = Person.findOne({group_id:group_id ,'faces.id': id}, {sort: {createAt: 1}});
    }
    if (person){
      if (!is_video) {
        PERSON.fixRelationOrWorkStatus(group_id, url,person._id);
      }
      // if (person.faceId === id){
      //   if (person.faces.length <= 1)
      //     return Person.remove({_id: person._id});
      //   Person.update({_id: person._id}, {
      //     $set: {faceId: person.faces[0].id, url: person.faces[0].url},
      //     $pop: {faces: -1}
      //   });
      // } else {
      //   var faces = person.faces;
      //   faces.splice(_.pluck(faces, 'id').indexOf(id), 1);
      //   Person.update({_id: person._id}, {
      //     $set: {faces: faces}
      //   });
      // }
    }
    //PersonNames.remove({uuid: uuid, id: id});  [{id:'1'},{}] ['1','2']
  },
  removeFace: function(obj){
    console.log('try remove faces');
    var person = null;
    var faces = [];
    if(obj.group_id){
      person = Person.findOne({group_id: obj.group_id, faceId: obj.faceId});
    }
    if(person){
      faces = person.faces;
      var faceId = person.faceId;
      if(faceId === obj.face_id){
        if(faces.length <= 1){
          return Person.remove({_id: person._id});
        }
        Person.update({_id: person._id}, {
          $set: {faceId: person.faces[0].id, url: person.faces[0].url},
          $pop: {faces: -1}
        });
      } else {
        faces.splice(_.pluck(faces, 'id').indexOf(obj.face_id), 1);
        Person.update({_id: person._id},{$set: {faces: faces}});
      }
    }
  },
  updateLabelTimes: function(group_id, items) {
    var names = [];
    for (var i = 0; i < items.length; i++){
      if(items[i].name && names.indexOf(items[i].name) < 0) {
        names.push(items[i].name);
      }
    }

    for (var x = 0; x < names.length; x++ ){
      var person = Person.findOne({group_id:group_id, name: names[x]}, {sort: {createAt: 1}});
      if ( person ) {
        Person.update({_id: person._id}, {
          $inc: {label_times: 1}
        });
      }
    }
    console.log('==sr==. names =='+ JSON.stringify(names));
  },
  setName: function(group_id, uuid, id, url, name, is_video, is_human_shape, callback){
    var person = Person.findOne({group_id:group_id, name: name}, {sort: {createAt: 1}});
    var dervice = Devices.findOne({uuid: uuid});
    var personName = PersonNames.findOne({group_id: group_id, name: name});

    if (!personName)
      PersonNames.insert({group_id: group_id, url: url, id: id, name: name, createAt: new Date(), updateAt: new Date()});
    // else
    //   PersonNames.update({_id: name._id}, {$set: {name: name, url: url, id: id, updateAt: new Date()}})

    if (person){
      if (is_video) {
        return person;
      }
      person.url = url;
      person.updateAt = new Date();
      if (is_human_shape) {
        if(person.human_shape == undefined){
          person.human_shape = [];
        }
        if(_.pluck(person.human_shape, 'id').indexOf(id) === -1)
          person.human_shape.push({id: id, url: url});
        else
          person.human_shape[_.pluck(person.human_shape, 'id').indexOf(id)].url = url;
        // Person.update({_id: person._id}, {$set: {name: name, url: person.url, updateAt: person.updateAt, faces: person.faces}});
        console.log("update person.humanshapes = "+JSON.stringify(person.human_shape));
        Person.update({_id: person._id}, {$set: {updateAt: person.updateAt, human_shape: person.human_shape}});
      } else {
        if(person.faces == undefined){
          person.faces = [];
        }
        if(_.pluck(person.faces, 'id').indexOf(id) === -1)
          person.faces.push({id: id, url: url});
        else
          person.faces[_.pluck(person.faces, 'id').indexOf(id)].url = url;
        // Person.update({_id: person._id}, {$set: {name: name, url: person.url, updateAt: person.updateAt, faces: person.faces}});
        console.log("update person.faces = "+JSON.stringify(person.faces));
        Person.update({_id: person._id}, {$set: {updateAt: person.updateAt, faces: person.faces}});
      }
      
      //标记，立即训练
      var obj = SimpleChat.Groups.findOne({_id: group_id});
      var to = {
        id: obj._id,
        name: obj.name,
        icon: obj.icon
      };
      var device_user = Meteor.users.findOne({username: uuid})
      var form = {};
      if (device_user) {
        form = {
            id: device_user._id,
            name: device_user.profile && device_user.profile.fullname ? device_user.profile.fullname : device_user.username,
            icon: device_user.profile.icon
          };
      }
      var msg = {
        _id: new Mongo.ObjectID()._str,
        form:form,
        to: to,
        to_type: 'group',
        type: 'text',
        text: 'train',
        create_time: new Date(),
        is_read: false,
        is_trigger_train:true
      };
      try{
        var now = new Date().getTime();
        var groupLastTrain = gLastTrainTimestamp[group_id];
        if (groupLastTrain == undefined || groupLastTrain == null)
          groupLastTrain = 0;
        if (now - groupLastTrain > 10*1000) {
          gLastTrainTimestamp[group_id] = now;
          sendMqttGroupMessage(group_id,msg);
        }
      } catch (e){
        console.log('try sendMqttGroupMessage Err:',e)
      }
    }
    //此段代码会导致person表的名字会被篡改
    /*
    else if (Person.find({group_id: group_id, faceId: id}).count() > 0){
      person = Person.findOne({group_id: group_id, faceId: id}, {sort: {createAt: 1}});
      person.name = name;
      person.url = url;
      person.updateAt = new Date();
      if (!is_video) {
        if(_.pluck(person.faces, 'id').indexOf(id) === -1)
          person.faces.push({id: id, url: url});
        else
          person.faces[_.pluck(person.faces, 'id').indexOf(id)].url = url;
      }
      Person.update({_id: person._id}, {$set: {name: name, url: person.url, updateAt: person.updateAt, faces: person.faces}});
    }*/
     else {
      if(is_human_shape){
        person = {
          _id: new Mongo.ObjectID()._str,
          id: Person.find({group_id: group_id, faceId: id}).count() + 1,
          group_id:group_id,
          faceId: id,
          url: url,
          name: name,
          human_shape: [{id: id, url: url}],
          deviceId: dervice._id,
          DeviceName: dervice.name,
          label_times: 1,
          createAt: new Date(),
          updateAt: new Date()
        };
      }else{
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
          label_times: 1,
          createAt: new Date(),
          updateAt: new Date()
        };
      }
      if (is_video) {
        delete person.faces;
        delete person.faceId;
      }
      console.log("insert person = "+JSON.stringify(person));
      Person.insert(person);
      //标记新人，立即训练
      var obj = SimpleChat.Groups.findOne({_id: group_id});
      var to = {
        id: obj._id,
        name: obj.name,
        icon: obj.icon
      };
      var device_user = Meteor.users.findOne({username: uuid})
      var form = {};
      if (device_user) {
        form = {
            id: device_user._id,
            name: device_user.profile && device_user.profile.fullname ? device_user.profile.fullname : device_user.username,
            icon: device_user.profile.icon
          };
      }
      var msg = {
        _id: new Mongo.ObjectID()._str,
        form:form,
        to: to,
        to_type: 'group',
        type: 'text',
        text: 'train',
        create_time: new Date(),
        is_read: false,
        is_trigger_train:true
      };
      try{
        var now = new Date().getTime();
        var groupLastTrain = gLastTrainTimestamp[group_id];
        if (groupLastTrain == undefined || groupLastTrain == null)
          groupLastTrain = 0;
        if (now - groupLastTrain > 10*1000) {
          gLastTrainTimestamp[group_id] = now;
          sendMqttGroupMessage(group_id,msg);
        }
      } catch (e){
        console.log('try sendMqttGroupMessage Err:',e)
      }
    }
    callback && callback();
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
      _id:person._id,
      id: person.id,
      faceId: person.faceId
    };
  },
  getIdByNames: function(uuid, names, group_id){
    var limit = names.length;
    var persons = null;
    var result = {};
    if(group_id && names) {
      persons = Person.find({group_id: group_id, name: {$in: names}}, {sort: {createAt: 1}, limit: limit}).fetch()
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

    /*var ai_system_url = process.env.AI_SYSTEM_URL || 'http://aixd.raidcdn.cn/restapi/workai';
    personInfo.fromWorkai = true;
    HTTP.call('POST', ai_system_url, {
      data: personInfo, timeout: 5*1000
    }, function(error, res) {
      if (error) {
        return console.log("post person info to aixd.raidcdn failed " + error);
      }
    });*/
  },
  checkIsToday:function(checktime,group_id){
    var isToday = true;
    var time_offset = 8; //US is -7, China is +8
    var group = SimpleChat.Groups.findOne({_id:group_id});
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }
    function DateTimezone(date,offset) {
      //var d = new Date();
      var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      var local_now = new Date(utc + (3600000*offset));
      var today_now = new Date(local_now.getFullYear(), local_now.getMonth(), local_now.getDate(),
        local_now.getHours(), local_now.getMinutes());
      return today_now;
    }
    var now = DateTimezone(new Date(),time_offset);
    checktime = DateTimezone(new Date(checktime),time_offset);

    var DayDiff = now.getDate() - checktime.getDate();

    if (DayDiff != 0){
      console.log('ai_checkin_out: not today out/in ');
      isToday = false;
    }
    return isToday;
  },
  //打卡签到
  aiCheckInOutHandle:function(data){
    /*
    var data = {
          user_id:Meteor.userId(),
          checkin_time: create_time,
          face_id：people_id,
          wantModify:true
          person_info: {
              'id': personInfo[name].faceId,
              'uuid': uuid,
              'name': name,
              'group_id': userGroup.group_id,
              'img_url': url,
              'type': img_type,
              'ts': create_time.getTime(),
              'accuracy': accuracy,
              'fuzziness': fuzziness
            }
        };
     */
    console.log('ai_checkin_out:',JSON.stringify(data));
    var person_info = data.person_info;
    if (!data.face_id || !person_info || ! person_info.group_id) {
      return {result:'error',reason:'参数不全'};
    }

    /*重打卡/代打卡　选择了不是今天的图片，要写到对应的天的出现记录里面,不要更新WorkAIUserRelations*/
    var checktime = data.checkout_time || data.checkin_time || person_info.ts;
    var isToday = PERSON.checkIsToday(checktime,person_info.group_id);

    var setObj = {group_id:person_info.group_id};
    if (data.checkin_time) {
      setObj.in_uuid = person_info.uuid;
      setObj.checkin_time = new Date(data.checkin_time).getTime() ;
      setObj.checkin_image = data.checkin_image || person_info.img_url;
      setObj.checkin_video = person_info.video_src;
      if (data.wantModify) {
        setObj.ai_in_time = setObj.checkin_time;
      }
    }
    if (data.checkout_time) {
      setObj.out_uuid = person_info.uuid;
      setObj.checkout_time = new Date(data.checkout_time).getTime();
      setObj.checkout_image = data.checkout_image || person_info.img_url;
      setObj.checkout_video = person_info.video_src;
      if (data.wantModify) {
        setObj.ai_out_time = setObj.checkout_time;
      }
    }

    //聊天室标记
    if (data.formLabel) {
      var device = Devices.findOne({uuid:person_info.uuid});
      if (device) {
        if (device.in_out === 'in') {
          setObj.checkin_time = person_info.ts;
          data.checkin_image = person_info.img_url;
          setObj.checkin_image = person_info.img_url;
        }
        else if (device.in_out === 'out') {
          setObj.checkout_time = person_info.ts;
          data.checkout_image = person_info.img_url;
          setObj.checkout_image = person_info.img_url;
        }
      }
    }
    var user = Meteor.users.findOne({_id:data.user_id});
    if (!user) {
      console.log('label some person~');
      //return {result:'error',reason:'用户不存在'};
    }
    var person = Person.findOne({group_id: person_info.group_id, 'faces.id': data.face_id}, {sort: {createAt: 1}});
    var user_name = user ? (user.profile && user.profile.fullname ? user.profile.fullname : user.username) : '';
    var person_name = person_info.name;
    var relation  = null;
    var is_video = false;
    if (person_info.type === 'video') {
      is_video = true;
    }
    var is_human_shape = false;
    if (person_info.type === 'human_shape') {
      is_human_shape = true;
    }
    if (person && person.name) {
      console.log('person info:'+person.name);
    }
    else{
      if (!person_name) { //打卡时选择了没有识别出的人且没输入名字的
        if (!user) { //标识了但是没关联过App用户的
          return {result:'error',reason:'请选择一张有名字的照片或前往聊天室进行标记~'};
        }
        else{
          relation = WorkAIUserRelations.findOne({'app_user_id':user._id,'group_id':person_info.group_id});
        }
        if (relation && relation.person_name) {
          person_name = relation.person_name;
        }
        else{
          return {result:'error',reason:'请选择一张有名字的照片或前往聊天室进行标记~'};
        }
      }
      person = PERSON.setName(person_info.group_id, person_info.uuid, data.face_id, person_info.img_url, person_name,is_video, is_human_shape);
      if (!is_video) {
        console.log('LABLE_DADASET_Handle 1')
        LABLE_DADASET_Handle.insert({group_id:person_info.group_id,id:data.face_id,url:person_info.img_url,uuid:person_info.uuid,sqlid:person_info.sqlid,style:person_info.style,user_id:data.operator,name:person_name,action:'时间轴打卡时选择了未识别的照片'});
      }

    }
    if (data.user_id) {
      setObj.app_user_id = data.user_id;
      setObj.app_user_name = user_name;
      setObj.app_notifaction_status = user && user.token ? 'on' : 'off';
    }
    setObj.isWaitRelation = data.user_id ? false :true ; //是否关联了App账号
    //relation = WorkAIUserRelations.findOne({'ai_persons.id':person._id});
    //console.log('user :'+JSON.stringify(user));
    //console.log('relation: '+JSON.stringify(relation));
    // if (relation && user && relation.app_user_id && relation.app_user_id !== user._id) {
    //   return {result:'error',reason:'此人已被'+relation.app_user_name+'选择,请重新选择照片'};
    // }
    if (!relation && user) {
      relation = WorkAIUserRelations.findOne({'app_user_id':user._id,'group_id':person_info.group_id});
    }
    if (!relation && person_name) {
      relation = WorkAIUserRelations.findOne({'person_name':person_name,'group_id':person_info.group_id});
      //名字被占用了的情况
      if (relation && relation.app_user_id && user && relation.app_user_id !== user._id) {
        return {result:'error',reason:'名称「' + person_name + '」已被用户 ' + relation.app_user_name + '使用，请换一个新的名称'};
      }
    }
    person_name = relation && relation.person_name ? relation.person_name : person_name;
    //关联时输入的名字和person表的名字不一致或者person表的名字与关联用户的人名不一样
    //例如：app账号：天天向上 关联的用户名：张骏
    //     有人在聊天室将没有识别的张骏的图片错误label成了宋荣鹏
    //     app用户在打卡的时候选择张骏的图片时就应该先将错误的label数据删除
    if (person_name && person_name !== person.name) {
      console.log('person_info name isnt person name');
      PERSON.removeName(person_info.group_id, person_info.uuid, data.face_id,person_info.img_url,is_video);
      var newImageId = new Mongo.ObjectID()._str;
      person = PERSON.setName(person_info.group_id,person_info.uuid,newImageId,person_info.img_url,person_name,is_video,is_human_shape);
      if (!is_video) {
        console.log('LABLE_DADASET_Handle 2')
        LABLE_DADASET_Handle.insert({group_id:person_info.group_id,id:newImageId,url:person_info.img_url,uuid:person_info.uuid,sqlid:person_info.sqlid,style:person_info.style,user_id:'',name:person_name,action:'时间轴打卡时输入的名字与person中对应的人名字不一样'});
      }
    }
    setObj.person_name = person.name;
    if (relation) {
      if (!relation.checkin_image && data.checkin_image) {
        setObj.checkin_image = data.checkin_image;
      }
      if (!relation.checkout_image && data.checkout_image) {
        setObj.checkout_image = data.checkout_image;
      }
      if (!relation.isWaitRelation) {
        setObj.isWaitRelation = false;
      }
      if(_.pluck(relation.ai_persons, 'id').indexOf(person._id) === -1){
        relation.ai_persons.push({id: person._id});
        setObj.ai_persons = relation.ai_persons;
      }
      //聊天室标记或者打卡设备记录出现时，如果选取的照片拍摄时间小于当前的出现上班时间或大于当前的下班时间才应当更新出现；如果是主页出现点更改监控时间或个人信息重打卡则都更改
      if (!data.wantModify) {
        var time = setObj.checkin_time || setObj.checkout_time;
        var d = new Date(time);
        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        var time_offset = 8; //US is -7, China is +8
        var group = SimpleChat.Groups.findOne({_id:setObj.group_id});
        if (group && group.offsetTimeZone) {
          time_offset = group.offsetTimeZone;
        }
        var now = new Date(utc + (3600000*time_offset));
        var day = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        var day_utc = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 0, 0, 0, 0);
        console.log('day_utc:'+day_utc);

        var workstatus = null;
        if (relation.app_user_id) {
          workstatus = WorkStatus.findOne({'group_id': relation.group_id, 'app_user_id': relation.app_user_id, 'date': day_utc});
        }
        if (!workstatus && relation.person_name) {
          workstatus = WorkStatus.findOne({'group_id': relation.group_id, 'person_name': relation.person_name, 'date': day_utc});
        }
        if (workstatus) {
          //当前出现上班时间小于标记时间
          if (workstatus.in_time && setObj.checkin_time && workstatus.in_time > 0 && workstatus.in_time < setObj.checkin_time) {
            // delete setObj.checkin_time;
            // delete setObj.checkin_image;
            // delete setObj.checkin_video;
            console.log('workstatus in_time earlier than setObj checkin_time');
            setObj.checkin_time = workstatus.in_time;
            setObj.checkin_image = workstatus.in_image;
            setObj.checkin_video = workstatus.in_video;
          }
          //当前出现下班时间大于标记时间
          if (workstatus.out_time && setObj.checkout_time && workstatus.out_time > setObj.checkout_time) {
            console.log('workstatus out_time later than setObj checkout_time');
            setObj.checkout_time = workstatus.out_time;
            setObj.checkout_image = workstatus.out_image;
            setObj.checkout_video = workstatus.out_video;
          }
        }
      }
      if(isToday == true)
        WorkAIUserRelations.update({_id:relation._id},{$set:setObj});
      else
        if(data.user_id && !relation.app_user_id){
          var setObj2 = {
            app_user_id:data.user_id,
            app_user_name:user_name,
            isWaitRelation:false,
            app_notifaction_status:user && user.token ? 'on' : 'off'
          };
          WorkAIUserRelations.update({_id:relation._id},{$set:setObj2});
      }
    }
    else{
        setObj.ai_persons = [{id:person._id}];
        if (!setObj.in_uuid) {
           var device = SimpleChat.GroupUsers.findOne({group_id:setObj.group_id,in_out:'in'});
           if (device) {
            setObj.in_uuid = device.username;
           }
        }
        if (!setObj.out_uuid) {
          var device = SimpleChat.GroupUsers.findOne({group_id:setObj.group_id,in_out:'out'});
          if (device) {
            setObj.out_uuid = device.username;
           }
        }
        setObj.checkin_image = data.checkin_image;
        setObj.checkout_image = data.checkout_image;
        WorkAIUserRelations.insert(setObj);
    }
    person_info.name = person.name;
    person_info.id = person._id;
    person_info.wantModify = data.wantModify;
    if(isToday == true)
      PERSON.updateWorkStatus(person._id);
    else
      PERSON.updateWorkStatusHistory(setObj);
    PERSON.sendPersonInfoToWeb(person_info);

    var timeLineData = {
      uuid:person_info.uuid,
      group_id:person_info.group_id,
      person_id:person_info.person_id ? person_info.person_id : null,
      user_id: user ? user._id : null,
      user_name:user_name,
      person_name:person.name,
      img_url:person_info.img_url,
      ts:person_info.ts,
      type:person_info.type,
      accuracy: person_info.accuracy,
      fuzziness: person_info.fuzziness,
      sqlid: person_info.sqlid,
      style: person_info.style

    };
    PERSON.updateToDeviceTimeline2(timeLineData);
    return {result:'succ'};
  },
  //App用户关联过的成员，更新出现信息
  updateWorkStatus: function(ai_person_id){
    console.log('updateWorkStatus -->'+ai_person_id);
    relation = WorkAIUserRelations.findOne({'ai_persons.id': ai_person_id})
    if(!relation || !relation.group_id || !relation.ai_persons || !relation.person_name) {
      console.log("invalid arguments of updateWorkStatus")
      return
    }
    if(!relation.checkin_image  && !relation.checkout_image && !relation.ai_in_image && !relation.ai_out_image){
      console.log("invalid arguments of updateWorkStatus,check image")
      return
    }

    var time_offset = 8; //US is -7, China is +8

    var group_intime = '09:00'; //默认上班时间9点
    var group_outtime = '18:00'; //默认下班时间18点

    var group = SimpleChat.Groups.findOne({_id: relation.group_id});
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }
    if (group && group.group_intime) {
      group_intime = group.group_intime;
    }
    if (group && group.group_outtime) {
      group_outtime = group.group_outtime;
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

    var group_intime_ary = group_intime.split(":");
    group_intime = new Date(now.getFullYear(), now.getMonth(), now.getDate(),group_intime_ary[0],group_intime_ary[1]).getTime();
    //console.log('group_intime:'+group_intime);

    var group_outtime_ary = group_outtime.split(":");
    group_outtime = new Date(now.getFullYear(), now.getMonth(), now.getDate(),group_outtime_ary[0],group_outtime_ary[1]).getTime();
    //console.log('group_outtime:'+group_intime);


    //不是今天的记录都设置为0
    relation.checkout_time = (!relation.checkout_time) ? 0 : (!PERSON.checkIsToday(relation.checkout_time,relation.group_id)) ? 0 : relation.checkout_time;
    relation.checkin_time  = (!relation.checkin_time)  ? 0 : (!PERSON.checkIsToday(relation.checkin_time,relation.group_id)) ? 0 : relation.checkin_time;
    relation.ai_in_time    = (!relation.ai_in_time)    ? 0 : (!PERSON.checkIsToday(relation.ai_in_time,relation.group_id)) ? 0 : relation.ai_in_time;
    relation.ai_out_time   = (!relation.ai_out_time)   ? 0 : (!PERSON.checkIsToday(relation.ai_out_time,relation.group_id)) ? 0 : relation.ai_out_time;
    relation.ai_lastest_in_time   = (!relation.ai_lastest_in_time)   ? 0 : (!PERSON.checkIsToday(relation.ai_lastest_in_time,relation.group_id)) ? 0 : relation.ai_lastest_in_time;

    var outtime = 0;
    outtime = (relation.checkout_time > relation.ai_out_time) ? relation.checkout_time : relation.ai_out_time;
    outtime = (outtime > 0) ? ((PERSON.checkIsToday(outtime,relation.group_id)) ? outtime : 0 ): 0;

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

    // 如果存在 checkin_time , 那么 in_time 以 checkin_time
    if(relation.checkin_time && relation.checkin_time !== 0) {
      intime = relation.checkin_time;
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

    // intime = (intime > today_utc)?intime:0
    intime = PERSON.checkIsToday(intime,relation.group_id)?intime:0;
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
    if(intime == 0){
      in_status = "unknown";
    }
    else if(intime > 0 && intime <= group_intime){
      in_status = "normal";
    }
    else if(intime > 0 && intime > group_intime){
      in_status = "warning";
    }

    if(outtime == 0)
      out_status = "unknown";
    //没看到in却有out,或者先看到出后看到进
    else if(outtime > 0 && (intime ==0 || intime > outtime))
      out_status = "error"
    //不足8小时
    else if(outtime > 0 && intime > 0 && outtime > intime && (outtime - intime) < (group_outtime - group_intime))
      out_status = "warning"
    else if(outtime > 0 && intime > 0 && outtime > intime && (outtime - intime) >= (group_outtime - group_intime))
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
    setObj.in_video = in_video;
    setObj.out_video = out_video;

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
        "app_notifaction_status":relation.app_notifaction_status,
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
        "out_video"   : out_video,
        "hide_it"     : relation.hide_it? relation.hide_it: false
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
      setObj.app_notifaction_status = relation.app_notifaction_status;
      WorkStatus.update({_id: workstatus._id}, {$set: setObj});
    }
  },
  //更新历史出现信息
  updateWorkStatusHistory: function(workStatusObj){
    console.log('updateWorkStatusHistory --->'+JSON.stringify(workStatusObj));
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
    var group_intime = '09:00'; //默认上班时间9点
    var group_outtime = '18:00'; //默认下班时间18点

    var group = SimpleChat.Groups.findOne({_id: workStatusObj.group_id});
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }
    if (group && group.group_intime) {
      group_intime = group.group_intime;
    }
    if (group && group.group_outtime) {
      group_outtime = group.group_outtime;
    }

    function DateTimezone(offset) {
      var time = workStatusObj.checkin_time || workStatusObj.checkout_time;
      var d = new Date(time);
      var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      var local_now = new Date(utc + (3600000*offset))

      return local_now;
    }

    var now = DateTimezone(time_offset);
    var day = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var day_utc = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,
      0, 0, 0, 0);
    console.log('day_utc:'+day_utc);

    var group_intime_ary = group_intime.split(":");
    group_intime = new Date(now.getFullYear(), now.getMonth(), now.getDate(),group_intime_ary[0],group_intime_ary[1]).getTime();
    var group_outtime_ary = group_outtime.split(":");
    group_outtime = new Date(now.getFullYear(), now.getMonth(), now.getDate(),group_outtime_ary[0],group_outtime_ary[1]).getTime();

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

    //这一天存在出现记录
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
    else if(intime > 0 && intime <= (group_intime))
      in_status = "normal";
    else if(intime > 0 && intime > (group_intime))
      in_status = "warning";

    if(outtime == 0)
      out_status = "unknown";
    //没看到in却有out,或者先看到出后看到进
    else if(outtime > 0 && (intime ==0 || intime > outtime))
      out_status = "error"
    //不足8小时
    else if(outtime > 0 && intime > 0 && outtime > intime && (outtime - intime) < (group_outtime - group_intime))
      out_status = "warning"
    else if(outtime > 0 && intime > 0 && outtime > intime && (outtime - intime) >= (group_outtime - group_intime))
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
    setObj.in_video = in_video;
    setObj.out_video = out_video;
    setObj.app_notifaction_status = workStatusObj.app_notifaction_status;

    if (!workstatus) {
      WorkStatus.insert({
        "app_user_id" : workStatusObj.app_user_id,
        "app_notifaction_status":workStatusObj.app_notifaction_status,
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
        "out_video"   : workStatusObj.checkout_video,
        "hide_it"     : workStatusObj.hide_it? workStatusObj.hide_it: false
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
    var create_time = obj.ts || Date.now();
    var hour = new Date(create_time);
    hour.setMinutes(0);
    hour.setSeconds(0);
    hour.setMilliseconds(0);

    var minutes = new Date(create_time);
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
        console.log('updateToDeviceTimeline Err:'+err);
      } else {
        console.log('updateToDeviceTimeline res',res)
        console.log('updateToDeviceTimeline Success');
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
    selector["perMin."+minutes+".ts"] = ts;
    if (obj.type === 'video') {
      var deviceTimilineItem = DeviceTimeLine.findOne(selector);
      if (deviceTimilineItem) {
        var count = 1;
        //有人选择过
        //console.log('deviceTimilineItem==='+JSON.stringify(deviceTimilineItem));
        var imgIndex = _.pluck(deviceTimilineItem.perMin[minutes], 'ts').indexOf(ts);
        if (imgIndex == -1) {
          return;
        }
        var imgItem = deviceTimilineItem.perMin[minutes][imgIndex];
        console.log('imageItem==='+JSON.stringify(imgItem));
        if (imgItem.relations) {
          var index = _.pluck(imgItem.relations, 'person_name').indexOf(obj.person_name);
          console.log('index==='+index);
          if(index === -1){
            imgItem.relations.push({app_user_id: obj.user_id,app_user_name:obj.user_name,person_name:obj.person_name});
            count += imgItem.relations.length;
          }
          else{
            imgItem.relations[index].app_user_id = obj.user_id;
            imgItem.relations[index].app_user_name = obj.user_name;
            count = imgItem.relations.length;
          }
        }
        //处理老版本的已选择的情况
        else if (imgItem.app_user_id) {
          imgItem.relations = [{app_user_id: obj.user_id,app_user_name:obj.user_name,person_name:obj.person_name}];
          if (imgItem.app_user_id != obj.user_id) {
            imgItem.relations.push({app_user_id: imgItem.app_user_id,app_user_name:imgItem.app_user_name,person_name:imgItem.person_name});
            count += 1;
          }
        }
        else{
          imgItem.relations = [{app_user_id: obj.user_id,app_user_name:obj.user_name,person_name:obj.person_name}];
        }
        modifier["$set"]["perMin."+minutes+".$.relations"] = imgItem.relations;
        modifier["$set"]["perMin."+minutes+".$.relations_info"] = count + '人已选';

      }
    }
    else{
      if(obj.user_id && obj.user_name){
        modifier["$set"]["perMin."+minutes+".$.app_user_id"] = obj.user_id;
        modifier["$set"]["perMin."+minutes+".$.app_user_name"] = obj.user_name;
      }
      modifier["$set"]["perMin."+minutes+".$.person_name"] = person_name;
    }

     // 更新标注次数
    modifier["$inc"] = {};
    modifier["$inc"]["perMin."+minutes+".$.label_times"] = 1;

    DeviceTimeLine.update(selector,modifier,function(err,res){
      if(err){
        console.log('updateToDeviceTimeline2 Err:'+err);
      }else if(!res){
        // 无更新数据返回,插入新的时间轴数据
        PERSON.updateToDeviceTimeline(obj.uuid, obj.group_id, obj);
      }else {
        console.log('updateToDeviceTimeline2 Success');
      }
    });

  },
  updateValueToDeviceTimeline: function(uuid,group_id,obj){
    console.log('updateValueToDeviceTimeline= uuid:'+uuid+', group_id:'+group_id+' ,obj:'+JSON.stringify(obj));
    if(!uuid || !group_id || !obj){
      return;
    }
    var create_time = obj.ts || Date.now();
    var hour = new Date(create_time);
    hour.setMinutes(0);
    hour.setSeconds(0);
    hour.setMilliseconds(0);

    var minutes = new Date(create_time);
    minutes = minutes.getMinutes();
    console.log("create_time="+create_time+", hour="+hour)

    var selector = {
      hour: hour,
      uuid: uuid,
      group_id: group_id};
    selector["perMin."+minutes+".img_url"] = obj.img_url;
    if(!obj.ts){
      obj.ts = Date.now();
    }
    //modifier["$push"]["perMin."+minutes] = obj;
    console.log("selector="+JSON.stringify(selector));
    var deviceTimilineItem = DeviceTimeLine.findOne(selector);
    if (deviceTimilineItem) {
        //console.log('updateValueToDeviceTimeline find Success, deviceTimilineItem='+JSON.stringify(deviceTimilineItem));
        var stranger_id = "perMin."+minutes+".$.stranger_id";
        var stranger_name = "perMin."+minutes+".$.stranger_name";
        var modifier = {$set:{}};//{$set:{stranger_id:obj.stranger_id, stranger_name:obj.stranger_name}}
        modifier.$set[stranger_id] = obj.stranger_id;
        modifier.$set[stranger_name] = obj.stranger_name;
        DeviceTimeLine.update(selector, modifier, function(err,res){
          if(err){
            console.log('updateValueToDeviceTimeline update Err:'+err+', obj.img_url='+obj.img_url);
          } else {
            console.log('updateValueToDeviceTimeline update Success, obj.img_url='+obj.img_url);
          }
        });
    } else {
        console.log('updateValueToDeviceTimeline find failed, obj.img_url='+obj.img_url);
    }
  },
  // 标错时， 修正 WorkAIUserRelations或workStatus
  fixRelationOrWorkStatus: function(group_id, img_url,person_id){
    console.log('try to fix Relation Or WorkStatus');
    var updateHandle = function(relation_id,time){
      var relation = WorkAIUserRelations.findOne({_id:relation_id});
      if (relation && time) {
        var isToday = PERSON.checkIsToday(time,group_id);
        if(isToday == true){
          PERSON.updateWorkStatus(person_id);
        }
        else{
          if ((!relation.checkin_time) || (relation.ai_in_time && relation.checkin_time && relation.ai_in_time < checkin_time)) {
            relation.checkin_time = relation.ai_in_time;
            relation.checkin_image = relation.ai_in_image;
            relation.checkin_video = '';
          }
          if ((!relation.checkout_time) || (relation.ai_out_time && relation.checkout_time && relation.ai_out_time > checkout_time)) {
            relation.checkout_time = relation.ai_out_time;
            relation.checkin_image = relation.ai_in_image;
            relation.checkout_video = '';
          }
          PERSON.updateWorkStatusHistory(relation);
        }
      }
    };
    // 匹配到第一次进的图像
    var relation1 = WorkAIUserRelations.findOne({group_id: group_id,ai_in_image: img_url});
    if(relation1){
      var setObj = {};
      if(relation1.ai_lastest_in_time && relation1.ai_lastest_in_image){
        if(relation1.ai_in_time == relation1.ai_lastest_in_time){
          setObj = {
            ai_in_time: null,
            ai_in_image: '',
            ai_lastest_in_time: null,
            ai_lastest_in_image: ''
          }
        } else {
          setObj = {
            ai_in_time: relation1.ai_lastest_in_time,
            ai_in_image: relation1.ai_lastest_in_image
          }
        }
        return WorkAIUserRelations.update({_id: relation1._id},{
          $set:setObj
        },function(error){
          if (!error) {
            updateHandle(relation1._id,relation1.ai_in_time);
          }
        });
      }
    }

    // 匹配到最后一次进的图像
    var relation2 = WorkAIUserRelations.findOne({group_id: group_id,ai_lastest_in_image: img_url});
    if(relation2){
      return WorkAIUserRelations.update({_id: relation2._id},{
        $set: {
          ai_lastest_in_time: relation2.ai_in_time,
          ai_lastest_in_image: relation2.ai_in_image
        }
      },function(error){
        if (!error) {
          updateHandle(relation2._id,relation2.ai_lastest_in_time);
        }
      });
    }

    // 匹配到出的图像
    var relation3 = WorkAIUserRelations.findOne({group_id: group_id, ai_out_image: img_url});
    if(relation3){
      return WorkAIUserRelations.update({_id: relation3._id},{
        $set: {
          ai_out_time: null,
          ai_out_image: ''
        }
      },function(error){
        if (!error) {
          updateHandle(relation3._id,relation3.ai_out_time);
        }
      });
    }

    //匹配历史出现表
    var workStatus1 = WorkStatus.findOne({group_id:group_id,in_image:img_url});
    if (workStatus1) {
      return WorkStatus.update({_id:workStatus1._id},{
                $set:{
                  in_time:0,
                  in_image:'',
                  in_status:'unknown',
                  status:'out'
                }
              });
    }

    var workStatus2 = WorkStatus.findOne({group_id:group_id,out_image:img_url});
    if (workStatus2) {
      return WorkStatus.update({_id:workStatus2._id},{
                $set:{
                  out_time:0,
                  out_image:'',
                  out_status:'unknown'
                }
              });
    }
  }
};

CLUSTER_PERSON = {
    /*_removeFace: function(obj){
        console.log('ClusterPerson: removeFace, try remove faces');
        var person = null;
        var faces = [];
        if(obj.group_id){
          person = ClusterPerson.findOne({group_id: obj.group_id, faceId: obj.faceId});
        }
        if(person){
          faces = person.faces;
          var faceId = person.faceId;
          if(faceId === obj.face_id){
            if(faces.length <= 1){
              return ClusterPerson.remove({_id: person._id});
            }
            ClusterPerson.update({_id: person._id}, {
              $set: {faceId: person.faces[0].id, url: person.faces[0].url},
              $pop: {faces: -1}
            });
          } else {
            faces.splice(_.pluck(faces, 'id').indexOf(obj.face_id), 1);
            ClusterPerson.update({_id: person._id},{$set: {faces: faces}});
          }
        }
    },*/
    removeFace: function(group_id, faceId, url){
        var person = null;
        if(group_id){
            person = ClusterPerson.findOne({group_id: group_id, faceId: faceId});
        }
        if(person){
            if(faceId === person.faceId){
                if(person.faces.length <= 1){
                    return ClusterPerson.remove({_id: person._id});
                }
                ClusterPerson.update({"_id": person._id}, {$pull: {'faces': {"url": url}}})
            } else {
                console.log("ClusterPeople: removeFace failed, url="+url+", faceId="+faceId);
            }
        }
    },
    removeFaceByUrl: function(group_id, url){
        var persons = null;
        if(group_id){
            persons = ClusterPerson.find({group_id: group_id, "faces.url": url}).fetch();
        }
        if(persons){
            console.log("url="+url+", persons="+JSON.stringify(persons));
            for(var i=0; i<persons.length; i++){
                var person = persons[i];
                if(person.faces && person.faces.length <= 1){
                    console.log("url="+url+", person._id = "+person._id);
                    ClusterPerson.remove({_id: person._id});
                } else {
                    console.log("ClusterPerson.update = "+person._id+", url="+url);
                    ClusterPerson.update({"_id": person._id}, {$pull: {'faces': {"url": url}}})
                }
            }
        }
    },
    addFace: function(group_id, uuid, faceId, unique_face_id, url, name, is_video, callback){
        CLUSTER_PERSON.removeFaceByUrl(group_id, url);
        var person = ClusterPerson.findOne({group_id:group_id, faceId: faceId}, {sort: {createAt: 1}});
        var dervice = Devices.findOne({uuid: uuid});
        if (person){
            if (is_video) {
                return person;
            }
            person.url = url;
            person.updateAt = new Date();
            if(_.pluck(person.faces, 'url').indexOf(url) === -1)
                person.faces.push({id: unique_face_id, url: url});
            else {
                //ClusterPerson.faces[_.pluck(person.faces, 'url').indexOf(url)].url = url;
                console.log("addFace: url already in this person, "+url);
                return person;
            }
          console.log("ClusterPerson: addFace person.faces = "+JSON.stringify(person.faces));
          ClusterPerson.update({_id: person._id}, {$set: {updateAt: person.updateAt, faces: person.faces}});
        } else {
            person = {
                _id: new Mongo.ObjectID()._str,
                id: ClusterPerson.find({group_id: group_id, faceId: faceId}).count() + 1,
                group_id:group_id,
                faceId: faceId,
                unique_face_id: unique_face_id,
                url: url,
                name: name,
                faces: [{id: unique_face_id, url: url}],
                deviceId: dervice ? dervice._id : '',
                DeviceName: dervice ? dervice.name : '',
                createAt: new Date(),
                updateAt: new Date()
            };
            if (is_video) {
                delete person.faces;
                delete person.faceId;
            }
            console.log("insert person = "+JSON.stringify(person));
            ClusterPerson.insert(person);
        }
        callback && callback();
        return person;
    },
    updateAutogroupResult: function(group_id, message) {
        if (message == undefined || typeof message != "object") {
            console.log("updateAutogroupResult: invalide auto group result, group_id="+group_id+", message="+JSON.stringify(group_id));
            return ;
        }
        try {
            message = JSON.parse(message);
        } catch (e) {
            console.log("updateAutogroupResult: JSON.parse error.");
        }
        var deviceId = message["devId"];
        var results = message["results"];
        console.log("message = "+message+", typeof message="+(typeof message));
        //console.log("deviceId = "+deviceId+", results="+results)
        if (deviceId == undefined || results == undefined) {
            console.log("updateAutogroupResult: deviceId or results is undefined.");
            return ;
        }
        //for(var i=0;i<results.length;i++) {
        hash_map = {}
        forEachAsynSeries(results, 1, function(item, index, callback){
            Fiber(function(){
                /*PERSON.setName(group_id, items[i].uuid, items[i].id, items[i].url, items[i].name);
                console.log('LABLE_DADASET_Handle 3')
                LABLE_DADASET_Handle.insert({group_id:group_id,uuid:items[i].uuid,id:items[i].id,url:items[i].url,name:items[i].name,sqlid:items[i].sqlid,style:items[i].style,user_id:slef.userId,action:'聊天室标记'});
                */
                console.log("updateAutogroupResult: item = "+JSON.stringify(item));
                if (item.url == undefined || item.url == '') {
                    console.log("updateAutogroupResult: url is null, continue");
                    return callback && callback();
                }
                if (item.frm == '' && item.to == '') {
                    console.log("updateAutogroupResult: frm and to is null string, continue");
                    return callback && callback();
                }
                if (item.to == '') { //delete this url
                    CLUSTER_PERSON.removeFace(group_id, item.frm, item.url);
                } else {
                    if (item.frm != '') {//Move url from one person to another
                        CLUSTER_PERSON.removeFace(group_id, item.frm, item.url);
                    }
                    //new photo, Add  a url to person
                    var faceId = item.to;
                    if (faceId.indexOf("newperson_") == 0) {//New person
                        if (hash_map[item.to] != undefined && hash_map[item.to] != null) {
                            faceId = hash_map[item.to];
                        } else {
                            faceId = new Mongo.ObjectID()._str;
                            hash_map[item.to] = faceId;
                        }
                    }
                    unique_face_id = item.unique_face_id ? item.unique_face_id : ''
                    if (unique_face_id =='') {
                        unique_face_id = new Mongo.ObjectID()._str;
                    }
                    CLUSTER_PERSON.addFace(group_id, null, faceId, unique_face_id, item.url, 'New people', false, null);
                }
                callback && callback();
            }).run();
        }, function(error) {
            console.log('updateAutogroupResult: all done');
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
    var slef = this;
    PERSON.updateLabelTimes(group_id,items);
    for(var i=0;i<items.length;i++) {
      if(items[i].style == "human_shape"){
        PERSON.setName(group_id, items[i].uuid, items[i].id, items[i].url, items[i].name, false, true);
      }else{
        PERSON.setName(group_id, items[i].uuid, items[i].id, items[i].url, items[i].name);
      }
      console.log('LABLE_DADASET_Handle 3')
      LABLE_DADASET_Handle.insert({group_id:group_id,uuid:items[i].uuid,id:items[i].id,url:items[i].url,name:items[i].name,sqlid:items[i].sqlid,style:items[i].style,user_id:slef.userId,action:'聊天室标记'});
    }

    // forEachAsynSeries + Fiber (出现两个 同名 person, 其中一个faceId 为空 & 数据集不全【label_dataset 中标记4张，只记录 1 张的情况】，先用回 for 循环的方式)
    /*forEachAsynSeries(items, 1, function(item, index, callback){
      Fiber(function(){
        PERSON.setName(group_id, item.uuid, item.id, item.url, item.name, function(){
            console.log('LABLE_DADASET_Handle 3')
            LABLE_DADASET_Handle.insert({group_id:group_id,uuid:item.uuid,id:item.id,url:item.url,name:item.name,sqlid:item.sqlid,style:item.style,user_id:slef.userId,action:'聊天室标记'});
            callback();
        });
      }).run();
    }, function(error) {
        console.log('PERSON.setName all done');
    });*/
  },
  'mark-strangers': function(group_id, items){
    // console.log(items[0].url)
    var slef = this;
    PERSON.updateLabelTimes(group_id,items);
    for(var i=0;i<items[0].url.length;i++) {
      PERSON.setName(group_id, items[0].uuid, items[0].id, items[0].url[i], items[0].name);
      console.log('LABLE_DADASET_Handle 3')
      LABLE_DADASET_Handle.insert({group_id:group_id,uuid:items[0].uuid,id:items[0].id,url:items[0].url[i],name:items[0].name,sqlid:items[0].sqlid,style:items[0].style,user_id:Meteor.userId(),action:'聊天室标记'});
    }
  },
  'remove-person': function(group_id,uuid,id){
    return PERSON.removeName(group_id,uuid, id);
  },
  'remove-persons': function(items){
    for(var i=0;i<items.length;i++)
      PERSON.removeName(null,items[i].uuid, items[i].id);
  },
  'remove-persons1': function(group_id, items){
    var slef = this;
    for(var i=0;i<items.length;i++){
      PERSON.removeName(group_id, items[i].uuid, items[i].id,items[i].img_url);
      LABLE_DADASET_Handle.remove({group_id:group_id,id:items[i].id,url:items[i].img_url,user_id:slef.userId,action:'聊天室标错或者删除'});
    }
  },
  'remove-person-face': function(lists){
    for(var i=0; i< lists.length;i++){
      //PERSON.removeFace(lists[i]);
      var data = {
        group_id:lists[i].group_id,
        id:lists[i].face_id,
        url:lists[i].face_url,
        name:lists[i].name
      };
      LABLE_DADASET_Handle.remove(data);
    }
  },
  'removePersonById': function(_id){
    var person = Person.findOne({_id: _id});
    var faces = [];
    if(person){

      // faces = person.faces;
      // for(var i=0; i< faces.length;i++){
      //   var data = {
      //     group_id:person.group_id,
      //     id:faces[i].face_id,
      //     url:faces[i].face_url,
      //   };
      //   LABLE_DADASET_Handle.remove(data);
      // }

      LableDadaSet.remove({group_id: person.group_id, name: person.name});

      PersonNames.remove({group_id:person.group_id, name:person.name});
      WorkAIUserRelations.remove({'ai_persons.id': person._id});
      WorkStatus.remove({'person_id.id': person._id});
    }
    return Person.remove({_id: _id});
  },
  // remove Person
  'renamePerson': function(_id, name) {
    var person = Person.findOne({_id: _id});
    console.log('==sr==. person is '+JSON.stringify(person))

    if(person && person.name) {
      // update person
      Person.update({_id: _id},{$set:{name: name}});

      if(person.name) {
        // update personNames
        PersonNames.update({group_id:person.group_id, name:person.name},{$set:{name: name}}, function(err,res){
          console.log('==sr==. err is '+ err);
          console.log('==sr==. res is ' + res)
        });
        // update lableDadaSet
        LableDadaSet.update({group_id:person.group_id, name:person.name},{$set:{name: name}},{multi: true});
      }

      // update relations
      WorkAIUserRelations.update({'ai_persons.id': _id},{$set:{person_name: name}});
      // update workStatus1
      WorkStatus.update({'person_id.id': _id},{$set:{person_name: name}},{multi: true});
    }
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
  'upLabels': function(groupId, data, waitLabels, type){
    this.unblock();
    var slef = this;

    waitLabels.map(function(wait){
      var trainsetObj = {
          group_id: groupId,
          type: 'trainset',
          url: wait.url,
          img_type: wait.img_type,
          style: wait.style,
          sqlid: wait.sqlid
        };
      if (type === 'delete') {
        trainsetObj.drop = true;
        trainsetObj.rm_reson = data ;
        sendMqttMessage('/device/' + groupId, trainsetObj);
        console.log('send mqtt to device:', trainsetObj);
        PERSON.removeName(groupId, wait.uuid, wait.id,wait.url);
        LABLE_DADASET_Handle.remove({group_id:groupId,id:wait.id,url:wait.url,user_id:slef.userId,action:'群相册--未标注里点删除'});
        return;
      }
      var name = PERSON.getIdByName(wait.uuid, data, groupId);
      var label = wait.label; //平板识别出的名字
      if (label && label != name) { //用户标记的名字和平板识别的名字不一样
        wait.id = new Mongo.ObjectID()._str;
      }
      trainsetObj.person_id = name && name.id ? name.id : '';
      trainsetObj.device_id = wait.uuid;
      trainsetObj.face_id = name && name.faceId ? name.faceId : wait.id;
      trainsetObj.drop = false;
      sendMqttMessage('/device/' + groupId, trainsetObj);
      console.log('send mqtt to device:', trainsetObj);
      PERSON.setName(groupId, wait.uuid, wait.id, wait.url, data);
      console.log('LABLE_DADASET_Handle 4')
      LABLE_DADASET_Handle.insert({group_id:groupId,id:wait.id,url:wait.url,uuid:wait.uuid,name:data,sqlid:wait.sqlid,style:wait.style,user_id:slef.userId,action:'群相册--未标注里点标记'});
    });
    return true;
  },
  update_WorkAI_PushNotifacaton_Status:function(userId,status){
    console.log('try to update WorkAI PushNotifacaton Status');
    if (!userId || !status) {
      return;
    }
    var relation = WorkAIUserRelations.findOne({app_user_id:userId});
    if (relation) {
      WorkAIUserRelations.update({_id:relation._id},{$set:{app_notifaction_status:status}});
      WorkStatus.update({app_user_id:userId},{$set:{app_notifaction_status:status}},{multi: true});
    }
  },
  'update_workai_hide_it': function(group_id, person_name, hide_it){
    if(!group_id || !person_name || hide_it == undefined){
      return;
    }
    var selector = {
      group_id: group_id,
      person_name: person_name
    }
    WorkStatus.update(selector,{$set:{hide_it: hide_it}},{multi: true});
  },
  'update_group_settings': function(group_id, settings){
    console.log("group_id="+group_id+", settings="+JSON.stringify(settings))
    if(!group_id || !settings){
      console.log("update_group_settings: group_id or settings is null.");
      return;
    }
    SimpleChat.Groups.update({_id: group_id},{$set:settings}, function(err, result) {
        if (err) {
            console.log("update_group_settings: update settings failed.");
        }
    });
  },
  'update_groupuser_settings': function (group_id, user_id, settings) {
    console.log("group_id=" + group_id + ", user_id=" + user_id + ", settings=" + JSON.stringify(settings))
    if (!group_id || !settings || !user_id) {
      console.log("update_groupuser_settings: group_id or settings or user_id is null.");
      return;
    }
    SimpleChat.GroupUsers.update({ group_id: group_id, user_id: user_id }, { $set: settings }, function (err, result) {
      if (err) {
        console.log("update_groupuser_settings: update settings failed.");
      }
    });
  },
  'update_groupuser_settings_arr': function (group_id, user_id, workai_id, ishide) {
    if (!group_id || !user_id || !workai_id) {
      return;
    }
    //add
    if (ishide) {
      SimpleChat.GroupUsers.update({ group_id: group_id, user_id: user_id }, { $addToSet: { 'settings.not_notify_acquaintance': workai_id } })
    } else {
      SimpleChat.GroupUsers.update({ group_id: group_id, user_id: user_id }, { $pull: { 'settings.not_notify_acquaintance': workai_id } })
    }
  },
  'initLableDataSet':function(){
    LABLE_DADASET_Handle.initLableDataSet();
  },
  'updatePersonImgCount': function() {
    // 仅在本地开发环境下使用
    LABLE_DADASET_Handle.updatePersonImgCount();
  },
  'initUserWorkStatusToday': function(relation_id) {
    var relation = WorkAIUserRelations.findOne({_id:relation_id});
    var workstatus = null;

    var time_offset = 8; //US is -7, China is +8

    var group = SimpleChat.Groups.findOne({_id: relation.group_id});
    if (group && group.offsetTimeZone) {
      time_offset = group.offsetTimeZone;
    }

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
        "status"      : 'out',
      });
    }
  },
  'resetMemberWorkStatus': function(_id,person_id) {
    // Step 1. reset workStatus
    WorkStatus.update({_id: _id},{
      $set:{
        status: 'out',
        in_status: 'unknown',
        out_status: 'unknown',
        in_time: null,
        out_time: null,
        in_image: '',
        out_image: ''
      }
    });
    // Step 2. reset workai user relation
    WorkAIUserRelations.update({'ai_persons.id': person_id},{
      $set:{
        in_uuid:"",
        out_uuid:"",
        ai_lastest_in_time: null,
        ai_lastest_in_image: "",
        ai_in_time: null,
        ai_out_time: null,
        checkin_time: null,
        checkout_time: null,
        ai_in_image: "",
        ai_out_image: "",
        checkin_image: "",
        checkout_image: "",
        checkin_video: "",
        checkout_video: "",
      }
    });
    return true;
  },
  //修改签到人
  'update-workstatus':function(id,name,url,group_id){
    var personName = PersonNames.findOne({group_id: group_id, name: name});
    //1.find person
    var person = Person.findOne({name:name});
    var face_id;
    if(person){
      face_id = person.faceId;
    }else{
      face_id = new Mongo.ObjectID()._str;
    }
    if (!personName)
      PersonNames.insert({group_id: group_id, url: url, id: face_id, name: name, createAt: new Date(), updateAt: new Date()});
    if(person){
      WorkStatus.update({_id:id},{$set:{person_name:name,'person_id':[{id:person._id}]}});
    }else{
      person = {
        _id: new Mongo.ObjectID()._str,
        id: Person.find({group_id: group_id, faceId: face_id}).count() + 1,
        group_id:group_id,
        faceId: face_id,
        url: url,
        name: name,
        faces: [{id: face_id, url: url}],
        // deviceId: dervice._id,
        // DeviceName: dervice.name,
        label_times: 1,
        createAt: new Date(),
        updateAt: new Date()
      };
      console.log("insert person = "+JSON.stringify(person));
      Person.insert(person);
      WorkStatus.update({_id:id},{$set:{person_name:name}});
    }
  },
  //加入训练集
  'add-label-dataset': function(group_id, items){
    PERSON.updateLabelTimes(group_id,items);
    var name = items[0].name;
    var url = items[0].url;
    var id = items[0].id;

    var person = Person.findOne({group_id:group_id, name: name}, {sort: {createAt: 1}});
    var personName = PersonNames.findOne({group_id: group_id, name: name});

    if (!personName)
      PersonNames.insert({group_id: group_id, url: url, id: id, name: name, createAt: new Date(), updateAt: new Date()});
    // else
    //   PersonNames.update({_id: name._id}, {$set: {name: name, url: url, id: id, updateAt: new Date()}})

    if (person){
      person.url = url;
      person.updateAt = new Date();
      if(_.pluck(person.faces, 'id').indexOf(id) === -1)
        person.faces.push({id: id, url: url});
      else
        person.faces[_.pluck(person.faces, 'id').indexOf(id)].url = url;
      // Person.update({_id: person._id}, {$set: {name: name, url: person.url, updateAt: person.updateAt, faces: person.faces}});
      console.log("update person.faces = "+JSON.stringify(person.faces));
      Person.update({_id: person._id}, {$set: {updateAt: person.updateAt, faces: person.faces}});
    }
      LABLE_DADASET_Handle.insert({group_id:group_id,uuid:items[0].uuid,id:id,url:url,name:name,sqlid:items[0].sqlid,style:items[0].style,user_id:slef.userId,action:'签到标记'});
    },
    //获取随机名 guestN
    'get-guest-name':function(group_id){
      var c;
      var pname = PersonNames.findOne({ group_id: group_id, name: /^guest\d+/ }, { sort: { createAt: -1 } });
      if (!pname) {
        c = 1;
      } else {
        c = Number(pname.name.substr(5)) + 1;
      }
      return 'guest'+c;
    }

  // 'cleanLeftRelationAndStatusDate': function(){
  //   // 清理，移除person后遗留的相关数据（仅在本地开发环境下使用）
  //   cleanLeftRelationAndStatusDate();
  // }
})
