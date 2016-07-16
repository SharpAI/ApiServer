module.exports=Tcpdump
function Tcpdump(){

}
Tcpdump.time1 = 0;
Tcpdump.time2 = 0;

var exec_shell = function (opts) {
  var exec = require('child_process').exec,
  last = exec(opts);

  last.stdout.on('data', function (data) {
    console.log('stdout--> ' + data);
//     if (data.indexOf( "Text" ) > 0 )
  });

  last.on('exit', function (code) {
    console.log('exit ' + code);
  });
};

var exec_shell2 = function (opts, cb) {
  var i = 0;
  var val = -1;

  var exec = require('child_process').exec,
  last = exec(opts);

  last.stdout.on('data', function (data) {
    i++;
    if (i == 5) {
      console.log('stdout '+i+ data);
      val = data;
    }
  });

  last.on('exit', function (code) {
    console.log('exit ' + code);
    cb && cb(val)
    return val;
  });
};


Tcpdump.start = function () {
  Tcpdump.time1 = new Date;
  return exec_shell('bash ./helpers/tcpdump_start.sh');
}

Tcpdump.stop = function () {
  Tcpdump.time2 = new Date;
  return exec_shell('bash ./helpers/tcpdump_stop.sh');
}

Tcpdump.size = function (cb) {
  var size = 0;

  exec_shell2('bash ./helpers/tcpdump_size.sh', function(size) {
    cb && cb(size)
  });
}
