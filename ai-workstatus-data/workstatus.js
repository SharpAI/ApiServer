var db = connect('aidb.tiegushi.com:27017/workai');
db.auth('workAIAdmin','weo23biHUI');

fillWorkStatus = function(group_id, dayLen, time_offset){
  print('START fillWorkStatus');
  var group = db.simple_chat_groups.findOne({_id: group_id});
  var group_intime = group.group_intime || "09:00";
  var group_outtime = group.group_outtime || "18:00";
  var group_intime_H = parseInt(group_intime.split(":")[0]);
  var group_intime_M = parseInt(group_intime.split(":")[1]);
  var group_outtime_H = parseInt(group_outtime.split(":")[0]);
  var group_outtime_M = parseInt(group_outtime.split(":")[1]);

  time_offset = group.offsetTimeZone || time_offset || 8;

  for(var i=dayLen; i >0 ; i--){
    var ts = new Date();
    ts.setUTCDate(ts.getUTCDate() - i);
    ts.setUTCHours(0,0,0,0);
    print(ts)
    var ts2 = new Date(ts);
    ts2.setUTCHours((0-time_offset),0,0,0);
    var dayInweek = ts2.getDay();
    // if(time_offset = -7){
    //   dayInweek -= 1;
    // }
    var date = ts.getTime();
    db.workaiUserRelations.find({group_id: group_id}).forEach(function(item){
      var in_time = 0;
      var out_time = 0;
      print('START update: date='+date+' ,group_id='+group_id+' ,person_name='+item.person_name)
      var status = db.workStatus.findOne({
        date: date,
        group_id: item.group_id,
        person_name: item.person_name
      });

      var person = db.personNames.findOne({name: item.person_name});

      var in_image = item.ai_in_image || item.checkin_image || item.ai_lastest_in_image;
      var out_image = item.ai_out_image || item.checkout_image;
      if(status && status.in_image){
        in_image = status.in_image;
      }

      if(status && status.out_image){
        out_image = status.out_image;
      }
      if(!in_image && person){
        in_image = person.url;
      }
      if(!out_image && person){
        out_image = person.url;
      }
      var max1 = 30 * 60 * 1000;
      var max2 = 90 * 60 * 1000;
      var min1 = 10 * 60 * 1000;
      var min2 = 30 * 60 * 1000;
      var in_minutes = group_intime_M;
      var out_minutes = group_outtime_M;
      in_time = Date.UTC(ts.getUTCFullYear(),ts.getUTCMonth(),ts.getUTCDate(),group_intime_H,in_minutes);
      out_time = Date.UTC(ts.getUTCFullYear(),ts.getUTCMonth(),ts.getUTCDate(),group_outtime_H,out_minutes);

      in_time -= time_offset * 60 * 60 * 1000 + parseInt(Math.random()*(max1-min1+1)+min1,10) * (Math.random()>0.5?1:-1);
      out_time -= time_offset * 60 * 60 * 1000 + parseInt(Math.random()*(max2-min2+1)+min2,10) * (Math.random()>0.5?1:-1);
      var in_out_status = 'normal';
      if(dayInweek == 0 || dayInweek == 6){
        in_time = 0;
        out_time = 0;
        in_out_status = 'unknown';
      }
      db.workStatus.update({
        date: date,
        group_id: item.group_id,
        person_name: item.person_name
      },{
        $set:{
          in_status: in_out_status,
          out_status:in_out_status,
          status: 'out',
          in_time: in_time,
          out_time: out_time,
          in_image: in_image,
          out_image: out_image
        }
      },function(error, result){
        if(error){
          print('update Filed: date='+date+' ,group_id='+group_id+' ,person_name='+item.person_name);
        } else {
          print('END update: date='+date+' ,group_id='+group_id+' ,person_name='+item.person_name);
        }
      });
    });
  }

  print('END fillWorkStatus');
}

// 上海办公室
fillWorkStatus('ae64c98bdff9b674fb5dad4b',33,8);

// SWLAB
// fillWorkStatus('73c125cc48a83a95882fced3',14,-7);