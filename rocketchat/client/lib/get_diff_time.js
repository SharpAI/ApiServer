GetTime0 = function(dateM){
  var time = (new Date()).getTime() - dateM.getTime();
  var second = time/1000;
  var minute = second/60;
  var hour = minute/60;
  var day = hour/24;
  var month = day/30;
  
  if(second <= 0)
    return '刚刚';
  if(second < 60)
    return parseInt(second) + '秒前';
  if(minute < 60)
    return parseInt(minute) + '分钟前'
  if(hour < 24)
    return parseInt(hour) + '小时前';
  if(day < 30)
    return parseInt(day) + '天前';
  if(month < 12)
    return parseInt(month) + '个月前';

  return '1年以前';
}