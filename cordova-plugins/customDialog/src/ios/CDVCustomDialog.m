#import "CDVCustomDialog.h"

#import "CustomDialogView.h"

@implementation CDVCustomDialog

-(void)show:(CDVInvokedUrlCommand*)command{
    
    CDVPluginResult* pluginResult = nil;
    
    NSDictionary* options = [command.arguments objectAtIndex:0];

    NSString *url  = [options objectForKey:@"url"];
    NSString *title = [options objectForKey:@"title"];
    NSString *imagePath = [options objectForKey:@"imagePath"];
    NSString *ID = [options objectForKey:@"_id"];
    
    CustomDialogView *dialog = [CustomDialogView shareInstance];
    
    dialog.url = url;
    dialog.ID = ID;
    
    if (!imagePath) {
        [dialog.imageView removeFromSuperview];
        
        dialog.contentText.frame = CGRectMake(0, 45, 250, 100);
    }
    
    dialog.contentText.text = title?title:url;
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        
        // 多线程中下载图像
        NSData * imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:imagePath]];
        
        // 回到主线程完成UI设置
        dispatch_async(dispatch_get_main_queue(), ^{
            
            UIImage * image = [UIImage imageWithData:imageData];
            dialog.imageView.image = image;
            
        });
        
    });
    
    //[[[[[UIApplication sharedApplication] keyWindow] subviews] lastObject] addSubview:dialog];
    [self.webView addSubview:dialog];
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


-(void)hidden:(CDVInvokedUrlCommand *)command{
    
    CDVPluginResult* pluginResult = nil;
    
    CustomDialogView *dialog = [CustomDialogView shareInstance];
    
    [dialog removeFromSuperview];
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
}


@end