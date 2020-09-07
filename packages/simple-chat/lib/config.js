AppConfig = {
  path: '/simple-chat',
  get_user_name: function(doc){
    return doc.profile && doc.profile.fullname ? doc.profile.fullname : doc.username
  },
  get_user_icon: function(doc){
    return doc.profile && doc.profile.icon ? doc.profile.icon : '/userPicture.png'
  },
  upload_cordova_image: function(file, callback){}
};