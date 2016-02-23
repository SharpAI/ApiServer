if (Meteor.isServer) {
  Accounts.registerLoginHandler('weixin', function(options) {
    if (!options.weixin || !options.weixin.openid) {
      return void 0;
    }
    options.weixin.id = options.weixin.openid;
    return Accounts.updateOrCreateUserFromExternalService('weixin', options.weixin, {
      username: options.weixin.nickname,
      createdAt: new Date(),
      profile: {
        fullname: options.weixin.nickname,
        icon: options.weixin.headimgurl,
        sex: options.weixin.sex === 1 ? 'male' : options.weixin.sex === 2 ? 'female' : void 0,
        location: options.weixin.city
      }
    });
  });
}