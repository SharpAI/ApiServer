describe('servermethod', function(){

	beforeEach(function () {
		/* 这个describe中的测试代码执行之前执行 */
		spyOn(Meteor, 'call');// 存根需要监测的函数
	});
  
	afterEach(function () {
		/* 这个describe中的测试代码执行之后执行 */
	});
	
	describe('sendEmailToAdmin', function(){
		it('a simple test', function(){
			var froma	= "xxx@tiegushi.com";
			var subject	= "test";
			var text	= "first test";

			expect(Meteor.call('sendEmailToAdmin',froma,subject,text,function(err,reslt){})).toBeTruthy;
		});
	});

	describe('unpublish', function(){
		it('the args is right', function(){
			var postId	= "xxx@tiegushi.com";
			var userId	= "test";
			var drafts	= "first test";
			var func	= function(err,reslt){};
			
			Meteor.call('unpublish',postId,userId,drafts,func);
			expect(Meteor.call.calls.allArgs()).toEqual([['unpublish',"xxx@tiegushi.com", "test", "first test", func]]);
		});
	});
	
	describe('unpublishPosts', function(){
		it('', function(){
			// add unit test code 
			
		});
	});
	
	describe('readPostReport', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('getS3WritePolicy', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('getBCSSigniture', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('changeMyPassword', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('getAliyunWritePolicy', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('getGeoFromConnection', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('readMessage', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('initReaderPopularPosts', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('pushPostToReaderGroups', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('addAssociatedUser', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('removeAssociatedUser', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('addBlackList', function(){
		it('', function(){
			// add unit test code
		});
	});
	
	describe('refreshAssociatedUserToken', function(){
		it('', function(){
			// add unit test code
		});
	});	
});
