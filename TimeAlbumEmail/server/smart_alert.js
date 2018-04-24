AlertLimit = new Mongo.Collection("alertlimit");

// Don't allow TTL less than 2 minutes so we don't break synchronization
var expiresAfterSeconds = 2*60;

AlertLimit._ensureIndex({group_id: 1, type: 1}, { expireAfterSeconds: expiresAfterSeconds });
AlertLimit._ensureIndex({createdAt: 1 }, { expireAfterSeconds: expiresAfterSeconds });

checkIfSendEvent = function(groupd_id,type){
  if(AlertLimit.findOne({group_id: groupd_id, type: type})){
    console.log(AlertLimit.findOne({group_id: groupd_id, type: type}))
    return false;
  } else {
    AlertLimit.insert({group_id: groupd_id, type: type,createdAt: new Date()})
    return true
  }
}
