moment.defineLocale('zh-cn', {  
    months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),  
    monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),  
    weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),  
    weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),  
    weekdaysMin : '日_一_二_三_四_五_六'.split('_'),  
    longDateFormat : {  
        LT : 'Ah点mm分',  
        LTS : 'Ah点m分s秒',  
        L : 'YYYY-MM-DD',  
        LL : 'YYYY年MMMD日',  
        LLL : 'YYYY年MMMD日Ah点mm分',  
        LLLL : 'YYYY年MMMD日ddddAh点mm分',  
        l : 'YYYY-MM-DD',  
        ll : 'YYYY年MMMD日',  
        lll : 'YYYY年MMMD日Ah点mm分',  
        llll : 'YYYY年MMMD日ddddAh点mm分'  
    },  
    meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,  
    meridiemHour: function (hour, meridiem) {  
        if (hour === 12) {  
            hour = 0;  
        }  
        if (meridiem === '凌晨' || meridiem === '早上' ||  
                meridiem === '上午') {  
            return hour;  
        } else if (meridiem === '下午' || meridiem === '晚上') {  
            return hour + 12;  
        } else {  
            // '中午'  
            return hour >= 11 ? hour : hour + 12;  
        }  
    },  
    meridiem : function (hour, minute, isLower) {  
        var hm = hour * 100 + minute;  
        if (hm < 600) {  
            return '凌晨';  
        } else if (hm < 900) {  
            return '早上';  
        } else if (hm < 1130) {  
            return '上午';  
        } else if (hm < 1230) {  
            return '中午';  
        } else if (hm < 1800) {  
            return '下午';  
        } else {  
            return '晚上';  
        }  
    },  
    calendar : {  
        sameDay : function () {  
            return this.minutes() === 0 ? '[今天]Ah[点整]' : '[今天]LT';  
        },  
        nextDay : function () {  
            return this.minutes() === 0 ? '[明天]Ah[点整]' : '[明天]LT';  
        },  
        lastDay : function () {  
            return this.minutes() === 0 ? '[昨天]Ah[点整]' : '[昨天]LT';  
        },  
        nextWeek : function () {  
            var startOfWeek, prefix;  
            startOfWeek = moment().startOf('week');  
            prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]';  
            return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';  
        },  
        lastWeek : function () {  
            var startOfWeek, prefix;  
            startOfWeek = moment().startOf('week');  
            prefix = this.unix() < startOfWeek.unix()  ? '[上]' : '[本]';  
            return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';  
        },  
        sameElse : 'LL'  
    },  
    ordinalParse: /\d{1,2}(日|月|周)/,  
    ordinal : function (number, period) {  
        switch (period) {  
        case 'd':  
        case 'D':  
        case 'DDD':  
            return number + '日';  
        case 'M':  
            return number + '月';  
        case 'w':  
        case 'W':  
            return number + '周';  
        default:  
            return number;  
        }  
    },  
    relativeTime : {  
        future : '%s内',  
        past : '%s前',  
        s : '几秒',  
        m : '1 分钟',  
        mm : '%d 分钟',  
        h : '1 小时',  
        hh : '%d 小时',  
        d : '1 天',  
        dd : '%d 天',  
        M : '1 个月',  
        MM : '%d 个月',  
        y : '1 年',  
        yy : '%d 年'  
    },  
    week : {  
        // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效  
        dow : 1, // Monday is the first day of the week.  
        doy : 4  // The week that contains Jan 4th is the first week of the year.  
    }  
});  
get_diff_time = function(dateTimeStamp){
var minute = 1000 * 60;
var hour = minute * 60;
var day = hour * 24;
var halfamonth = day * 15;
var month = day * 30;
var now = new Date().getTime();
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

get_diff_time2 = function(curTime,lastTime){
lastTime = lastTime || 0;
var minute = 1000 * 60;
var hour = minute * 60;
var day = hour * 24;
var halfamonth = day * 15;
var month = day * 30;
var diffValue = curTime - lastTime;
var result = {
    isShow: false
}
if(diffValue < 0){return;}
if(diffValue > 5*minute){
    result.isShow = true;
    result.time = getTimeStr(curTime);
    result.lastTime = curTime;
}
return result;
};
function getTimeStr(dateTimeStamp){
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - dateTimeStamp;
    if(isToday(dateTimeStamp)){
        return moment(dateTimeStamp).format("ahh:mm");
    }else if(isYesterday(dateTimeStamp)){
        return '昨天 '+moment(dateTimeStamp).format("ahh:mm");
    }else if(isWithinAweek(dateTimeStamp)){
        return moment(dateTimeStamp).format('ddd ahh:mm');
    }else if(isCurYear(dateTimeStamp)){
        return moment(dateTimeStamp).format('MMMD日 ahh:mm');
    }else {
        return moment(dateTimeStamp).format('ll ahh:mm');
    }
    
}
function isToday(dateTimeStamp){
    var today = moment();
    if(moment(dateTimeStamp).isSame(today,'day')){
        return true;
    }
    return false;
}
function isYesterday(dateTimeStamp){
    var yesterday = moment().subtract(1, 'day');
    if(moment(dateTimeStamp).isSame(yesterday,'day')){
        return true;
    }
    return false;
}
function isWithinAweek(dateTimeStamp){
    var A_WEEK_OLD = moment().subtract(7, 'days').startOf('day');
    if(moment(dateTimeStamp).isAfter(A_WEEK_OLD,'day')){
        return true;
    }
    return false;
}
function isCurYear(dateTimeStamp){
    if(moment(dateTimeStamp).isSame(moment(),'year')){
        return true;
    }
    return false;
}