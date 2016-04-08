#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVPluginResult.h>

@interface ShareExtension : CDVPlugin {}

- (void)getShareData:(CDVInvokedUrlCommand*)command;

-(void)emptyData:(CDVInvokedUrlCommand*)command;

-(void)closeView:(CDVInvokedUrlCommand*)command;

@end