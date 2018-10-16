var fs = require('fs');
var os = require('os');
var DDPClient = require("ddp");
WebSocket = require('ws');
var login = require('ddp-login');
var CryptoJS = require("crypto-js");
var flowerws = process.env.FLOWER_WS || 'ws://flower:5555/api/task/events/task-succeeded/';

var ddpClient = new DDPClient({
  // All properties optional, defaults shown
  host : process.env.HOST_ADDRESS || "192.168.0.7",
  port : process.env.HOST_PORT || 3000,
  ssl  : false,
  maintainCollections : true,
  ddpVersion : '1'
});

var DEVICE_UUID_FILE = process.env.UUID_FILE || '/dev/ro_serialno'
var DEVICE_GROUP_ID = process.env.GROUP_ID || '/data/usr/com.deep.workai/cache/groupid.txt'
var VERSION_FILE = process.env.VERSION_FILE || '../version'
var AUTO_UPDATE_FILE = process.env.AUTO_UPDATE_FILE || '../workaipython/wtconf/enableWT'

function get_device_uuid(cb){
  fs.readFile(DEVICE_UUID_FILE, function (err,data) {
    if (err) {
      return cb && cb('no_uuid')
    }
    return cb && cb(data.toString().replace(/(\r\n\t|\n|\r\t)/gm,""))
  });
}

var connectedToServer = false;
function login_with_device_id(device_id, callback){
  var real_pwd = CryptoJS.HmacSHA256(device_id, "sharp_ai98&#").toString()
  console.log(real_pwd)
  login(ddpClient,
    {  // Options below are the defaults
       env: 'METEOR_TOKEN',  // Name of an environment variable to check for a
                             // token. If a token is found and is good,
                             // authentication will require no user interaction.
       method: 'username',    // Login method: account, email, username or token
       account: device_id,        // Prompt for account info by default
       pass: real_pwd,           // Prompt for password by default
       retry: 5,             // Number of login attempts to make
       plaintext: false      // Do not fallback to plaintext password compatibility
                             // for older non-bcrypt accounts
    },
    function (error, userInfo) {
      if (error) {
        // Something went wrong...
        console.log('login error')
      } else {
        // We are now logged in, with userInfo.token as our session auth token.
        token = userInfo.token;
        console.log('login ok:'+token)
        sub_command_list(device_id)
        sub_device_info(device_id)
      }

      callback && callback(error,userInfo)
    }
  );
}
function connectToMeteorServer(device_id){
  ddpClient.connect(function(error, wasReconnect) {
    // If autoReconnect is true, this callback will be invoked each time
    // a server connection is re-established
    if (error) {
      console.log('DDP connection error!');
      process.exit(-10)
      return;
    }
    if (wasReconnect) {
      console.log('Reestablishment of a connection. The status is hard to keep,just restart');

      process.exit(10)
      /*connectedToServer = true
      login_with_device_id(device_id,function(error,userInfo){
        if(error){
          console.log(error)
        }
      })*/
    } else {
      console.log('new connection to meteor server')
      connectedToServer = true
      login_with_device_id(device_id,function(error,userInfo){
        if(error){
          console.log(error)
        }
      })
    }
  })
}

function processing_command_config(config, cb) {
    if(!config)
        return cb && cb("invalied args");

    var autoUpdate = config.autoUpdate;
    var update_enabled = fs.existsSync(AUTO_UPDATE_FILE);
    /*going to enable update*/
    if(autoUpdate == true) {
        fs.writeFile(AUTO_UPDATE_FILE, "enable", function(err) {
            if(err) {
                return cb && cb("fs.writeFile failed");
            }
            else {
                return cb && cb ();
            }
        });
    }
    /*going to disable update*/
    else {
        if(!update_enabled) {
            return cb && cb ();
        }
        fs.unlink(AUTO_UPDATE_FILE, function(err){
            if(err){
                return cb && cb(err)
            }
            else {
                return cb && cb ();
            }
        })
    }
}

