window.updateMyCurrentVersion = function (){
  if (version_of_build){
    Meteor.users.update(Meteor.userId(),{$set:{'profile.currentVersion':version_of_build}});
  }
}
Accounts.onLogin(function(){
  Meteor.setTimeout(function(){
    console.log("Accounts.onLogin will update my own current version")
    window.updateMyCurrentVersion()
  },3000)
});

window.upDateLater = function(){
  $(".newVersion").remove();
}
window.updateAPPVersion = function (title,release,styles,isLatest){
  try{
    $(".newVersion").remove();
  } catch (error){}
  var foot = '';
  if (isLatest) {
    foot += '<div class="nw-btn nw-btn-later" style="'+(styles.laterbtn || '')+'" onclick="upDateLater();">稍后升级</div>';
  }
  foot += '<div class="nw-btn nw-btn-update" style="'+(styles.upbtn || '')+'" onclick="goToUpdate();">立即升级</div>';
  var html = '<div class="newVersion" style="'+(styles.bg || '')+'">'+
            '<div class="nw-box" style="'+(styles.box || '')+'" >'+
                '<div class="nw-box-head" style="'+(styles.head || '')+'">'+title+'</div>'+
                '<div class="nw-box-body" style="'+(styles.body || '')+'">'+release+'</div>'+
                '<div class="nw-box-foot" style="'+(styles.foot || '')+'">'+foot+'</div>'+
            '</div>'+
        '</div>';
  var updateBg = new Image();
  updateBg.onload = function(){
    $('body').append(html);
    $('.newVersion').fadeIn();
  }
  updateBg.onerror = function(){
    console.log('load update background error')
  }
  updateBg.src = styles.bgimg;
};