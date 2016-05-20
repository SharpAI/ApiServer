#import "CDVCustomDialog.h"

#import "CustomDialogView.h"

@implementation CDVCustomDialog

-(void)show:(CDVInvokedUrlCommand*)command{
    
    CDVPluginResult* pluginResult = nil;
    
    NSDictionary* options = [command.arguments objectAtIndex:0];

    NSString *type  = [options objectForKey:@"type"];
    NSString *text = [options objectForKey:@"text"];
    NSArray *content = [options objectForKey:@"content"];
    
    CustomDialogView *dialog = [CustomDialogView shareInstance];
    
    if ([type isEqualToString:@"url"]) {
        [dialog.imageView removeFromSuperview];
        
        dialog.contentText.frame = CGRectMake(0, 45, 250, 100);
    }
    
    if ([type isEqualToString:@"image"]) {
        
        UIImage * image = [UIImage imageWithContentsOfFile:content[0]];
        dialog.imageView.image = image;
    }
    
    dialog.contentText.text = text?text:content[0];
    
//    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
//        
//        // 多线程中下载图像
//        NSData * imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:imagePath]];
//        
//        // 回到主线程完成UI设置
//        dispatch_async(dispatch_get_main_queue(), ^{
//            
//            UIImage * image = [UIImage imageWithData:imageData];
//            dialog.imageView.image = image;
//            
//        });
//        
//    });
    
    dialog.block = ^(BOOL isImport){
        NSString *scriptCall;
        
        if (isImport) {
            
            scriptCall  = [NSString stringWithFormat:
                           @"var data = {type:'%@',content:['%@']};editFromShare(data);window.plugins.shareExtension.emptyData(function(count){if(count===0){return Session.set('wait_import_count',false);}Session.set('wait_import_count',true);},function(){});"
                           ,type,content[0]];
        }
        else{
            scriptCall  = [NSString stringWithFormat:
                           @"window.plugins.shareExtension.emptyData(function(count){PUB.toast('删除成功！');if(count===0){return Session.set('wait_import_count',false);} Session.set('wait_import_count',true);},function(){});"];
        }
        
        [self.commandDelegate evalJs:scriptCall];
    };
    
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