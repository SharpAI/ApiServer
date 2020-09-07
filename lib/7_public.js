PUB = {
  formatTime: function(time, str) {
    var UTC = 8; // 启用北京时间
    var date = new Date(time);
    if(UTC){
      date.setUTCHours(date.getUTCHours()+UTC);
    }
    var Y,M,D,h,m,s,result;
    var addZero = function(val) {
      val = val.toString();
      if(val.length < 2){
        return '0'+val;
      } else {
        return val;
      }
    };
    Y = date.getUTCFullYear();
    M = addZero(date.getUTCMonth() + 1);
    D = addZero(date.getUTCDate());
    h = addZero(date.getUTCHours());
    m = addZero(date.getUTCMinutes());
    s = addZero(date.getUTCSeconds());

    switch (str) {
      case 'yyyy-mm-dd H:m:s':
        result = Y+'-'+M+'-'+D+' '+h+':'+m+':'+s;
        break;
      case 'yyyy-mm-dd':
        result = Y+'-'+M+'-'+D;
        break;
      default:
        result = Y+'-'+M+'-'+D+' '+h+':'+m+':'+s;
    }
    if(UTC){
      result += '(UTC'+UTC+')';
    }
    return result;
  }
}

// js 原生a扩展
String.prototype.replaceAll = function(s1,s2) {
  return this.replace(new RegExp(s1,"gm"),s2);
}