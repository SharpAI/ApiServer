if (!Date.prototype.format){
  Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,  //month
        "d+": this.getDate(),     //day
        "h+": this.getHours(),    //hour
        "m+": this.getMinutes(),  //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
  };
}

Date.prototype.parseDate = function (pattern) {
    /**
     * 分隔符只能是 - / 单个空格 : .
     * 年 YYYY || YY
     * 月 MM || M
     * 日 DD || DD
     * 时 hh || h
     * 分 mm || m
     * 秒 ss || s
     * 毫秒 ms || msss
     *
     * example:
     *  d = new Date()
     *  d.parseDate('YYYY-MM-DD') // "2017-13-06"
     */
    var self = this;
    var parse = function (date) {
        var YYYY = date.getFullYear(),
            YY = ('' + YYYY).substr(2),
            M = date.getMonth() + 1,
            MM = ('0' + M).slice(-2),
            D = date.getDate(),
            DD = ('0' + D).slice(-2),
            h = (date.getHours() > 12)?(date.getHours()-12):date.getHours() ,
            // hh = ('0' + h).slice(-2),
            hh = (date.getHours() > 9)?date.getHours():'0' + date.getHours(),
            m = date.getMinutes(),
            mm = ('0' + m).slice(-2),
            s = date.getSeconds(),
            ss = ('0' + s).slice(-2),
            ms = date.getMilliseconds(),
            msss = ('00' + ms).slice(-3);
        return {
            YYYY: YYYY,
            YY: YY,
            M: M,
            MM: MM,
            D: D,
            DD: DD,
            h: h,
            hh: hh,
            m: m,
            mm: mm,
            s: s,
            ss: ss,
            ms: ms,
            msss: msss
        }
    };
    var format = function (date, pattern) {
        var result = '';
        var dateObj = parse(date);
        var splitArr = pattern.match(/(\w+((?=[\-\/ \:\.])|$))|([\-\/ \:\.]+)/g);
        var acceptReg = /YYYY|YY|M|MM|D|DD|h|hh|m|mm|s|ss|ms|msss/i;
        for (var i = 0, len = splitArr.length, item = ''; i < len; i++) {
            item = splitArr[i];
            if (acceptReg.test(item)) {
                item = dateObj[item];
            }
            result += item;
        }
        return result;
    };
    return format(self, pattern);
}

Date.prototype.shortTime = function (time_offset, only_H_S) {
    /**
     * 0：00—6:00凌晨,6:00—11:00上午，11:00—13:00中午，13:00—16:00下午，16:00—18:00傍晚，18:00—24:00晚上
     * exmaple:
     * d = new Date()
     * d.shortTime() // "今天 中午 12:27"
     */


    function DateTimezone(d, time_offset) {
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
        local_now.getHours(), local_now.getMinutes());

        return today_now;
    }

    var self = this;
    var now = DateTimezone(new Date(), time_offset);
    var result = '';
    var self = DateTimezone(this, time_offset);

    var DayDiff = now.getDate() - self.getDate();
    var Minutes = self.getHours() * 60 + self.getMinutes();
    if (DayDiff === 0) {
        result += TAPi18n.__('today')+' '
    } else if (DayDiff === 1) {
        result += TAPi18n.__("yesterday")+' '
    } else {
        result += self.parseDate('YYYY-MM-DD') + ' ';
    }
    if (Minutes >= 0 && Minutes < 360) {
        result += TAPi18n.__("earlyMorning")+' ';
    }
    if (Minutes >= 360 && Minutes < 660) {
        result += TAPi18n.__("morning")+' ';
    }
    if (Minutes >= 660 && Minutes < 780) {
        result += TAPi18n.__("noon")+' ';
    }
    if (Minutes >= 780 && Minutes < 960) {
        result += TAPi18n.__("afternoon")+' ';
    }
    if (Minutes >= 960 && Minutes < 1080) {
        result += TAPi18n.__("afternoon")+' ';
    }
    if (Minutes >= 1080 && Minutes < 1440) {
        result += TAPi18n.__("evening")+' ';
    }
    result += self.parseDate('h:mm');
    if(only_H_S){
        return self.parseDate('hh:mm');
    }
    return result;
}
