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
#import "ViewController.h"
@interface ShareViewController ()
{  
    NSString  *userId;  
    NSString *imagePath;
    NSString *entensionTitle;
    
}
@property (copy, nonatomic)NSString *entensionURL;
@property (strong, nonatomic) ViewController *myView;
@property (strong, nonatomic)NSUserDefaults *mySharedDefults;
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

//Setter method
- (IBAction)cancel:(UIBarButtonItem *)sender {
    
    if ([self.webView isLoading]) {
        
        [self.webView stopLoading];
    }
    
    [self.extensionContext completeRequestReturningItems:nil completionHandler:nil];
    
}

- (IBAction)share:(UIBarButtonItem *)sender {
    //sender.tintColor = [UIColor grayColor];
    
    //[self.backGroundView removeFromSuperview];
    if (_entensionURL) {
        
        sender.enabled = false;
        
        [self performSelector:@selector(returnToJavaScriptFunction) withObject:nil afterDelay:3.0];
        
        self.myView = [[ViewController alloc] init];
        
        self.myView.returnPostBlock = ^(NSString *res){
            
            ShareViewController *shareView = [ShareViewController getShareVaribleHandle];
            
            [shareView.mySharedDefults setObject:shareView.entensionURL forKey:@"shareUrl"];
            
            [shareView.mySharedDefults synchronize];
            
            //[shareView.myView dismissViewControllerAnimated:YES completion:nil];
            
            [shareView.extensionContext completeRequestReturningItems:nil completionHandler:nil];
        };
        
        [self presentViewController:self.myView animated:NO completion:nil];
    }
    
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
        
        responder.myView.isFinish = YES;
        
    }
    else{
        responder.myView.isFinish = NO;
    }
    
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark View lifecycle

- (void)viewWillAppear:(BOOL)animated
{
    // View defaults to full size.  If you want to customize the view's size, or its subviews (e.g. webView),
    // you can do so here.
    [super viewWillAppear:animated];
    
    if (userId && ![userId isEqualToString:@""] && [NetWork isEnable])
    {
        
        self.view.backgroundColor = [UIColor colorWithWhite:0.0 alpha:0.3];
        
        for (NSLayoutConstraint *constraint in self.textView.superview.constraints) {
            if (constraint.secondItem == self.textView && constraint.firstAttribute == NSLayoutAttributeTrailing) {
                constraint.constant = 5;
            }
        }
        
        //[self.backGroundView removeFromSuperview];
        [self replacePickerContainerViewConstraintWithConstant:self.view.frame.size.height/2+self.backGroundView.frame.size.height/2];
        
        self.backGroundView.alpha = 0;
        
    }
    
}

-(void)viewDidAppear:(BOOL)animated{
    
    [super viewDidAppear:animated];
    
    if (userId && ![userId isEqualToString:@""] && [NetWork isEnable]) {
    
        CGRect bounds = self.backGroundView.bounds;
        
        [self replacePickerContainerViewConstraintWithConstant:0];
        
        [UIView animateWithDuration:1 animations:^{
            
            //self.backGroundView.center= self.view.center;
            self.backGroundView.bounds = bounds;
            [self.backGroundView layoutIfNeeded];
            self.backGroundView.alpha = 1;
        }];
        
    }


}

- (void)replacePickerContainerViewConstraintWithConstant:(CGFloat)constant
{
    for (NSLayoutConstraint *constraint in self.backGroundView.superview.constraints) {
        if (constraint.firstItem == self.backGroundView && constraint.firstAttribute == NSLayoutAttributeCenterY) {
            constraint.constant = constant;
        }
    }
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    [self.webView removeFromSuperview];
    //数据共享
    if (!_mySharedDefults) {
        
        _mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
    }
    
    userId = [_mySharedDefults objectForKey:@"userId"];
    
    if (!userId || [userId isEqualToString:@""]) {
        
        self.view.backgroundColor = [UIColor clearColor];
       
        self.backGroundView.alpha = 0;

        //提示框
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"故事贴" message:@"抱歉，请先打开故事贴，并登录，才可以使用分享功能。" preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            if ([self.webView isLoading]) {
                
                [self.webView stopLoading];
            }
            
            [self.extensionContext completeRequestReturningItems:nil completionHandler:nil];
            
        }];
        
        [alertController addAction:okAction];
        
        [self presentViewController:alertController animated:YES completion:nil];

    }
    else{
        
        [self checkNetWork];
        
        //[self.webView setFrame:CGRectMake(self.webView.bounds.origin.x,self.webView.bounds.origin.y + 20,self.webView.bounds.size.width,self.webView.bounds.size.height - 20)];
        
    }
    
}

