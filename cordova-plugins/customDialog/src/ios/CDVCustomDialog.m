#import "CDVCustomDialog.h"

#import "CustomDialogView.h"

@implementation CDVCustomDialog

-(void)show:(CDVInvokedUrlCommand*)command{
    
    CDVPluginResult* pluginResult = nil;
    
    NSDictionary* options = [command.arguments objectAtIndex:0];

    NSString *url  = [options objectForKey:@"url"];
    NSString *title = [options objectForKey:@"title"];
    NSString *imagePath = [options objectForKey:@"imagePath"];
    
    CustomDialogView *dialog = [CustomDialogView shareInstance];
    
    dialog.url = url;
    
    dialog.contentText.text = title;
    
    NSURL *imageUrl = [NSURL URLWithString:imagePath];
    
    UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:imageUrl]];
    
    dialog.imageView.image = image;
    
    [[[[[UIApplication sharedApplication] keyWindow] subviews] lastObject] addSubview:dialog];
    //[self.webView addSubview:dialog];
    
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