
if Meteor.isServer
  Meteor.startup ()->
    postFontStyleDefault='font-size:large;';
    postFontStyleNormal='font-size:large;';
    postFontStyleQuota='font-size:15px;background:#F5F5F5;padding-left:3%;padding-right:3%;color:grey;';

    calcTextItemStyle = (layoutObj)->
      fontStyle = postFontStyleDefault
      alignStyle = 'text-align:left;'
      if layoutObj
        if layoutObj.font
          if layoutObj.font is 'normal'
            fontStyle=postFontStyleNormal
          else if layoutObj.font is 'quota'
            fontStyle=postFontStyleQuota
        if layoutObj.align
          if layoutObj.align is 'right'
            alignStyle = "text-align:right;"
          else if layoutObj.align is 'center'
            alignStyle = "text-align:center;"
        if layoutObj.weight
          alignStyle = "font-weight:"+layoutObj.weight+";"
      fontStyle+alignStyle
    storeStyleInItem = (node,type,value)->
      $(node).attr('hotshare-'+type,value)
    getStyleInItem = (node,type,value)->
      $(node).attr('hotshare-'+type)


    GetTime0 = (dateM)->
      MinMilli = 1000 * 60;         #初始化变量。
      HrMilli = MinMilli * 60;
      DyMilli = HrMilli * 24;
      #计算出相差天数
      days=Math.floor(dateM/(DyMilli));

      #计算出小时数
      leave1=dateM%(DyMilli); #计算天数后剩余的毫秒数
      hours=Math.floor(leave1/(HrMilli));
      #计算相差分钟数
      leave2=leave1%(HrMilli);        #计算小时数后剩余的毫秒数
      minutes=Math.floor(leave2/(MinMilli));
      #计算相差秒数
      leave3=leave2%(MinMilli);      #计算分钟数后剩余的毫秒数
      seconds=Math.round(leave3/1000);

      prefix = ""
      if dateM > DyMilli
        prefix = days+"天 前"
      else if dateM > HrMilli
        prefix = hours+"小时 前"
      else if dateM > MinMilli
        prefix = minutes+"分钟 前"
      else if dateM <= MinMilli
        if seconds <= 0
          prefix = "刚刚"
        else
          prefix = seconds+"秒 前"

      return prefix
    String::SymbolEscape = ->
      strArr = this.split('')
      htmlChar = '&<>'
      i = 0
      while i < strArr.length
        if htmlChar.indexOf(this.charAt(i)) != -1
          switch this.charAt(i)
            when '<'
              strArr.splice i, 1, '&#60;'
            when '>'
              strArr.splice i, 1, '&#62;'
            when '&'
              strArr.splice i, 1, '&#38;'
        i++
      strArr.join ''
