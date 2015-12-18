//
//  ShareViewController.m
//  ShareExtension
//
//  Created by aei on 12/9/15.
//
//

#import "ShareViewController.h"

#import "AppDelegate.h"

@interface ShareViewController ()<UIWebViewDelegate>

{
    //UIWebView *webView;
    NSUserDefaults *mySharedDefults;
    
    NSMutableDictionary *myDictionary;
    
}

@end

@implementation ShareViewController



static NSInteger const maxCharactersAllowed = 140;  //手动设置字符数上限


-(void)viewDidLoad{
    
    [super viewDidLoad];
    
    //
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
    
    
    NSArray *inputItems = self.extensionContext.inputItems;
    NSExtensionItem *item = inputItems.firstObject;//无论多少数据，实际上只有一个 NSExtensionItem 对象
    
    //数据共享
    if (!mySharedDefults) {
        
        mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
        
        myDictionary = [[NSMutableDictionary alloc] init];
    }
    
    for (NSItemProvider *provider in item.attachments) {
        //completionHandler 是异步运行的
        NSString *dataType = provider.registeredTypeIdentifiers.firstObject;//实际上一个NSItemProvider里也只有一种数据类型
        
        if ([dataType isEqualToString:@"public.jpeg"]) {
         [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(UIImage *image, NSError *error){
         //collect image...
         
             if(image) {
                 dispatch_async(dispatch_get_main_queue(), ^{
                     //photo = image;
                     [myDictionary setObject:UIImageJPEGRepresentation(image, 0.8) forKey:@"image"];
                     
                     [mySharedDefults setObject:myDictionary forKey:@"shareExtensionItem"];
                     
                     [mySharedDefults synchronize];
                     
                 });
             }
         }];
         
            
         }else if ([dataType isEqualToString:@"public.plain-text"]){
            [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSString *contentText, NSError *error){
                //collect image...
                
                if(contentText) {
                    dispatch_async(dispatch_get_main_queue(), ^{
                        //photo = image;
                        [myDictionary setObject:contentText forKey:@"text"];
                        
                        [mySharedDefults setObject:myDictionary forKey:@"shareExtensionItem"];
                        
                        [mySharedDefults synchronize];
                    });
                }
                
                
            }];
        }else if ([dataType isEqualToString:@"public.url"]){
            [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSURL *url, NSError *error){
                //collect url...
                if(url) {
                    dispatch_async(dispatch_get_main_queue(), ^{
                        //photo = image;
                        [myDictionary setObject:url.absoluteString forKey:@"url"];
                        
                        [mySharedDefults setObject:myDictionary forKey:@"shareExtensionItem"];
                        
                        [mySharedDefults synchronize];
                    });
                }
                
            }];
        }else{
            
            NSLog(@"don't support data type: %@", dataType);
        }
        
        [myDictionary setObject:self.contentText forKey:@"contentText"];
        
        
        
        
        
    }
//    
//    NSExtensionItem * outputItem = [item copy];
//    
//    outputItem.attributedContentText = [[NSAttributedString alloc] initWithString:self.contentText attributes:nil];
//    
//    NSArray * outPutitems= @[outputItem];
    
    //自定义的URLScheme
    NSString *customURL = @"hotshare://";
    
    
    /*UIWebView *webView = [[UIWebView alloc] initWithFrame:CGRectZero];
    
    [self.view addSubview:webView];
    
    //refresh
    NSString * content = [NSString stringWithFormat : @"<head><meta http-equiv='com.actiontec.hotshare' content='0; URL=%@'></head>", customURL];
    
    [webView loadHTMLString:content baseURL:nil];
    
    [webView performSelector:@selector(removeFromSuperview) withObject:nil afterDelay:2.0];*/
    
    //[webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:customURL]]];
    
    UIResponder* responder = self;
    while ((responder = [responder nextResponder]) != nil)
    {
        NSLog(@"responder = %@", responder);
        if([responder respondsToSelector:@selector(openURL:)] == YES)
        {
            [responder performSelector:@selector(openURL:) withObject:[NSURL URLWithString:customURL]];
        }
    }
 
    
    [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
    
}



- (NSArray *)configurationItems {
    // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
    SLComposeSheetConfigurationItem * oneItem = [[SLComposeSheetConfigurationItem alloc]init];
    oneItem.title = @"故事贴";
    oneItem.valuePending = NO;
    //return @[oneItem];
    
    return @[];
}


@end
