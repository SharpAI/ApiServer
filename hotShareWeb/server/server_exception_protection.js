/**
 * Created by simba on 9/27/16.
 */

if (Meteor.isServer){
    process.addListener('uncaughtException', function (err) {
        var msg = err.message;
        if (err.stack) {
            msg += '\n' + err.stack;
        }
        if (!msg) {
            msg = JSON.stringify(err);
        }
        console.log(msg);
        console.trace();
    });
}