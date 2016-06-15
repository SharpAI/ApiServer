/**
 * Created by simba on 6/14/16.
 */

if (Meteor.isClient) {
    Meteor.startup(function() {
        setTimeout(function() {
            $("#inject-loader-wrapper").fadeOut(500, function() { $(this).remove(); });
        }, 500);
    });
}
