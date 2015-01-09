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
      clientId: '123490452',
      secret: 'f69795795d96fe8518a4f0bc14d8bf3b'
    });
    Accounts.loginServiceConfiguration.insert({
      service: 'qq',
      clientId: '1103991407',
      secret: 'ByiRoD39DiQtYrcG'
    });
    Accounts.loginServiceConfiguration.insert({
      service: 'wechat',
      appId: '123490452',
      secret: 'f69795795d96fe8518a4f0bc14d8bf3b'
    });

  });
}
