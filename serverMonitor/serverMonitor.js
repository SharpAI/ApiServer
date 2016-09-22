const spawn = require('child_process').spawn;
const http = require('http');
var nodemailer = require('nodemailer');
var Connection = require('ssh2');
var SlackBot = require('slackbots');

var mail_receivers = 'xfang@actiontec.com, xning@actiontec.com, jliao@actiontec.com, zhzhang@actiontec.com';
//var mail_receivers = 'xning@actiontec.com';

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    "host": "smtpdm.aliyun.com",
    "port": 465,
    "secureConnection": true, // use SSL
    "auth": {
        "user": 'notify@mail.tiegushi.com', // user name
        "pass": 'Actiontec753951'         // password
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'gushitie<notify@mail.tiegushi.com>', // sender address mailfrom must be same with the user
    to: mail_receivers, // list of receivers
    subject: 'HotShare Server maybe Down', // Subject line
    text: 'It seems something wrong with hotShare server. Please check if it is down!'
};

/*var c = new Connection();
c.on('connect', function() {
  console.log('Connection :: connect');
});
c.on('ready', function() {
  console.log('Connection :: ready');
  c.exec('uptime', function(err, stream) {
    if (err) throw err;
    stream.on('data', function(data, extended) {
      console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ')
                  + data);
    });
    stream.on('end', function() {
      console.log('Stream :: EOF');
    });
    stream.on('close', function() {
      console.log('Stream :: close');
    });
    stream.on('exit', function(code, signal) {
      console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
      c.end();
    });
  });
});
c.on('error', function(err) {
  console.log('Connection :: error :: ' + err);
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);

  });
});
c.on('end', function() {
  console.log('Connection :: end');
});
c.on('close', function(had_error) {
  console.log('Connection :: close');
});*/

var slackBot = new SlackBot({
  token: 'xoxb-76820722259-dlvZ74CLXLN60rie25DGM64w', // Add a bot https://my.slack.com/services/new/bot and put the token
  name: 'Post Reporter'
});

function connectServer() {
  /*c.connect({
    host: '120.24.244.253',
    port: 22,
    username: 'root',
    password: 'wiRN$#sdf284'
  });*/
  http.get('http://cdn.tiegushi.com/posts/7EQLESsR5gCm9ftzq', function(res) {
    console.log('Got response: ' + res.statusCode);
    if (res.statusCode != 200) {
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return console.log(error);
          }
          console.log('Message sent: ' + info.response);

      });

      slackBot.postMessageToChannel('general', 'It seems something wrong with hotShare server. Please check if it is down!');
    }
    // consume response body
    res.resume();
  }).on('error', function(e) {
    console.log('Got error: ' + e.message);
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);

    });

    slackBot.postMessageToChannel('general', 'It seems something wrong with hotShare server. Please check if it is down!');
  });
}

connectServer();
setInterval(function() {
  connectServer();
  /*ping = spawn('ping', ['-n', '-c', '3', '120.24.244.253']);

  ping.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  ping.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  ping.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    console.log('exit with code: ' + code);
    if (code == 1) {
      console.log('server maybe down');
      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return console.log(error);
          }
          console.log('Message sent: ' + info.response);

      });
    }
  });*/
}, 10*60*1000);
