#import "CDVCustomDialog.h"

#import "CustomDialogView.h"

@implementation CDVCustomDialog

-(void)show:(CDVInvokedUrlCommand*)command{
    
    CDVPluginResult* pluginResult = nil;
    
    NSDictionary* options = [command.arguments objectAtIndex:0];
    
    NSString *type  = [options objectForKey:@"type"];
    NSString *text = [options objectForKey:@"text"];
    NSString *imageUrl = [options objectForKey:@"imageUrl"];
    NSArray *content = [options objectForKey:@"content"];
    
    CustomDialogView *dialog = [CustomDialogView shareInstance];
    
    if ([type isEqualToString:@"url"]) {
        if (imageUrl) {
            
            [dialog.imageView setFrame:CGRectMake(170, 58, 70, 70)];
            
            dialog.contentText.frame = CGRectMake(0, 45, 165, 100);
            
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                
                // 多线程中下载图像
                NSData * imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:imageUrl]];
                
                // 回到主线程完成UI设置
                dispatch_async(dispatch_get_main_queue(), ^{
                    
                    UIImage * image = [UIImage imageWithData:imageData];
                    dialog.imageView.image = image;
                    
                });
                
            });
        }
        else{
            
            [dialog.imageView setFrame:CGRectZero];
            
            dialog.contentText.frame = CGRectMake(0, 45, 250, 100);
        }
        
        if ([text isEqualToString:@""]) {
            dialog.contentText.text = content[0];
        }
        else{
            dialog.contentText.text = text;
        }
    }
    
    if ([type isEqualToString:@"image"]) {
        
        NSLog(@"imagePath:%@",content[0]);
        UIImage * image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:content[0]]]];
        dialog.imageView.image = image;
        dialog.contentText.text = text;
    }
    
    dialog.block = ^(BOOL isImport){
        NSString *scriptCall;
        
        NSMutableString   *items = [[NSMutableString alloc] initWithFormat:@"'%@'",content[0]];
        
        for (int i = 1; i<content.count; i++) {
            
            [items appendFormat:@",'%@'",content[i]];
        }
        NSLog(@"%@",items);
        
        if (isImport) {
            
            scriptCall  = [NSString stringWithFormat:
                           @"var data = {type:'%@',content:[%@]};editFromShare(data);window.plugins.shareExtension.emptyData(function(count){if(count===0){return Session.set('wait_import_count',false);}Session.set('wait_import_count',true);},function(){});"
                           ,type,items];
        }
        else{
            scriptCall  = [NSString stringWithFormat:
                           @"window.plugins.shareExtension.deleteFiles([%@]);window.plugins.shareExtension.emptyData(function(count){PUB.toast('删除成功！');if(count===0){return Session.set('wait_import_count',false);} Session.set('wait_import_count',true);},function(){});",items];
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