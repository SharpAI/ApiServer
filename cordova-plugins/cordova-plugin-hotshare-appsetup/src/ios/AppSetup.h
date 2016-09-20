#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVPluginResult.h>

@interface AppSetup : CDVPlugin {}

- (void) getVersion:(CDVInvokedUrlCommand*)command;

@end