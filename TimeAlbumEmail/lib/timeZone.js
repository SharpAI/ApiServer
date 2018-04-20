LocalDateTimezone = function (d, time_offset) {
      if (time_offset == undefined){
          if (d.getTimezoneOffset() == 420){
              time_offset = -7
          }else {
              time_offset = 8
          }
      }
      // 取得 UTC time
      var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      var local_now = new Date(utc + (3600000*time_offset))
      var today_now = new Date(local_now.getFullYear(), local_now.getMonth(), local_now.getDate(), 
      local_now.getHours(), local_now.getMinutes(), local_now.getSeconds());
      
      return today_now;
}

LocalZeroTimezoneTimestamp = function (d, time_offset) {
      if (time_offset == undefined){
        if (d.getTimezoneOffset() == 420){
            time_offset = -7
        }else {
            time_offset = 8
        }
      }
      // 取得 UTC time
      var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      var local_now = new Date(utc + (3600000*time_offset))
      
      var today_zero = new Date(Date.UTC(local_now.getFullYear(), local_now.getMonth(), local_now.getDate()));
            
      return today_zero.getTime();
}