#import "ShareExtension.h"

#ifdef TARGET_IS_EXTENSION // if it's  defined
    #import "ShareViewController.h"
#endif

@implementation ShareExtension

-(void)getShareData:(CDVInvokedUrlCommand*)command{
    
    CDVPluginResult* pluginResult = nil;
  
    NSUserDefaults * mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
    
    NSArray *ary = [mySharedDefults objectForKey:@"shareExtensionItems"];
    
    if (ary.count) {
        
        NSLog(@"shareExtensionItem =======  %@",ary[0]);
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:ary[0]];
    }
    else{
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


-(void)emptyData:(CDVInvokedUrlCommand *)command{
    
    CDVPluginResult* pluginResult = nil;
    
    NSUserDefaults * mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
    
    NSMutableArray  *ary =[NSMutableArray arrayWithArray:[mySharedDefults objectForKey:@"shareExtensionItems"]];
    
    if (ary.count) {
        
        [ary removeObjectAtIndex:0];
        
        [mySharedDefults setObject:ary forKey:@"shareExtensionItems"];
        
        [mySharedDefults synchronize];
    }

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:ary.count];
    
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