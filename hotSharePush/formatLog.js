var origConsoleLog = console.log;
var origConsoleWarn = console.warn;
var origConsoleInfo = console.info;
var origConsoleError = console.error;

function getFormatedDateTime() {
    var dt = new Date();
    var yyyy = dt.getFullYear();
    var mm = dt.getMonth() + 1;
    var dd = dt.getDate();
    var hh = dt.getHours();
    var min = dt.getMinutes();
    var ss = dt.getSeconds();
    var SSS = dt.getMilliseconds();
    return '[' +
                [yyyy,
                 ((mm < 10) ? '0' : '') + mm,
                 ((dd < 10) ? '0' : '') + dd].join('-') + ' ' +
                [((hh < 10) ? '0' : '') + hh,
                 ((min < 10) ? '0' : '') + min,
                 ((ss < 10) ? '0' : '') + ss].join(':') + '.' +
                 ('000'+SSS).substr((''+ SSS).length) +
              ']:';
}

console.log = function (message) {
    var dateTime = getFormatedDateTime();
    Array.prototype.unshift.call(
        arguments,
        dateTime
    );
    origConsoleLog && origConsoleLog.apply(console, arguments);
};
console.warn = function (message) {
    var dateTime = getFormatedDateTime();
    Array.prototype.unshift.call(
        arguments,
        dateTime
    );
    origConsoleWarn && origConsoleWarn.apply(console, arguments);
};
console.info = function (message) {
    var dateTime = getFormatedDateTime();
    Array.prototype.unshift.call(
        arguments,
        dateTime
    );
    origConsoleInfo && origConsoleInfo.apply(console, arguments);
};
console.error = function (message) {
    var dateTime = getFormatedDateTime();
    Array.prototype.unshift.call(
        arguments,
        dateTime
    );
    origConsoleError && origConsoleError.apply(console, arguments);
};