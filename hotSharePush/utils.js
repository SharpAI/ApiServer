(function() {

isArray = function(o) {  
    return Object.prototype.toString.call(o) === '[object Array]';   
}  

getJSONObj = function(req, res, callback) {
    var req_datastr = '';
    var req_dataObj = null;

    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    req.setEncoding('utf8');
    req.on('data', function(data) {
      console.log("data = "+data)
      req_datastr += data;
    })
    .on('end', function() {
        if (req_datastr === '') {
            return callback && callback("failed", "request with null string");
        }
        try {
            req_dataObj = JSON.parse(req_datastr);
        } catch (error) {
            console.log("getJSONObj: JSON.parse exception! error="+error);
            return callback && callback("exception", error)
        }
        return callback && callback(null, req_dataObj);
    });
}

getJSONString = function getJSONString(req, res, callback) {
    var req_datastr = '';

    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    req.setEncoding('utf8');
    req.on('data', function(data) {
      console.log("data = "+data)
      req_datastr += data;
    })
    .on('end', function() {
        if (!req_datastr) {
            return callback && callback("failed", "request with null string");
        }
        return callback && callback(null, req_datastr);
    });
}

}).call(this);