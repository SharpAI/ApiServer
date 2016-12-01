function taskObj() {
  var task = new Object();
  var tasks = [];
  var collections = {};
  var debug = false;
  
  task.add = function(id, userId, url){
    var index = task.getIndex(id);
    if(index === -1){
      debug && console.log('add task: ' + id);
      tasks.push({
        id: id,
        userId: userId,
        url: url,
        startTime: new Date(),
        status: 'wait'
      });
    }else if (userId && url){
      tasks[index].userId = userId,
      tasks[index].url = url
    }
    task.removeOld();
  };
  
  task.removeOld = function(){
    if(tasks.length<=0)
      return;
      
    for(var i=0;i<tasks.length;i++){
      // remove 10 分钟前的
      if((new Date()) - tasks[i].startTime >= 1000*60*10)
        tasks.splice(i, 1);
    }
  };
  
  task.getIndex = function(id){
    if(!id)
      return -1;
    if(tasks.length <= 0)
      return -1;
    
    for(var i=0;i<tasks.length;i++){
      if(tasks[i].id === id)
        return i;
    }   
    
    return -1;
  };
  
  task.get = function(id){
    var index = task.getIndex(id);
    if(index === -1)
      return null;
      
    return tasks[index];
  };
  
  task.update = function(id, status, postId){
    debug && console.log('update status: ' + status);
    debug && console.log('update postId: ' + postId);
    
    debug && console.log('task: ' + id);
    
    var index = task.getIndex(id);
    if(index === -1)
      return;
      
    if(postId){
      debug && console.log('update postId: ' + postId);
      tasks[index].postId = postId;
    }
    
    if(status === 'done' || status === 'cancel' || status === 'failed'){
      tasks[index].endTime = new Date();
      tasks[index].execTime = (tasks[index].endTime - tasks[index].startTime)/1000;
      
      // save piwik
      collections.serverImportLog.update({taskId: tasks[index].id}, {$set: {
        taskId: tasks[index].id,
        userId: tasks[index].userId,
        importUrl: tasks[index].url,
        startTime: tasks[index].startTime,
        endTime: tasks[index].endTime,
        execTime: tasks[index].execTime,
        error: tasks[index].error,
        status: status
      }}, {upsert: true});
    }
      
    if(task.isCancel(id))
      return;

    tasks[index].status = status;
    console.log('update status: ' + status);
  };
  
  task.failed = function(id, msg){
    var index = task.getIndex(id);
    if(index === -1)
      return;
      
    tasks[index].error = msg;
    task.update(id, 'failed');
  };
  
  task.cancel = function(id){
    debug && console.log('cancel import task: ' + id);
    debug && console.log('=========================');
    debug && console.log(tasks);
    debug && console.log('=========================');
    
    var index = task.getIndex(id);
    if(index === -1)
      return;

    // update status  
    task.update(id, 'cancel');
    
    // remove post
    debug && console.log('remove post.');
    console.log('cancel: tasks[index]='+JSON.stringify(tasks[index]));
    if(tasks[index].postId){
      task.removePost(index);
      // tasks.splice(index, 1);
    }else{
      // tasks.splice(index, 1);
    }
  };
  
  task.setCollection = function(params){
    for (var key in params){
      collections[key] = params[key];
      console.log('set collections: ' + key);
    }
  };
  
  task.isCancel = function(id, remove){
    var index = task.getIndex(id);
    if(index === -1)
      return false;
    
    //console.log('isCancel: remove='+remove+', tasks[index]='+JSON.stringify(tasks[index]));
    if(remove === true && tasks[index].status === 'cancel')
      task.removePost(index);
    
    return tasks[index].status === 'cancel';
  }
  
  task.removePost = function(index){
    console.log('removePost: tasks[index]='+JSON.stringify(tasks[index]));
    if(tasks[index].postId){
      console.log('remove import post suc. postId='+tasks[index].postId);
      collections.posts.remove({_id: tasks[index].postId});
      collections.followPosts.remove({postId: tasks[index].postId});
      collections.TopicPosts.remove({postId: tasks[index].postId})
      collections.FavouritePosts.remove({postId: tasks[index].postId})
    } else {
      console.log('remove import post failed.');
    }
  };
  
  return task;
}

var tasks = new taskObj();
module.exports = {
  Tasks: tasks
};