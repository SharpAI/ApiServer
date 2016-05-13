describe('servermethod', function(){
	
	beforeEach(function () {
		/* 这个describe中的测试代码执行之前执行 */
		spyOn(Meteor, 'call');// 存根需要跟踪的函数
	});
  
	afterEach(function () {
		/* 这个describe中的测试代码执行之后执行 */
	});
		
	describe('sendEmailToAdmin', function(){
		it('is executed', function(){
			var froma	= "xxx@tiegushi.com";
			var subject	= "test";
			var text	= "first test";

			spyOn(Email, 'send');
			Meteor.call('sendEmailToAdmin', froma, subject, text, function(err,reslt){});
			expect(Email.send.calls.count()).toEqual(0);
		});
	});

	describe('unpublish', function(){
		it('the fundction is executed', function(){
			var postId	= "8888";
			var userId	= "123";
			var drafts	= "first test";
			var func	= function(err,reslt){};
			
			spyOn(Posts, 'update');
			spyOn(SavedDrafts, 'insert');
			spyOn(FollowPosts, 'update');
			spyOn(FavouritePosts, 'remove');
			Meteor.call('unpublish',postId,userId,drafts,func);
			expect(Posts.update.calls.count()).toEqual(0);
			expect(SavedDrafts.insert.calls.count()).toEqual(0);
			expect(FollowPosts.update.calls.count()).toEqual(0);
			expect(FavouritePosts.remove.calls.count()).toEqual(0);			
		});
	});

	describe('unpublishPosts', function(){
		it('test passed', function(){
			var postId	= "8888";
			var userId	= "123";
			var drafts	= "first test";
			var res		= 1;
			var func	= function(err,reslt){return err};
			
			res	= Meteor.call('unpublishPosts',postId,userId,drafts,func);
			expect(res).toBeNull;
		});
	});
	
	describe('readPostReport', function(){
		it('no code', function(){
			// add unit test code
			
		});
	});
	
	describe('getS3WritePolicy', function(){
		it('test returnValue', function(){
			// add unit test code
			var filename	= "file";
			var URI			= "/url";
			var res;			
			
			res	= Meteor.call('getS3WritePolicy',filename,URI,function(err,res){throw  res;});
			expect(res).not.toBeNull;
		});
	});
	
	describe('getBCSSigniture', function(){
		it('test returnValue', function(){
			// add unit test code
			var filename	= "file";
			var URI			= "/url";
			var res;			
			
			res	= Meteor.call('getBCSSigniture',filename,URI,function(err,res){throw  res;});
			expect(res).not.toBeNull;

		});
	});
	
	describe('changeMyPassword', function(){
		it('use setPassword', function(){
			// add unit test code
			spyOn(Accounts, 'setPassword');
			Meteor.call('changeMyPassword',"123");
			expect(Accounts.setPassword.calls.any()).toBeTruthy;
		});
	});
	
	describe('getAliyunWritePolicy', function(){
		it('return value', function(){
			// add unit test code
			var filename	= "file";
			var URI			= "/url";
			var res;			
			
			res	= Meteor.call('getAliyunWritePolicy',filename,URI,function(err,res){throw  res;});
			expect(res).not.toBeNull;
		});
	});
	
	describe('getGeoFromConnection', function(){
		it('return clientIp', function(){
			// add unit test code
		});
	});
	
	describe('readMessage', function(){
		it('use function', function(){
			// add unit test code
			var toBeNull={type:"user"}
			
			spyOn(MsgSession, 'update');
			spyOn(Messages, 'update');
			Meteor.call('readMessage',"123");
			expect(MsgSession.update.calls.any()).toBeTruthy;
			expect(Messages.update.calls.any()).toBeTruthy;
		});
	});
	
	describe('initReaderPopularPosts', function(){
		it('call function and return value', function(){
			// add unit test code
			var res	= false;
			
			spyOn(ReaderPopularPosts, 'find');
			spyOn(ReaderPopularPosts, 'remove');
			spyOn(Viewers, 'find');
			spyOn(Posts, 'find');
			spyOn(ReaderPopularPosts, 'insert');
			
			res	= Meteor.call('initReaderPopularPosts',function(err,res){return res;});
			expect(ReaderPopularPosts.find.calls.any()).toBeTruthy;
			expect(ReaderPopularPosts.remove.calls.any()).toBeTruthy;
			expect(Viewers.find.calls.any()).toBeTruthy;
			expect(Posts.find.calls.any()).toBeTruthy;
			expect(ReaderPopularPosts.insert.calls.any()).toBeTruthy;
			expect(res).toBeTruthy;
		});
	});
	
	describe('pushPostToReaderGroups', function(){
		it('call function', function(){
			// add unit test code
			var feed,grups;
			spyOn(Viewers, 'find');

			Meteor.call('pushPostToReaderGroups',feed,grups,function(err,res){});
			expect(Viewers.find.calls.any()).toBeTruthy;
		});
	});
	
	describe('addAssociatedUser', function(){
		it('no test code', function(){
			// add unit test code
		});
	});
	
	describe('removeAssociatedUser', function(){
		it('call AssociatedUsers.remove', function(){
			// add unit test code
			var userId;
			spyOn(AssociatedUsers, 'remove');
			
			Meteor.call('refreshAssociatedUserToken',userId,function(err,res){});
			expect(AssociatedUsers.remove.calls.any()).toBeTruthy;
		});
	});
	
	describe('addBlackList', function(){
		it('call AssociatedUsers.find', function(){
			// add unit test code
			var blacker, blackBy;
			spyOn(BlackList, 'insert');
			
			Meteor.call('addBlackList',blacker, blackBy,function(err,res){});
			expect(BlackList.insert.calls.any()).toBeTruthy;
		});
	});
	
	describe('refreshAssociatedUserToken', function(){
		it('call AssociatedUsers.find', function(){
			// add unit test code
			spyOn(AssociatedUsers, 'find');
			
			Meteor.call('refreshAssociatedUserToken',"123",function(err,res){});
			expect(AssociatedUsers.find.calls.any()).toBeTruthy;
		});
	});	
});
