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
}