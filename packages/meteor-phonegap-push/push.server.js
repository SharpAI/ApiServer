/*
  A general purpose user CordovaPush
  ios, android, mail, twitter?, facebook?, sms?, snailMail? :)

  Phonegap generic :
  https://github.com/phonegap-build/PushPlugin
 */

// getText / getBinary


CordovaPush = function(androidServerKey, options) {
    var self = this;

    // This function is called when a token is replaced on a device - normally
    // this should not happen, but if it does we should take action on it
    self.replaceToken = (typeof options.onReplace === 'function')?
                    options.onReplace:function(oldToken, newToken) {
                        console.log('Replace token: ' + oldToken + ' -- ' + newToken);
                    };

    self.removeToken = (typeof options.onRemove === 'function')?
                    options.onRemove:function(token) {
                        console.log('Remove token: ' + token);
                    };                    

    if (!options['certData'] || !options['certData'].length)
        console.log('Push server could not find certData');

    if (!options['keyData'] || !options['keyData'].length)
        console.log('Push server could not find keyData');


    // https://npmjs.org/package/apn

    // After requesting the certificate from Apple, export your private key as a .p12 file and download the .cer file from the iOS Provisioning Portal.
    
    // gateway.push.apple.com, port 2195
    // gateway.sandbox.push.apple.com, port 2195
    
    // Now, in the directory containing cert.cer and key.p12 execute the following commands to generate your .pem files:
    // $ openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
    // $ openssl pkcs12 -in key.p12 -out key.pem -nodes

    var apn = Npm.require('apn');

    var apnConnection = new apn.Connection( options );
    // (cert.pem and key.pem)
    self.sendIOS = function(from, userToken, title, text, count, priority) {

        priority = (priority || priority === 0)? priority : 10;

        var myDevice = new apn.Device(userToken);

        var note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600*12; // Expires 1 hour from now.
        note.badge = count;
        note.sound = "ping.aiff";
        //note.sound = ""; // XXX: Does this work?
        note.alert = text;
        note.payload = {'messageFrom': from };
        note.priority = priority;

        //console.log('I:Send message to: ' + userToken + ' count=' + count);

        apnConnection.pushNotification(note, myDevice);

    };

    self.sendAndroid = function(from, userTokens, title, text, count) {
        var gcm = Npm.require('node-gcm');
        var Fiber = Npm.require('fibers');
         
        //var message = new gcm.Message();
        var message = new gcm.Message({
            collapseKey: from,
            delayWhileIdle: true,
            timeToLive: 3600*12,
        //    restricted_package_name: 'dk.gi2.driftsstatus'
            data: {
                title: title,
                message: text,
                msgcnt: count
            }
        });
        var sender = new gcm.Sender(androidServerKey);

        _.each(userTokens, function(value, key) {
            //console.log('A:Send message to: ' + value + ' count=' + count);
        });
        
        /*message.addData('title', title);
        message.addData('message', text);
        message.addData('msgcnt', '1');
        message.collapseKey = 'sitDrift';
        message.delayWhileIdle = true;
        message.timeToLive = 3;*/
             
        // /**
        //  * Parameters: message-literal, userTokens-array, No. of retries, callback-function
        //  */

        var userToken = (userTokens.length === 1)?userTokens[0]:null;
        
        sender.send(message, userTokens, 10, function (err, result) {
            if (err) {
                //console.log('ANDROID ERROR: result of sender: ' + result);
            } else if (result){
                //console.log('ANDROID: Result of sender: ' + JSON.stringify(result));
                if (result.canonical_ids && result.canonical_ids === 1 && userToken) {

                    // This is an old device, token is replaced
                    Fiber(function(self) {
                        // Run in fiber
                        try {
                            self.callback(self.oldToken, self.newToken);
                        } catch(err) {
                            
                        }

                    }).run({
                        oldToken: { androidToken: userToken },
                        newToken: { androidToken: result.results[0].registration_id }, 
                        callback: self.replaceToken
                    });
                    //self.replaceToken({ androidToken: userToken }, { androidToken: result.results[0].registration_id });

                }
                // We cant send to that token - might not be registred
                // ask the user to remove the token from the list
                if (result.failure && result.failure !== 0 && userToken) {

                    // This is an old device, token is replaced
                    Fiber(function(self) {
                        // Run in fiber
                        try {
                            self.callback(self.token);
                        } catch(err) {
                            
                        }

                    }).run({
                        token: { androidToken: userToken }, 
                        callback: self.removeToken
                    });
                    //self.replaceToken({ androidToken: userToken }, { androidToken: result.results[0].registration_id });

                }

            }
        });
        // /** Use the following line if you want to send the message without retries
        // sender.sendNoRetry(message, userTokens, function (result) {
        //     console.log('ANDROID: ' + JSON.stringify(result));
        // });
        // **/        
    }; // EO sendAndroid

    self.initFeedback = function() {
        var apn = Npm.require('apn');

        var feedbackOptions = {
            "batchFeedback": true,
            "interval": 1000,
            'address': 'feedback.push.apple.com'
        };

        var feedback = new apn.Feedback(feedbackOptions);
        feedback.on("feedback", function(devices) {
            devices.forEach(function(item) {
                // Do something with item.device and item.time;
                console.log('A:PUSH FEEDBACK ' + item.device + ' - ' + item.time);
            });
        });
    };


    return self;
};
