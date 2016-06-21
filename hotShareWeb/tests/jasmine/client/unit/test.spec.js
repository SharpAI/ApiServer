(function () {
  describe('test', function(){
	function helper(name) {
	  //return Meteor.method.firstCall.args[0][name];
	}
	
	beforeEach(function(){
	  //Meteor.startup();
	});
	
	it('test',function(){
		expect(true).toEqual(true);
	});
	
	xit('tt', function(){
		var postId	= "8888";
		var userId	= "123";
		var drafts	= "first test";
		var res		= 1;
		var func	= function(err,res){if(err){ 
												console.log("服务端异常");
												console.log(err);
												return;
										}
										//服务端函数的返回值将被第二个参数接受，也就是result
										console.log(res);
								};
			
		Meteor.call('sendEmailToAdmin', 'test@123.com', 'subject', 'test', func);
	  expect(Meteor.call.calledOnce).toBeTruthy();
	  //expect(Meteor.user.calledOnce).toBeTruthy();
	});
  });

})();
