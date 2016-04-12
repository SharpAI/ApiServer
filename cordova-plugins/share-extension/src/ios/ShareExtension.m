#import "ShareExtension.h"

#ifdef TARGET_IS_EXTENSION // if it's  defined
    #import "ShareViewController.h"
#endif

@implementation ShareExtension

-(void)getShareData:(CDVInvokedUrlCommand*)command{
    
    CDVPluginResult* pluginResult = nil;
  
    NSUserDefaults * mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
    
    NSDictionary *dic = [mySharedDefults objectForKey:@"shareExtensionItem"];
    
   // NSLog(@"shareExtensionItem =======  %@",dic);
    
    //NSString *url = dic[@"url"];
     NSString *url = [mySharedDefults objectForKey:@"shareUrl"];
    
    if (url) {
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:url];
    }
    else{
        
        //pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@""];
    }
    
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


-(void)emptyData:(CDVInvokedUrlCommand *)command{
    
    CDVPluginResult* pluginResult = nil;
    
    NSUserDefaults * mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
  
    [mySharedDefults removeObjectForKey:@"shareUrl"];
    
    [mySharedDefults synchronize];
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@""];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
}

-(void)closeView:(CDVInvokedUrlCommand *)command{
    
    NSString  *error = [command.arguments objectAtIndex:0];
    
#ifdef TARGET_IS_EXTENSION // if it's  defined
    CDVPluginResult *pluginResult = [ CDVPluginResult resultWithStatus : CDVCommandStatus_OK ];
  
    [ShareViewController shareResult:error Handle:[ShareViewController getShareVaribleHandle]];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
#endif
   
}
@end