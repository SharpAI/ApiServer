#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVPluginResult.h>

@interface UserInfo : CDVPlugin {}

- (void)setUserInfo:(CDVInvokedUrlCommand*)command;

- (void)getUserInfo:(CDVInvokedUrlCommand*)command;

@end