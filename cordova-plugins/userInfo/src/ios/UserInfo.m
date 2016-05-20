#import "UserInfo.h"

@implementation UserInfo

-(void)setUserInfo:(CDVInvokedUrlCommand*)command{
    
    CDVPluginResult* pluginResult = nil;
  
    NSUserDefaults * mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
    
    NSString  *userId = [command.arguments objectAtIndex:0];
    
    [mySharedDefults setObject:userId forKey:@"userId"];
    
    if ([userId isEqualToString:@""]) {
        
        [mySharedDefults removeObjectForKey:@"shareExtensionItems"];
    }

    [mySharedDefults synchronize];
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)getUserInfo:(CDVInvokedUrlCommand*)command{
    
    CDVPluginResult* pluginResult = nil;
  
    NSUserDefaults * mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
    
    NSString  *userId = [mySharedDefults objectForKey:@"userId"];
 
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:userId];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end