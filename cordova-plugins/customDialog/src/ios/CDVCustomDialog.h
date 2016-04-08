#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVPluginResult.h>

@interface CDVCustomDialog : CDVPlugin {}

- (void)show:(CDVInvokedUrlCommand*)command;

-(void)hidden:(CDVInvokedUrlCommand*)command;

@end