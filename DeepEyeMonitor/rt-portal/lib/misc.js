/**
 * Created by simba on 4/15/16.
 */

GetHour = function(date) {
    var srcTime = date.getTime();
    var hourMillis = 1000 * 60 * 60;
    var diffFromNow = srcTime % hourMillis;
    var hourTime = new Date(srcTime - diffFromNow);

    return hourTime;
}
GetDay = function(date) {
    var srcTime = date.getTime();
    var dayMillis = 1000 * 60 * 60 * 24;
    var diffFromNow = srcTime % dayMillis;
    var dayTime = new Date(srcTime - diffFromNow);

    return dayTime;
}
