function taskObj() {
  var task = new Object();
  var tasks = [];
  var collections = {};
  
  task.add = function(id, userId, url){
    console.log('add task: ' + id);
    tasks.push({
      id: id,
      userId: userId,
      url: url,
      startTime: new Date(),
      status: 'wait'
    });
    task.removeOld();
  };
  
  task.removeOld = function(){
    if(tasks.length<=0)
      return;
      
    for(var i=0;i<tasks.length;i++){
      // remove 6 分钟前的
      if((new Date()) - tasks[i].startTime >= 1000*60*5)
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
    var index = task.getIndex(id);
    if(index === -1)
      return;
      
    if(task.isCancel(id))
      return;
      
    console.log('update status: ' + status);
    tasks[index].status = status;
    if(postId)
      tasks[index].postId = postId;
    if(status === 'done'){
      tasks[index].endTime = new Date();
      tasks[index].execTime = (tasks[index].endTime - tasks[index].startTime)/1000 + 's';
      
      // save piwik
      // TODO:
      
      tasks.splice(index, 1);
    }
  };
  
  task.cancel = function(id){
    console.log('cancel import task: ' + id);
    console.log('=========================');
    console.log(tasks);
    console.log('=========================');
    
    var index = task.getIndex(id);
    if(index === -1)
      return;
    
    // update status  
    task.update(id, 'cancel');
    
    // remove post
    console.log('remove post.');
    if(tasks[index].postId){
      console.log('remove import post.');
      collections.posts.remove({_id: tasks[index].postId});
      tasks.splice(index, 1);
    }else{
      tasks.splice(index, 1);
    }
  };
  
  task.setCollection = function(params){
    for (var key in params)
      collections[key] = params[key];
  };
  
  task.isCancel = function(id){
    var index = task.getIndex(id);
    if(index === -1)
      return false;
    
    return tasks[index].status === 'cancel';
  }
  
  return task;
}

var tasks = new taskObj();
module.exports = {
  Tasks: tasks
};