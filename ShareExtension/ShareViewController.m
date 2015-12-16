//
//  ShareViewController.m
//  ShareExtension
//
//  Created by aei on 12/9/15.
//
//

#import "ShareViewController.h"

#import "AppDelegate.h"

@interface ShareViewController ()

{
    UIWebView *webView;
}

@end

@implementation ShareViewController



static NSInteger const maxCharactersAllowed = 140;  //手动设置字符数上限


-(void)viewDidLoad{
    
    [super viewDidLoad];
    
     webView = [[UIWebView alloc] initWithFrame:CGRectZero];
    
    [self.view addSubview:webView];
}


#pragma mark-检查输入内容
- (BOOL)isContentValid {
    // Do validation of contentText and/or NSExtensionContext attachments here
    
    NSInteger length = self.contentText.length;
    
    self.charactersRemaining = @(maxCharactersAllowed - length);
    
    
    if (self.charactersRemaining.integerValue < 0) {
        
        return NO;
    }
    
    return YES;

}

- (void)didSelectPost {
    // This is called after the user selects Post. Do the upload of contentText and/or NSExtensionContext attachments.
    
    // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
    
    //提取数据
   // [self fetchItemDataAtBackground];
    
    NSArray *inputItems = self.extensionContext.inputItems;
    NSExtensionItem *item = inputItems.firstObject;//无论多少数据，实际上只有一个 NSExtensionItem 对象
    for (NSItemProvider *provider in item.attachments) {
        //completionHandler 是异步运行的
        NSString *dataType = provider.registeredTypeIdentifiers.firstObject;//实际上一个NSItemProvider里也只有一种数据类型
        
        /*if ([dataType isEqualToString:@"public.image"]) {
         [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(UIImage *image, NSError *error){
         //collect image...
         
         
         //数据共享
         NSUserDefaults *mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.com.hotShare"];
         
         [mySharedDefults setObject:image forKey:@"shareExtensionItem"];
         }];
         }else*/
        
        //数据共享
        NSUserDefaults *mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
        
        
        if ([dataType isEqualToString:@"public.plain-text"]){
            [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSString *contentText, NSError *error){
                //collect image...
                
                [mySharedDefults setObject:contentText forKey:@"shareExtensionItem"];
                
            }];
        }else if ([dataType isEqualToString:@"public.url"]){
            [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSURL *url, NSError *error){
                //collect url...
                
                [mySharedDefults setObject:url.absoluteString forKey:@"shareExtensionItem"];
                
            }];
        }else{
            
            NSLog(@"don't support data type: %@", dataType);
        }
        
        
        [mySharedDefults synchronize];
        
        
    }
    
    NSExtensionItem * outputItem = [item copy];
    
    outputItem.attributedContentText = [[NSAttributedString alloc] initWithString:self.contentText attributes:nil];
    
    NSArray * outPutitems= @[outputItem];
    
    //自定义的URLScheme
    NSString *customURL = @"hotShareApp://";
    
    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:customURL]]];
    
    [self.extensionContext completeRequestReturningItems:outPutitems completionHandler:nil];
    
    
    //[self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
    
}



- (NSArray *)configurationItems {
    // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
    SLComposeSheetConfigurationItem * oneItem = [[SLComposeSheetConfigurationItem alloc]init];
    oneItem.title = @"故事贴";
    oneItem.valuePending = NO;
    //return @[oneItem];
    
    return @[];
}


- (void)fetchItemDataAtBackground
{
    //后台获取
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        
        
        
    });
}


-(void)upLoadItemDataAtBackground{
    
    //上传数据
    NSExtensionItem *Item = [self.extensionContext.inputItems firstObject];
    
    //完成一些自己的操作 保存，添加 http请求
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration backgroundSessionConfigurationWithIdentifier:@"xxx.backgroundsession"];
    // To access the shared container you set up, use the sharedContainerIdentifier property on your configuration object.
    config.sharedContainerIdentifier = @"group.xxx";
    
    NSURLSession *mySession = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:nil];
    
    
    NSURL *url = [NSURL URLWithString:@"http:xxxx"];
    
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
    
    request.HTTPMethod = @"POST";
    
    
    NSDictionary *dic = @{@"item":Item};
    
    NSError *error = nil;
    
    NSData *data = [NSJSONSerialization dataWithJSONObject:dic options:kNilOptions error:&error];
    
    if (!error) {
        
        NSURLSessionUploadTask *uploadTask = [mySession uploadTaskWithRequest:request fromData:data completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
            
            if ([response respondsToSelector:@selector(statusCode)]) {
                
                if ([(NSHTTPURLResponse *)response statusCode] == 401) {
                    
                    dispatch_async(dispatch_get_main_queue(), ^{
                        
                        
                        NSLog(@"上传成功！");
                        
                        return;
                        
                        
                    });
                }
                
            }
            
        }];
        
        
        [uploadTask resume];
        
    }
}

-(void)URLSessionDidFinishEventsForBackgroundURLSession:(NSURLSession *)session{
    
    
}

@end
