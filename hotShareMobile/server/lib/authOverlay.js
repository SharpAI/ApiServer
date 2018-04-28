if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Accounts.loginServiceConfiguration.remove({
      service: 'weibo'
    });
    Accounts.loginServiceConfiguration.remove({
      service: 'wechat'
    });
    Accounts.loginServiceConfiguration.remove({
      service: 'qq'
    });

    Accounts.loginServiceConfiguration.insert({
      service: 'weibo',
      clientId: '1508135381',
      secret: '9622fe6d509adbe1a88c01ddf4afc9cd'
    });
    Accounts.loginServiceConfiguration.insert({
      service: 'qq',
      clientId: '101199533',
      scope:'get_user_info',
      secret: '0049556bbaba965ffa97521cb6054009'
    });
    Accounts.loginServiceConfiguration.insert({
      service: 'wechat',
      appId: 'wx637c7894a6f687b8',
      secret: 'bf0f7fbc8688a52ac3d958062e22b31b'
    });
    Meteor.publish('allUsers', function() {
      return Meteor.users.find();
    });
  });
}