function processing_command_done(id, client_id) {
    console.log('command done')
    ddpClient.call('cmd_done',[id, {"client_id": client_id, "command_id": id}])
}

function processing_command(id){
  var command_contex = ddpClient.collections.commands[id];
  var clientid = command_contex.client_id;
  var cmd = command_contex.command;

  if(cmd && cmd == "config") {
      console.log("sync config to local")
      if(command_contex.config) {
          processing_command_config(command_contex.config, function(err) {
              processing_command_done(id, clientid);
          })
      }
      else {
          processing_command_done(id, clientid);
      }
  } else {
      processing_command_done(id, clientid);
  }
}

function handle_group_id(group_id){
  console.log('yes, my group id is ['+ group_id +'] for now')

  fs.writeFile(DEVICE_GROUP_ID, group_id, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}
function sub_device_info(client_id){
      /*
       * Observe a collection.
       */
      var observer = ddpClient.observe("devices");
      observer.added = function(id) {
        console.log("[ADDED] to " + observer.name + ":  " + id);
        console.log(ddpClient.collections.devices);
        if(ddpClient.collections.devices[id]){
          var doc = ddpClient.collections.devices[id];
          if(doc && doc['groupId']){
              handle_group_id(doc['groupId'])
          }
        }
      };
      observer.changed = function(id, oldFields, clearedFields, newFields) {
        console.log("[CHANGED] in " + observer.name + ":  " + id);
        console.log("[CHANGED] old field values: ", oldFields);
        console.log("[CHANGED] cleared fields: ", clearedFields);
        console.log("[CHANGED] new fields: ", newFields);
        if(newFields['groupId']){
          handle_group_id(newFields['groupId'])
        }
      };
      observer.removed = function(id, oldValue) {
        console.log("[REMOVED] in " + observer.name + ":  " + id);
        console.log("[REMOVED] previous value: ", oldValue);
      };

      /*
       * Subscribe to a Meteor Collection
       */
      ddpClient.subscribe(
        'devices-by-uuid',                  // name of Meteor Publish function to subscribe to
        [client_id],                       // any parameters used by the Publish function
        function () {             // callback when the subscription is complete
          console.log('commands complete:');
          console.log(ddpClient.collections.devices);
        }
      );
}
function sub_command_list(client_id){
      /*
     * Observe a collection.
     */
    var observer = ddpClient.observe("commands");
    observer.added = function(id) {
      console.log("[ADDED] to " + observer.name + ":  " + id);
      console.log(ddpClient.collections.commands);
      processing_command(id)
    };
    observer.changed = function(id, oldFields, clearedFields, newFields) {
      console.log("[CHANGED] in " + observer.name + ":  " + id);
      console.log("[CHANGED] old field values: ", oldFields);
      console.log("[CHANGED] cleared fields: ", clearedFields);
      console.log("[CHANGED] new fields: ", newFields);
    };
    observer.removed = function(id, oldValue) {
      console.log("[REMOVED] in " + observer.name + ":  " + id);
      console.log("[REMOVED] previous value: ", oldValue);
    };

    /*
     * Subscribe to a Meteor Collection
     */
    ddpClient.subscribe(
      'commands',                  // name of Meteor Publish function to subscribe to
      [client_id],                       // any parameters used by the Publish function
      function () {             // callback when the subscription is complete
        console.log('commands complete:');
        console.log(ddpClient.collections.commands);
      }
    );
}

function cpu_mem_uptime_temp(cb) {
    var cpu_average = 0;
    var mem = {'free': -1, 'total':-1, 'usage': 0};
    var uptime = os.uptime();
    var temp = {'cpu': -1, 'gpu': -1};

    /*CPU*/
    var cpus = os.cpus();
    for(var i=0;i<cpus.length;i++) {
        var cpu = cpus[i];
        var usage = 0;
        if (cpu && cpu.times) {
          var total = 1;
          var idle = 0;
          total = cpu.times.user + cpu.times. user+ cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
          idle = cpu.times.idle;
          usage = (1 - (idle/total)).toFixed(2);
        }
        cpu_average += Number(usage);
    }
    cpu_average = (cpu_average/cpus.length).toFixed(2);

    /*MEM*/
    mem.free = os.freemem();
    mem.total = os.totalmem();
    if(mem.total > 0 ) {
        mem.usage = (1 - (mem.free/mem.total)).toFixed(2);
    }

    /*TEMP*/
    for(var i=0;i<4;i++) {
        var dir = "/sys/class/thermal/thermal_zone" + i + '/';
        var type_file = dir + 'type';
        var temp_file = dir + 'temp';
        var exists = fs.existsSync(dir);
        if(!exists)
            continue;

        var typename = fs.readFileSync(type_file, 'utf8').replace(/[\r\n]/g,"");
        var temp_val = fs.readFileSync(temp_file, 'utf8').replace(/[\r\n]/g,"");
        if(typename.length < 1 && temp_val.length < 1)
            continue;

        if(typename.startsWith("soc-thermal")) {
            temp.cpu = temp_val;
        } else if(typename.startsWith("gpu-thermal")) {
            temp.gpu = temp_val;
        }
    }

    return cb && cb({'cpu': cpu_average, 'mem': mem, 'uptime': uptime, 'temp': temp})
}

function get_curent_version(cb) {
    var all_version = {'v1': 'unknown', 'v2': 'unknown'};
    var exists = fs.existsSync(VERSION_FILE);
    if(exists) {
        var version_val = fs.readFileSync(VERSION_FILE, 'utf8').replace(/[\r\n]/g,"");
        if(version_val.length > 0) {
            all_version.v1 = version_val;
        }
    }
    /*TODO: get v2 from docker*/
    return cb && cb(all_version);
}

function get_curent_config(cb) {
    var all_config = {'autoupdate': false};
    var exists = fs.existsSync(AUTO_UPDATE_FILE);
    if(exists) {
        all_config.autoupdate = true;
    }
    /*TODO: get v2 from docker*/
    return cb && cb(all_config);
}

get_device_uuid(function(uuid){
  var my_client_id = uuid
  connectToMeteorServer(my_client_id)

  var ws = new WebSocket(flowerws);
  var connected_to_camera = false;
  var camera_monitor_timeout = null;
  var status = {
      total_tasks:0,
      face_detected:0,
      face_recognized:0,
      os: {},
      version: {},
      cfg: {}
  }

  setInterval(function(){
    cpu_mem_uptime_temp(function(os_info) {
        status.os = os_info;
    })
    get_curent_version(function(version_info) {
       status.version = version_info;
    })
    get_curent_config(function(cfg) {
       status.cfg = cfg;
    })

    ddpClient.call('report',[{
        clientID :my_client_id,
        total_tasks:     status.total_tasks,
        face_detected:   status.face_detected,
        face_recognized: status.face_recognized,
        os:              status.os,
        version:         status.version,
        cfg:             status.cfg }])

    status.total_tasks = 0;
    status.face_detected = 0;
    status.face_recognized = 0;
  },60*1000)

  ws.onmessage = function (event) {
      var result = JSON.parse(event.data)
      status.total_tasks++;
      if(result.hostname == "celery@detect"){
         var detect_result = JSON.parse(result.result.replace(/\'/g,""))
         if(detect_result.detected == true){
           status.face_detected++;
           console.log('face detected')
         }
      }
      if(result.hostname == "celery@embedding"){
         console.log('extract embedding')
         var extract_result = JSON.parse(result.result.replace(/\'/g,""))
         if(extract_result.result.recognized){
            status.face_recognized++;
            console.log('face recognized')
         }else{
            console.log('face not recognized')
         }
      }
  }
})
