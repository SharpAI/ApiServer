Phonegap-push [![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=SREKMFLQHNK5C)
=======
Meteor push server implementation for push notifications to android and iOS.

```js
// Files are placed in the `/private` folder:
var apnsProdCert = Assets.getText('apnProdCert.pem');
var apnsProdKey = Assets.getText('apnProdKey.pem');
var apnsDevCert = Assets.getText('apnDevCert.pem');
var apnsDevKey = Assets.getText('apnDevKey.pem');

var optionsDevelopment = {
    'passphrase': 'Pass phrase',
    'certData': apnsDevCert,
    'keyData': apnsDevKey,
    'gateway': 'gateway.sandbox.push.apple.com',

};

var optionsProduction = {
    'passphrase': 'Pass phrase',
    'certData': apnsProdCert,
    'keyData': apnsProdKey,
    'gateway': 'gateway.push.apple.com'

};

var pushServer = new CordovaPush('Android server key', optionsProduction );


// Do some clever stuff like figuring out what apps are subscribing to certain push messages

pushServer.initFeedback();

// One can broadcast to the androids by pushing them to an array or just send one at a time:
pushServer.sendAndroid(messageFrom, [androidToken], messageTitle, messageText, user.msgCount);

// Send to iOS one at a time
pushServer.sendIOS(messageFrom, iosToken, messageTitle, messageText, user.msgCount);
```
*Not sure if badge counter is supported on android*

##TODO:
* Have an app collection with appId´s and mapped settings/details and push token + badge counter

##Certificates

[Great writeup by Ali](http://www.raywenderlich.com/32960/apple-push-notification-services-in-ios-6-tutorial-part-1)

###Making a PEM File
So now you have three files:
* The CSR
* The private key as a p12 file (PushChatKey.p12)
* The SSL certificate, aps_development.cer

Store these three files in a safe place. You could throw away the CSR but in my opinion it is easier to keep it. When your certificate expires, you can use the same CSR to generate a new one. If you were to generate a new CSR, you would also get a new private key. By re-using the CSR you can keep using your existing private key and only the .cer file will change.

You have to convert the certificate and private key into a format that is more usable. Because the push part of our server will be written in PHP, you will combine the certificate and the private key into a single file that uses the PEM format.

The specifics of what PEM is doesn’t really matter (in fact, I have no idea) but it makes it easier for PHP to use the certificate. If you write your push server in another language, these following steps may not apply to you.

You’re going to use the command-line OpenSSL tools for this. Open a Terminal and execute the following steps.

Go to the folder where you downloaded the files, in my case the Desktop:
```
$ cd ~/Desktop/
```
Convert the .cer file into a .pem file:
```
$ openssl x509 -in aps_development.cer -inform der -out PushChatCert.pem
```
Convert the private key’s .p12 file into a .pem file:
```
$ openssl pkcs12 -nocerts -out PushChatKey.pem -in PushChatKey.p12
Enter Import Password: 
MAC verified OK
Enter PEM pass phrase: 
Verifying - Enter PEM pass phrase: 
```
You first need to enter the passphrase for the .p12 file so that openssl can read it. Then you need to enter a new passphrase that will be used to encrypt the PEM file. Again for this tutorial I used “pushchat” as the PEM passphrase. You should choose something more secure.
Note: if you don’t enter a PEM passphrase, openssl will not give an error message but the generated .pem file will not have the private key in it.
Finally, combine the certificate and key into a single .pem file:
```
$ cat PushChatCert.pem PushChatKey.pem > ck.pem
```
At this point it’s a good idea to test whether the certificate works. Execute the following command:
```
$ telnet gateway.sandbox.push.apple.com 2195
Trying 17.172.232.226...
Connected to gateway.sandbox.push-apple.com.akadns.net.
Escape character is '^]'.
```
This tries to make a regular, unencrypted, connection to the APNS server. If you see the above response, then your Mac can reach APNS. Press Ctrl+C to close the connection. If you get an error message, then make sure your firewall allows outgoing connections on port 2195.
Let’s try connecting again, this time using our SSL certificate and private key to set up a secure connection:
```
$ openssl s_client -connect gateway.sandbox.push.apple.com:2195 
    -cert PushChatCert.pem -key PushChatKey.pem
Enter pass phrase for PushChatKey.pem: 
```
You should see a whole bunch of output, which is openssl letting you know what is going on under the hood.
If the connection is successful, you should be able to type a few characters. When you press enter, the server should disconnect. If there was a problem establishing the connection, openssl will give you an error message but you may have to scroll up through the output to find it.

*Note: There are two different APNS servers: the “sandbox” server that you can use for testing, and the live server that you use in production mode. Above, we used the sandbox server because our certificate is intended for development, not production use.*

