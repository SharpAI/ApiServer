if(Meteor.isCordova){
  if(Package.reload){
    Package.reload = null;
  }
  if ( Package.autoupdate.Autoupdate.clearAutoupdateCache ) {
    Package.autoupdate.Autoupdate.clearAutoupdateCache = function(a){return true;};
  }
  if ( Package.autoupdate.Autoupdate._retrySubscription ) {
    Package.autoupdate.Autoupdate._retrySubscription = function(){return true;};
  }
  if(Package.autoupdate.Autoupdate.newClientAvailable){
    Package.autoupdate.Autoupdate.newClientAvailable = function(){return false;};
  }
}