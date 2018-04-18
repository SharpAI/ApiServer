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

