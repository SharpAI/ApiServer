GetTime0 = function(dateM){
    var MinMilli = 1000 * 60;         // 初始化变量。
    var HrMilli = MinMilli * 60;
    var DyMilli = HrMilli * 24;
    //计算出相差天数
    var days=Math.floor(dateM/(DyMilli));

    //计算出小时数
    var leave1=dateM%(DyMilli); //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(HrMilli));
    //计算相差分钟数
    var leave2=leave1%(HrMilli);        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(MinMilli));
    //计算相差秒数
    var leave3=leave2%(MinMilli);      //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3/1000);
    
    var prefix;
    if(Session.equals('display-lang','en')){
      if(dateM > DyMilli)
          prefix = days+" Days";
      else if (dateM > HrMilli)
          prefix = hours+" Hours";
      else if (dateM > MinMilli)                         
          prefix = minutes+" Minutes";
      else if (dateM <= MinMilli){
          if (seconds <= 0)
              prefix = " Now";
          else
              prefix = seconds+" Seconds";
      } else
          prefix = "";
      return prefix
    } else {
      if(dateM > DyMilli)
          prefix = days+"天 前";
      else if (dateM > HrMilli)
          prefix = hours+"小时 前";
      else if (dateM > MinMilli)                         
          prefix = minutes+"分钟 前";
      else if (dateM <= MinMilli){
          if (seconds <= 0)
              prefix = "刚刚";
          else
              prefix = seconds+"秒 前";
      } else
          prefix = "";
      return prefix
    }
};

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