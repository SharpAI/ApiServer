var checkIsToday = function (checktime, group_id) {
  var isToday = true;
  var time_offset = 8; //US is -7, China is +8
  var group = SimpleChat.Groups.findOne({
    _id: group_id
  });
  if (group && group.offsetTimeZone) {
    time_offset = group.offsetTimeZone;
  }

  function DateTimezone(date, offset) {
    //var d = new Date();
    var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    var local_now = new Date(utc + (3600000 * offset));
    var today_now = new Date(local_now.getFullYear(), local_now.getMonth(), local_now.getDate(),
      local_now.getHours(), local_now.getMinutes());
    return today_now;
  }
  var now = DateTimezone(new Date(), time_offset);
  checktime = DateTimezone(new Date(checktime), time_offset);

  var DayDiff = now.getDate() - checktime.getDate();

  if (DayDiff != 0) {
    console.log('ai_checkin_out: not today out/in ');
    isToday = false;
  }
  return isToday;
};

activity_update_time = function (person_id, create_time, image_url) {
  console.log("activity_update_time", person_id, create_time.getTime(), image_url);

  var act_time = create_time.getTime();
  var ai_in_time, ai_lastest_in_time, ai_out_time, checkin_time, checkout_time;
  var first_in = false;
  var in_image_url, lastin_image_url, out_image_url;

  var relation = WorkAIUserRelations.findOne({
    'ai_persons.id': person_id
  });

  if (relation == null) {
    return;
  }

  console.log("relation", relation);

  relation.ai_in_time = (!relation.ai_in_time) ? 0 : (!checkIsToday(relation.ai_in_time, relation.group_id)) ? 0 : relation.ai_in_time;
  relation.ai_out_time = (!relation.ai_out_time) ? 0 : (!checkIsToday(relation.ai_out_time, relation.group_id)) ? 0 : relation.ai_out_time;
  relation.ai_lastest_in_time = (!relation.ai_lastest_in_time) ? 0 : (!checkIsToday(relation.ai_lastest_in_time, relation.group_id)) ? 0 : relation.ai_lastest_in_time;

  console.log("relation2", relation);
  if (relation.ai_in_time == 0) {
    first_in = true;
  }

  if (!relation.ai_in_time ||
    relation.ai_in_time > act_time) {
    ai_in_time = act_time;
    in_image_url = image_url;
  } else {
    ai_in_time = relation.ai_in_time;
    in_image_url = relation.ai_in_image;
  }
  /*
  if (relation.checkin_time > act_time){
    checkin_time = act_time
  }else {
    checkin_time = relation.checkin_time
  }
        */

  if (!relation.ai_lastest_in_time ||
    relation.ai_lastest_in_time < act_time) {
    ai_lastest_in_time = act_time;
    lastin_image_url = image_url;
  } else {
    ai_lastest_in_time = relation.ai_lastest_in_time;
    lastin_image_url = relation.ai_lastest_in_image;
  }

  if (first_in) {
    ai_out_time = relation.ai_out_time;
    out_image_url = image_url;
  } else {
    if (!relation.ai_out_time ||
      relation.ai_out_time < act_time) {
      ai_out_time = act_time;
      out_image_url = image_url;
    } else {
      ai_out_time = relation.ai_out_time;
      out_image_url = relation.ai_out_image;
    }
  }

  /*
    if (relation.checkout_time){
        if (relation.checkout_time > act_time){
            checkout_time = relation.checkout_time 
        }else {
            checkout_time = act_time
        }
    }
        */

  var setObj = {
    ai_in_time: ai_in_time,
    ai_in_image: in_image_url,

    ai_lastest_in_time: ai_lastest_in_time,
    ai_lastest_in_image: lastin_image_url,

    ai_out_time: ai_out_time,
    ai_out_image: out_image_url
  };

  console.log("setObj", setObj);
  WorkAIUserRelations.update({
    _id: relation._id
  }, {
    $set: setObj
  });

  var time_offset = 8; //US is -7, China is +8
  var group = SimpleChat.Groups.findOne({
    _id: relation.group_id
  });
  if (group && group.offsetTimeZone) {
    time_offset = group.offsetTimeZone;
  }
  console.log("time_offset", time_offset);

  function DateTimezone(offset) {
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var local_now = new Date(utc + (3600000 * offset));

    return local_now;
  }

  var now = DateTimezone(time_offset);
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var day_utc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),
    0, 0, 0, 0);

  console.log('day_utc:' + day_utc);

  var workstatus = null;
  if (relation.app_user_id) {
    workstatus = WorkStatus.findOne({
      'group_id': relation.group_id,
      'app_user_id': relation.app_user_id,
      'date': day_utc
    });
  }
  if (!workstatus && relation.person_name) {
    workstatus = WorkStatus.findOne({
      'group_id': relation.group_id,
      'person_name': relation.person_name,
      'date': day_utc
    });
  }

  if (!image_url) {
    PUB.toast("头像不能为空");
    return;
  }
  console.log("workstatus", workstatus);
  if (!workstatus) {
    var intime = act_time;
    var in_image = image_url;
    var in_video = '';
    var outtime = 0;
    var out_image = image_url;
    var out_video = '';
    var now_status = 'in';
    var in_status = 'normal';
    var out_status = 'unknown';

    console.log("workstatus insert");

    WorkStatus.insert({
      "app_user_id": relation.app_user_id,
      "app_notifaction_status": relation.app_notifaction_status,
      "group_id": relation.group_id,
      "date": day_utc,
      "person_id": relation.ai_persons,
      "person_name": relation.person_name,
      "status": now_status,
      "in_status": in_status,
      "out_status": out_status,
      "in_uuid": relation.in_uuid,
      "out_uuid": relation.out_uuid,
      "whats_up": "",
      "in_time": intime,
      "in_image": in_image,
      "in_video": in_video,
      "out_image": out_image,
      "out_time": outtime,
      "out_video": out_video,
      "hide_it": relation.hide_it ? relation.hide_it : false
    });
  } else {
    if (!workstatus.in_time || workstatus.in_time > act_time) {
      intime = act_time;
      in_image = image_url;
    } else {
      intime = workstatus.in_time;
      in_image = workstatus.in_image;
    }

    if (!workstatus.out_time ||
      workstatus.out_time < act_time) {
      outtime = act_time;
      out_image = image_url;
    } else {
      outtime = workstatus.out_time;
      out_image = workstatus.out_image;
    }

    if (first_in || intime == outtime) {
      now_status = 'in';
    } else {
      now_status = 'out';
    }

    setObj = {
      status: now_status,
      in_time: intime,
      in_image: in_image,
      out_time: outtime,
      out_image: out_image,
    };

    console.log("setObj", setObj);
    WorkStatus.update({
      _id: workstatus._id
    }, {
      $set: setObj
    });
  }
};