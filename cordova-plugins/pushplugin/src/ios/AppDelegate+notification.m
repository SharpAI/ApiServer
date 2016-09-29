//
//  AppDelegate+notification.m
//  pushtest
//
//  Created by Robert Easterday on 10/26/12.
//
//

#import "MainViewController.h"
#import "AppDelegate+notification.h"
#import "PushPlugin.h"
#import <objc/runtime.h>

static char launchNotificationKey;

@implementation AppDelegate (notification)

- (id) getCommandInstance:(NSString*)className
{
	return [self.viewController getCommandInstance:className];
}

// its dangerous to override a method from within a category.
// Instead we will use method swizzling. we set this up in the load call.
+ (void)load
{
    Method original, swizzled;
    
    original = class_getInstanceMethod(self, @selector(init));
    swizzled = class_getInstanceMethod(self, @selector(swizzled_init));
    method_exchangeImplementations(original, swizzled);
}

- (AppDelegate *)swizzled_init
{
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(createNotificationChecker:)
               name:@"UIApplicationDidFinishLaunchingNotification" object:nil];
	
	// This actually calls the original init method over in AppDelegate. Equivilent to calling super
	// on an overrided method, this is not recursive, although it appears that way. neat huh?
	return [self swizzled_init];
}

// This code will be called immediately after application:didFinishLaunchingWithOptions:. We need
// to process notifications in cold-start situations
- (void)createNotificationChecker:(NSNotification *)notification
{
	if (notification)
	{
		NSDictionary *launchOptions = [notification userInfo];
		if (launchOptions)
			self.launchNotification = [launchOptions objectForKey: @"UIApplicationLaunchOptionsRemoteNotificationKey"];
	}
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    PushPlugin *pushHandler = [self getCommandInstance:@"PushPlugin"];
    [pushHandler didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    PushPlugin *pushHandler = [self getCommandInstance:@"PushPlugin"];
    [pushHandler didFailToRegisterForRemoteNotificationsWithError:error];
}

/**
 * This is main kick off after the app inits, the views and Settings are setup here. (preferred - iOS4 and up)
 */
- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    
    NSLog(@"launchOptions:%@",launchOptions);
    if (launchOptions) {
        NSDictionary *userInfo = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
        [self checkServerurlInUserInfo:userInfo];
    }
    CGRect screenBounds = [[UIScreen mainScreen] bounds];
    
#if __has_feature(objc_arc)
    self.window = [[UIWindow alloc] initWithFrame:screenBounds];
#else
    self.window = [[[UIWindow alloc] initWithFrame:screenBounds] autorelease];
#endif
    self.window.autoresizesSubviews = YES;
    
    [self  getServerURLFromLocalDataBase];
    
#if __has_feature(objc_arc)
    self.viewController = [[MainViewController alloc] init];
#else
    self.viewController = [[[MainViewController alloc] init] autorelease];
#endif
    
    // Set your app's start page by setting the <content src='foo.html' /> tag in config.xml.
    // If necessary, uncomment the line below to override it.
    // self.viewController.startPage = @"index.html";
    
    // NOTE: To customize the view's frame size (which defaults to full screen), override
    // [self.viewController viewWillAppear:] in your view controller.

    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];
    
    return YES;
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
    NSLog(@"didReceiveNotification");
    [self checkServerurlInUserInfo:userInfo];
    
    // Get application state for iOS4.x+ devices, otherwise assume active
    UIApplicationState appState = UIApplicationStateActive;
    if ([application respondsToSelector:@selector(applicationState)]) {
        appState = application.applicationState;
    }
    
    if (appState == UIApplicationStateActive) {
        PushPlugin *pushHandler = [self getCommandInstance:@"PushPlugin"];
        pushHandler.notificationMessage = userInfo;
        pushHandler.isInline = YES;
        [pushHandler notificationReceived];
    } else {
        //save it for later
        self.launchNotification = userInfo;
    }
}

-(void)checkServerurlInUserInfo:(NSDictionary *)notificationMessage{
    id thisObject = [[notificationMessage objectForKey:@"aps"] objectForKey:@"alert"];
    NSString *message;
    if ([thisObject isKindOfClass:[NSDictionary class]]){
        //server_url = thisObject;
    }
    else if ([thisObject isKindOfClass:[NSString class]]){
        message = thisObject;
    }
    if ([message rangeOfString:@"http://"].length != NSNotFound||[message rangeOfString:@"https://"].length != NSNotFound) {
        NSArray *array = [message componentsSeparatedByString:@"'"];
        NSString *server_url = array[1];
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        
        [defaults setObject:server_url forKey:@"server-url"];
        
        [defaults synchronize];
        [self getServerURLFromLocalDataBase];
        [self.viewController.webView reload];
    }
}


-(void)getServerURLFromLocalDataBase{
    
    NSString  *path = NSHomeDirectory();
    NSLog(@"path:%@",path);
    
    NSError *error = nil;
    NSArray  *paths  =  NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask,YES);
    NSString *docDir = [paths objectAtIndex:0];
    NSLog(@"docDir:%@",docDir);
    if(!docDir) {
        NSLog(@"Documents 目录未找到");
        docDir= [NSHomeDirectory() stringByAppendingPathComponent:@"Documents"];
    }
    
    // File we want to create in the documents directory我们想要创建的文件将会出现在文件目录中
    // Result is: /Documents/file1.txt结果为：/Documents/file1.txt
    NSString *filePath= [docDir
                         stringByAppendingPathComponent:@"remote_server.js"];
    
    NSString *server_url = [[NSUserDefaults standardUserDefaults] objectForKey:@"server-url"];
    //需要写入的字符串
    NSString *jsStr = @"";
    if (server_url&&server_url.length) {
        jsStr = [NSString stringWithFormat:@"__meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = '%@';",server_url];
    }
    //写入文件
    [jsStr writeToFile:filePath atomically:YES encoding:NSUTF8StringEncoding error:&error];
    //显示文件目录的内容
    NSLog(@"filePath:%@",filePath);
    NSString *value = [[NSString alloc] initWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:&error];
    NSLog(@"value == %@",value);
}


- (void)applicationDidBecomeActive:(UIApplication *)application {
    
    NSLog(@"active");
    
    //zero badge
    application.applicationIconBadgeNumber = 0;

    if (self.launchNotification) {
        PushPlugin *pushHandler = [self getCommandInstance:@"PushPlugin"];
		
        pushHandler.notificationMessage = self.launchNotification;
        self.launchNotification = nil;
        [pushHandler performSelectorOnMainThread:@selector(notificationReceived) withObject:pushHandler waitUntilDone:NO];
    }
}

// The accessors use an Associative Reference since you can't define a iVar in a category
// http://developer.apple.com/library/ios/#documentation/cocoa/conceptual/objectivec/Chapters/ocAssociativeReferences.html
- (NSMutableArray *)launchNotification
{
   return objc_getAssociatedObject(self, &launchNotificationKey);
}

- (void)setLaunchNotification:(NSDictionary *)aDictionary
{
    objc_setAssociatedObject(self, &launchNotificationKey, aDictionary, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)dealloc
{
    self.launchNotification	= nil; // clear the association and release the object
}

@end
