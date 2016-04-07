//
//  ShareViewController.m
//  shareTest
//
//  Created by Lokesh Patel on 27/10/15.
//
//

#import "ShareViewController.h"

#import <MobileCoreServices/UTCoreTypes.h>
#import <Cordova/CDVViewController.h>
#import "NetWork.h"
#import "MBProgressHUD.h"
@interface ShareViewController ()
{
    NSUserDefaults *mySharedDefults;
    
    NSString  *userId;
}

@end

static ShareViewController* shareVaribleHandle =nil;
@implementation ShareViewController

- (id)initWithNibName:(NSString*)nibNameOrNil bundle:(NSBundle*)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Uncomment to override the CDVCommandDelegateImpl used
        // _commandDelegate = [[MainCommandDelegate alloc] initWithViewController:self];
        // Uncomment to override the CDVCommandQueue used
        // _commandQueue = [[MainCommandQueue alloc] initWithViewController:self];
    }
    return self;
}

- (id)init
{
    self = [super init];
    if (self) {
        // Uncomment to override the CDVCommandDelegateImpl used
        // _commandDelegate = [[MainCommandDelegate alloc] initWithViewController:self];
        // Uncomment to override the CDVCommandQueue used
        // _commandQueue = [[MainCommandQueue alloc] initWithViewController:self];
    }
    return self;
}


-(void)doSomeWorkWithProgress{
     self.isFinish = NO;
    // This just increases the progress indicator in a loop.
    float progress = 0.0f;
    while (progress < 0.8f) {
        if (self.isFinish) break;
        if (![NetWork isEnable]) {
            
            break;
        }
        progress += 0.01f;
        dispatch_async(dispatch_get_main_queue(), ^{
            // Instead we could have also passed a reference to the HUD
            // to the HUD to myProgressTask as a method parameter.
            [MBProgressHUD HUDForView:self.view].progress = progress;
        });
        usleep(50000);
    }
    
    while (progress < 1.0f) {
        if (![NetWork isEnable]) {
            
            break;
        }
        progress += 0.01f;
        dispatch_async(dispatch_get_main_queue(), ^{
            // Instead we could have also passed a reference to the HUD
            // to the HUD to myProgressTask as a method parameter.
            [MBProgressHUD HUDForView:self.view].progress = progress;
        });
        usleep(5000);
    }

}

-(void)sendFinish{
    
    [[MBProgressHUD HUDForView:self.view] removeFromSuperview];
    
    NSString *title;
    
    NSString *message;
    
    if ([NetWork isEnable]) {
        
       title = @"分享成功";
       message= @"可打开故事贴查看";
        
       [mySharedDefults setObject:self.entensionUrl forKey:@"shareUrl"];
        
       [mySharedDefults synchronize];
    
        
    }
    else{
        
        title = @"分享失败";
        message= @"请检查网络连接是否可用";
    }
    
    
    //提示框
    UIAlertController *alertController = [UIAlertController alertControllerWithTitle:title message:message preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        
        if ([self.webView isLoading]) {
            
            [self.webView stopLoading];
        }
        
        self.returnPostBlock(nil);
        
    }];
    
    [alertController addAction:okAction];
    
    [self presentViewController:alertController animated:YES completion:nil];
}


-(void)loadError{
    
    [self.view removeFromSuperview];
    
    UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"连接超时" message:@"请查看网络链接是否正常" preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        
        if ([self.webView isLoading]) {
            
            [self.webView stopLoading];
        }
       
        
        [self.extensionContext completeRequestReturningItems:nil completionHandler:nil];
        
    }];
    
    [alertController addAction:okAction];
    
    [self presentViewController:alertController animated:YES completion:nil];
}

+ (void) setShareVaribleHandle:(ShareViewController *)responder{
    shareVaribleHandle = responder;
}

//Getter method
+ (ShareViewController*) getShareVaribleHandle {
    return shareVaribleHandle;
}

