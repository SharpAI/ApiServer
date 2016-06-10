
function runStartup(){
	Meteor.runStartupMethods();
}

describe('server', function(){
	
	beforeEach(function () {
		/* 这个describe中的测试代码执行之前执行 */
		MeteorStubs.install();
	});
  
	afterEach(function () {
		/* 这个describe中的测试代码执行之后执行 */
		MeteorStubs.uninstall();
	});
	
		
	describe('the server start', function(){
		it('all function is called', function(){
			spyOn(Meteor, 'methods');
			spyOn(Accounts,'onLogin');
			spyOn(Accounts, 'onCreateUser');
			spyOn(Accounts, 'config');

			Meteor.runStartupMethods();
			expect(Meteor.methods.calls.count()).toEqual(1);
			expect(Accounts.config.calls.argsFor(0)).toEqual([{loginExpirationInDays :null}]);
			expect(Accounts.onLogin.calls.count()).toEqual(1);
			expect(Accounts.onCreateUser.calls.count()).toEqual(1);
		});

		it('call Moments _ensureIndex is three times', function(){
			spyOn(Moments, "_ensureIndex");

			runStartup();
			expect(Moments._ensureIndex.calls.count()).toEqual(3);
		});
		
		it('call Viewers _ensureIndex is three times', function(){
			spyOn(Viewers, "_ensureIndex");
			
			runStartup();
			expect(Viewers._ensureIndex.calls.count()).toEqual(3);
		});
		
		it('call Follower _ensureIndex is three times', function(){
			spyOn(Follower, "_ensureIndex");
			
			runStartup();
			expect(Follower._ensureIndex.calls.count()).toEqual(3);
		});
		
		it('call Follows _ensureIndex is one times', function(){
			spyOn(Follows, "_ensureIndex");
			
			runStartup();
			expect(Follows._ensureIndex.calls.count()).toEqual(1);
		});
		
		it('call TopicPosts _ensureIndex is one times', function(){
			spyOn(TopicPosts, "_ensureIndex");
			
			runStartup();
			expect(TopicPosts._ensureIndex.calls.count()).toEqual(1);
		});
		
		it('call ReComment _ensureIndex is two times', function(){
			spyOn(ReComment, "_ensureIndex");
			
			runStartup();
			expect(ReComment._ensureIndex.calls.count()).toEqual(2);
		});
		
		it('call Meets _ensureIndex is four times', function(){
			spyOn(Meets, "_ensureIndex");
			
			runStartup();
			expect(Meets._ensureIndex.calls.count()).toEqual(4);
		});
		
		it('call Posts _ensureIndex is two times', function(){
			spyOn(Posts, "_ensureIndex");
			
			runStartup();
			expect(Posts._ensureIndex.calls.count()).toEqual(2);
		});
		
		it('call FollowPosts _ensureIndex is one times', function(){
			spyOn(FollowPosts, "_ensureIndex");

			runStartup();
			expect(FollowPosts._ensureIndex.calls.count()).toEqual(1);
		});
		
		it('call SavedDrafts _ensureIndex is one times', function(){
			spyOn(SavedDrafts, "_ensureIndex");

			runStartup();
			expect(SavedDrafts._ensureIndex.calls.count()).toEqual(1);
		});
		
		it('call Feeds _ensureIndex is five times', function(){
			spyOn(Feeds, "_ensureIndex");

			runStartup();
			expect(Feeds._ensureIndex.calls.count()).toEqual(5);
		});
		
		it('call Comment _ensureIndex is one times', function(){
			spyOn(Comment, "_ensureIndex");

			runStartup();
			expect(Comment._ensureIndex.calls.count()).toEqual(1);
		});
		
		it('call Reports _ensureIndex is one times', function(){
			spyOn(Reports, "_ensureIndex");

			runStartup();
			expect(Reports._ensureIndex.calls.count()).toEqual(1);
		});
		
		it('call Messages _ensureIndex is two times', function(){
			spyOn(Messages, "_ensureIndex");

			runStartup();
			expect(Messages._ensureIndex.calls.count()).toEqual(2);
		});
		
		it('call MsgSession _ensureIndex is one times', function(){
			spyOn(MsgSession, "_ensureIndex");

			runStartup();
			expect(MsgSession._ensureIndex.calls.count()).toEqual(1);
		});

		it('call MsgGroup _ensureIndex is one times', function(){
			spyOn(MsgGroup, "_ensureIndex");

			runStartup();
			expect(MsgGroup._ensureIndex.calls.count()).toEqual(1);
		});
		
		it('call PComments _ensureIndex is one times', function(){
			spyOn(PComments, "_ensureIndex");

			runStartup();
			expect(PComments._ensureIndex.calls.count()).toEqual(1);
		});
		
		it('register methods(sixteen) by Meteor.methods', function(){
			spyOn(Meteor, 'methods');
			runStartup();
			
			expect(Meteor.methods.calls.argsFor(0)[0]['sendEmailToAdmin']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['unpublishPosts']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['unpublish']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['readPostReport']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['getS3WritePolicy']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['getBCSSigniture']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['changeMyPassword']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['getAliyunWritePolicy']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['getGeoFromConnection']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['readMessage']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['initReaderPopularPosts']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['pushPostToReaderGroups']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['addAssociatedUser']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['removeAssociatedUser']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['addBlackList']).toBeDefined();
			expect(Meteor.methods.calls.argsFor(0)[0]['refreshAssociatedUserToken']).toBeDefined();
		});
	});
	
	describe('method', function(){
		it('get Random Anonymous Name is 关羽', function(){
			spyOn(RefNames,'findOne').and.returnValue({'text':"关羽"});
			
			var name	= Meteor.startupFunctions['getRandomAnonymousName']();
			expect(name).toEqual("关羽");
		});
		
		it('get Random Anonymous Name is null', function(){
			var name	= Meteor.startupFunctions['getRandomAnonymousName']();
			expect(name).toBeNull;
		});

		xit('Create User', function(){
			var opt	= {
				profile:{
					anonymous: true,
				}
			};
			
			spyOn(Accounts, 'onCreateUser');
			Meteor.executeFunction(Accounts.onCreateUser,function(err,res){
				if(err){
					console.log("err");
					console.log(err);
				}
				console.log("pass");
				console.log(res);
			});
			runStartup();
			
			//var user	= Accounts.onCreateUser();
			//console.log(user);
			//expect(user).toEqual(anonymousUser);
			expect(Accounts.onCreateUser.calls.count()).toEqual(1);
		});		
	});
});
