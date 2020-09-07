//var gcm = Npm.require('node-gcm');
 
// var message = new gcm.Message();
// var sender = new gcm.Sender('AIzaSyCDx8v9R0fMsAsjoAffF-P3FCFWXlvwKgL');
// var registrationIds = [];
 
// message.addData('title','My Game');
// message.addData('message','Your turn!!!!');
// message.addData('msgcnt','1');
// message.collapseKey = 'demo';
// message.delayWhileIdle = true;
// message.timeToLive = 3;
 
// // At least one token is required - each app registers a different token
// registrationIds.push('APA91bFobAwN7P3Okxy2al8RI12VcJFUS-giXWTOoWXIObtSPOE1h7FuH1VPLBPgshDI_Fp7aIYVET-ssvGUErlWYA0cKPGhoXT1daqyDsEfem9ZtgZNRhQFv7kLCIVSigYlpMluToPiSHSsFSEdtCDfKoOZqNPgfs');
 
// /**
//  * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
//  */
// sender.send(message, registrationIds, 4, function (result) {
//     console.log(result);
// });
// /** Use the following line if you want to send the message without retries
// sender.sendNoRetry(message, registrationIds, function (result) {
// console.log(result); });
// **/