+ (void) shareResult:(NSString *)error Handle:(ShareViewController *)responder
{
    if(!error || [error isEqualToString:@""]){
        
        responder.isFinish = YES;
        
    }
    else{
        
        //提示框
        
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"分享失败" message:error preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            if ([responder.webView isLoading]) {
                
                [responder.webView stopLoading];
            }
            responder.returnPostBlock(nil);
            
        }];
        
        [alertController addAction:okAction];
        
        [responder presentViewController:alertController animated:YES completion:nil];
        
    }
    
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark View lifecycle


- (void)viewDidLoad
{
    [super viewDidLoad];
    
    [self.webView removeFromSuperview];
    //数据共享
    if (!mySharedDefults) {
        
        mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
    }
    
    userId = [mySharedDefults objectForKey:@"userId"];
    
    [self checkNetWork];
    
    [self performSelector:@selector(returnToJavaScriptFunction) withObject:nil afterDelay:3.0];
    
}

-(void)checkNetWork{
    
    if ([NetWork isEnable]) {
        
        [self createView];
        [ShareViewController setShareVaribleHandle:self];
    }
    else{
        
        //提示框
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"故事贴" message:@"网络连接异常，请检查网络连接是否可用" preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            if ([self.webView isLoading]) {
                
                [self.webView stopLoading];
            }
            
            self.returnPostBlock(nil);
            
        }];
        
        [alertController addAction:okAction];
        
        [self presentViewController:alertController animated:YES completion:nil];
    }
}

-(void)createView{
    
    self.view.backgroundColor = [UIColor colorWithWhite:0.0 alpha:0.3];
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    
    //hud.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    
    hud.bezelView.backgroundColor = [UIColor whiteColor];
    
    hud.contentColor = [UIColor colorWithRed:30/255.0 green:144/255.0  blue:255/255.0 alpha:1];
    
    // Set the bar determinate mode to show task progress.
    hud.mode = MBProgressHUDModeDeterminateHorizontalBar;
    hud.label.text = NSLocalizedString(@" 发送中...", @"HUD loading title");
    
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        // Do something useful in the background and update the HUD periodically.
        [self doSomeWorkWithProgress];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            
            [self sendFinish];
            
        });
    });
    
}


-(void) returnToJavaScriptFunction
{
    NSString *scriptCall = [NSString stringWithFormat:@"getShareData('%@','%@','%@')",userId,self.entensionUrl,self.contentText];
    [self.webView stringByEvaluatingJavaScriptFromString:scriptCall];
    
}


- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return [super shouldAutorotateToInterfaceOrientation:interfaceOrientation];
}

/* Comment out the block below to over-ride */

/*
 - (UIWebView*) newCordovaViewWithFrame:(CGRect)bounds
 {
 return[super newCordovaViewWithFrame:bounds];
 }
 */

#pragma mark UIWebDelegate implementation

- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    NSLog(@"webViewDidFinishLoad!!!");
    
    return [super webViewDidFinishLoad:theWebView];
   
}

/* Comment out the block below to over-ride */
 
 - (void) webViewDidStartLoad:(UIWebView*)theWebView
 {
    return [super webViewDidStartLoad:theWebView];
 }
 
 - (void) webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error
 {
     
     [self loadError];
     
     return [super webView:theWebView didFailLoadWithError:error];
     
 }
 
 /*- (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
 {
 return [super webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
 }
 */

@end

@implementation ShareViewCommandDelegate

/* To override the methods, uncomment the line in the init function(s)
 in MainViewController.m
 */

#pragma mark CDVCommandDelegate implementation

- (id)getCommandInstance:(NSString*)className
{
    return [super getCommandInstance:className];
}

- (NSString*)pathForResource:(NSString*)resourcepath
{
    return [super pathForResource:resourcepath];
}

@end

@implementation ShareViewCommandQueue

/* To override, uncomment the line in the init function(s)
 in MainViewController.m
 */
- (BOOL)execute:(CDVInvokedUrlCommand*)command
{
    return [super execute:command];
}

@end

