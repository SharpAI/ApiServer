if (Meteor.isServer) {
  Meteor.startup(function () {
    create_offline_notification('test_client_id',{});
    Meteor.setTimeout(function(){
      cancel_offline_notification('test_client_id');
    },500)

    create_offline_notification('test_client_id_1111',{});
  })
}
