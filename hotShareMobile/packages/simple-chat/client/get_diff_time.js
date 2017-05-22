get_diff_time = function(dateTimeStamp){
var minute = 1000 * 60;
var hour = minute * 60;
var day = hour * 24;
var halfamonth = day * 15;
var month = day * 30;
var now = Meteor.getServerNow().getTime();
var diffValue = now - dateTimeStamp;
if(diffValue < 0){return;}
var monthC =diffValue/month;
var weekC =diffValue/(7*day);
var dayC =diffValue/day;
var hourC =diffValue/hour;
var minC =diffValue/minute;
if(monthC>=1){
    if(parseInt(monthC) >= 12)
        result="1 年前";
    else
        result="" + parseInt(monthC) + " 月前";
}
else if(weekC>=1){
    result="" + parseInt(weekC) + " 周前";
}
else if(dayC>=1){
    result=""+ parseInt(dayC) +" 天前";
}
else if(hourC>=1){
    result=""+ parseInt(hourC) +" 小时前";
}
else if(minC>=1){
    result=""+ parseInt(minC) +" 分钟前";
}else
result="刚刚";
return result;
};

format_date = function(val, format){
  var now = null;
  try{now = new Date(val);}catch(ex){return val;}
  var o = {
      "M+": now.getMonth() + 1,  //month
      "d+": now.getDate(),     //day
      "h+": now.getHours(),    //hour
      "m+": now.getMinutes(),  //minute
      "s+": now.getSeconds(), //second
      "q+": Math.floor((now.getMonth() + 3) / 3),  //quarter
      "S": now.getMilliseconds() //millisecond
  };

  if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (now.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
          format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
  }
  return format;
};