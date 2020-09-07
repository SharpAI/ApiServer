setImmediateWrap = function(fn) {
    if (typeof setImmediate === 'function') {
        return setImmediate(fn);
    } else if (typeof process === 'object' && typeof process.nextTick === 'function') {
        return process.nextTick(fn);
    } else {
        return setTimeout(fn, 0);
    }
}

forEachAsynSeries = function(dataArray, limit, fn, callback) {
    var done = false;
    var running = 0;
    var breakLoop = {};

    function createObjectIterator(obj) {
        var i = -1;
        var len = obj.length;
        return function next() {
            var key = ++i;
            return i < len ? { value: obj[key], key: key } : null;
        };
    }

    var nextElem = createObjectIterator(dataArray);
    function iterateeCallback(err, value) {
        running -= 1;
        if (err) {
            done = true;
            callback(err);
        } else if (value === breakLoop || done && running <= 0) {
            done = true;
            return callback(null);
        } else {
            replenish();
        }
    }

    function replenish() {
        while (running < limit && !done) {
            //console.log("running="+running);
            var elem = nextElem();
            if (elem === null) {
                done = true;
                if (running <= 0) {
                    callback(null);
                }
                return;
            }
            //console.log("elem.key="+elem.key);
            running += 1;
            //fn(elem.value, elem.key, iterateeCallback);
            //continue;
            function setImmediateFunc(elem) {
                setImmediate(function(){
                    fn(elem.value, elem.key, iterateeCallback);
                });
            }
            setImmediateFunc(elem);
        }
    }

    replenish();
}

getTimeZoneDiffByMs = function(time1, time2) {
  var diff, timezone_offset;
  diff = time1 - time2;
  timezone_offset = diff / (3600 * 1000);
  timezone_offset = Math.round(timezone_offset);
  console.log("timezone_offset="+timezone_offset)
  return timezone_offset * 3600 * 1000;
};

String.prototype.format = function() {
    var formatted = this;
    for( var arg in arguments ) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

utilFormatTime = function(time) {
    var now = new Date(time);
    var ms = now.getTime();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    var month = now.getMonth()+1<10 ? "0"+(now.getMonth()+1) : now.getMonth()+1;
    var day = now.getDate()<10 ? "0"+now.getDate() : now.getDate();
    var hour = now.getHours()<10 ? "0"+now.getHours() : now.getHours();
    var minute = now.getMinutes()<10 ? "0"+now.getMinutes() : now.getMinutes();
    var second = now.getSeconds()<10 ? "0"+now.getSeconds() : now.getSeconds();
    var milSecond = now.getMilliseconds();
    var divid = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
    console.log("utilFormatTime: " + divid);
    return divid;
};
