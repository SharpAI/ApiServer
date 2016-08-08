PUB = {
  formatTime: function(time, str) {
    var date = new Date(time);
    var Y,M,D,h,m,s,result;
    var addZero = function(val) {
      val = val.toString();
      if(val.length < 2){
        return '0'+val;
      } else {
        return val;
      }
    };
    Y = date.getFullYear();
    M = addZero(date.getMonth() + 1);
    D = addZero(date.getDate());
    h = addZero(date.getHours());
    m = addZero(date.getMinutes());
    s = addZero(date.getSeconds());

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

    return result;
  }
}

// js 原生a扩展
String.prototype.replaceAll = function(s1,s2) {
  return this.replace(new RegExp(s1,"gm"),s2);
}