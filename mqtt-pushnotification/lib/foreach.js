var debug=false

forEachAsynSeriesWait = function(dataArray, limit, timeout, fn, callback) {
        var done = false;
        var running = 0;
        var breakLoop = {};
        timeout = timeout?timeout:1000;

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
                setTimeout(function(){
                    debug && console.log('replenish..., timeout='+timeout);
                    replenish();
                }, timeout);
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
                    fn(elem.value, elem.key, iterateeCallback);
                }
                setImmediateFunc(elem);
            }
        }

        replenish();
}

module.exports = forEachAsynSeriesWait;