-(void)checkNetWork{
    
    if ([NetWork isEnable]) {
        
        [self fetchItemDataAtBackground];
        [ShareViewController setShareVaribleHandle:self];
    }
    else{
        
        self.view.backgroundColor = [UIColor clearColor];
        
        self.backGroundView.alpha = 0;
        
        //提示框
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"故事贴" message:@"网络连接异常，请检查网络连接是否可用" preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            if ([self.webView isLoading]) {
                
                [self.webView stopLoading];
            }
            
            [self.extensionContext completeRequestReturningItems:nil completionHandler:nil];
            
        }];
        
        [alertController addAction:okAction];
        
        [self presentViewController:alertController animated:YES completion:nil];
    }
}


-(void)fetchItemDataAtBackground{
    
    //后台获取
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSArray *inputItems = self.extensionContext.inputItems;
        NSExtensionItem *item = inputItems.firstObject;//无论多少数据，实际上只有一个 NSExtensionItem 对象
        for (NSItemProvider *provider in item.attachments) {
            //completionHandler 是异步运行的
            NSString *dataType = provider.registeredTypeIdentifiers.firstObject;//实际上一个NSItemProvider里也只有一种数据类型
            if ([dataType isEqualToString:@"public.image"]) {
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(UIImage *image, NSError *error){
                    //collect image...
                    
                }];
            }else if ([dataType isEqualToString:@"public.plain-text"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSString *contentText, NSError *error){
                    //collect image...
                    
                }];
            }else if ([dataType isEqualToString:@"public.url"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSURL *url, NSError *error){
                    //collect url...
                    if (error) {
                        NSLog(@"ERROR: %@", error);
                    }
                    
                    _entensionURL = [url absoluteString];
                    
                    NSLog(@"entensionURL:%@", _entensionURL);
                    
                    dispatch_async(dispatch_get_main_queue(), ^{
                        
                        self.textView.text = _entensionURL;
                        
                        self.postButton.enabled = YES;
                            
                        [self.postButton setTintColor:[UIColor colorWithRed:30/255.0 green:144/255.0  blue:255/255.0 alpha:1]];
                        
                    });
                    
                }];
            }else if ([dataType isEqualToString:@"com.apple.property-list"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(id<NSSecureCoding> item, NSError *error){
                    //collect url...
                    if (error) {
                        NSLog(@"ERROR: %@", error);
                    }
                    NSDictionary *results = (NSDictionary *)item;
                    
                    imagePath = [[results objectForKey: NSExtensionJavaScriptPreprocessingResultsKey ] objectForKey:@"imagePath"];
                    
                    _entensionURL = [[results objectForKey: NSExtensionJavaScriptPreprocessingResultsKey ] objectForKey:@"baseURI"];
                    
                    entensionTitle = [[results objectForKey: NSExtensionJavaScriptPreprocessingResultsKey ] objectForKey:@"title"];
                    
                    dispatch_async(dispatch_get_main_queue(), ^{
                        
                        self.textView.text = entensionTitle;
                        
                    });
                    
                    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                        
                        // 多线程中下载图像
                        NSData * imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:imagePath]];
                        
                        // 回到主线程完成UI设置
                        dispatch_async(dispatch_get_main_queue(), ^{
                            
                            for (NSLayoutConstraint *constraint in self.textView.superview.constraints) {
                                if (constraint.secondItem == self.textView && constraint.firstAttribute == NSLayoutAttributeTrailing) {
                                    constraint.constant = 90;
                                }
                            }
                            UIImage * image = [UIImage imageWithData:imageData];
                            self.ImageView.image = image;
                            
                            self.postButton.enabled = YES;
                            
                            [self.postButton setTintColor:[UIColor colorWithRed:30/255.0 green:144/255.0  blue:255/255.0 alpha:1]];
                            
                        });
                        
                    });
                    
                    
                }];
            }else
                NSLog(@"don't support data type: %@", dataType);
        }
    });
    
}


-(void) returnToJavaScriptFunction
{
    NSString *scriptCall = [NSString stringWithFormat:@"getShareData('%@','%@','%@','%@')",userId,_entensionURL,entensionTitle,imagePath];
    
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

