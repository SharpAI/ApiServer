var nodemailer = require('nodemailer');

function lib_mail(){
}

lib_mail.transporter = null;

lib_mail.transporterInit = function() {
    // create reusable transporter object using SMTP transport
    lib_mail.transporter = nodemailer.createTransport({
        "host": "smtpdm.aliyun.com",
        "port": 465,
        "secureConnection": true, // use SSL
        "auth": {
            "user": 'notify@mail.tiegushi.com', // user name
            "pass": 'Actiontec753951'         // password
        }
    });
    console.log('mail transporter initialized')
}

lib_mail.mailPostMessage = function(serverName, msg, receivers) {
    if(!serverName || !msg || !receivers) {
        console.log('mailPostMessage invalid args')
        return
    }

    if(!lib_mail.transporter) {
        console.log('mailPostMessage transporter not initialized')
        return
    }

    var ts = new Date()
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'gushitie<notify@mail.tiegushi.com>', // sender address mailfrom must be same with the user
        to: receivers, // list of receivers
        subject: serverName + ' maybe Down ', // Subject line
        text: msg
    };

    lib_mail.transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}

module.exports = lib_mail
