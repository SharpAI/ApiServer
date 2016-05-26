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

-(void)deleteFiles:(CDVInvokedUrlCommand *)command{
    
    CDVPluginResult* pluginResult = nil;
    
    NSFileManager *fileMgr = [NSFileManager defaultManager];
    
    NSError *error = nil;

    NSArray  *files = [command.arguments objectAtIndex:0];
    
    if (![files isKindOfClass:[NSNull class]]) {
        
        if (files&&files.count) {
            
            for (NSString *file in files) {
                
                if ([file hasPrefix:@"file://"] == 1 ) {
                    
                    NSString *filePath = [file substringFromIndex:7];
                    
                    NSLog(@"string2:%@",filePath);
                    if (![fileMgr removeItemAtPath:filePath error:&error]) {
                        NSLog(@"Unable to delete file:%@",[error localizedDescription]);
                    }
                }
                
            }
            
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            
            return;
        }
    }
    

    NSURL *containerURL = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:@"group.org.hotsharetest"];

    NSString *docsPath = [[containerURL path] stringByAppendingPathComponent:@"Documents"];
    
    NSUserDefaults * mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
    
    NSMutableArray  *ary =[NSMutableArray arrayWithArray:[mySharedDefults objectForKey:@"shareExtensionItems"]];
    
    if (ary.count==0) {
        
        if (![fileMgr removeItemAtPath:docsPath error:&error]) {
            NSLog(@"Unable to delete file:%@",[error localizedDescription]);
        }
        NSLog(@"Documentsdirectory:  %@",[fileMgr contentsOfDirectoryAtPath:docsPath error:&error]);
    }
    else{
        
        NSArray *contents = [fileMgr contentsOfDirectoryAtPath:docsPath error:&error];
        
        NSLog(@"Documentsdirectory:  %@",[fileMgr contentsOfDirectoryAtPath:docsPath error:&error]);
        NSEnumerator *e = [contents objectEnumerator];
        NSString *filename;
        while ((filename = [e nextObject])) {
            
            bool isExsit = false;
            
            for (NSDictionary *dic in ary) {
                
                NSArray *content = dic[@"content"];
                
                for (NSString *item in content) {
                    
                    if ([item rangeOfString:filename].location != NSNotFound ) {
                        
                        isExsit = true;
                        
                        break;
                    }
                }
                if (isExsit) {
                    
                    break;
                }

            }
            
            if (!isExsit) {
                if (![fileMgr removeItemAtPath:[docsPath stringByAppendingPathComponent:filename] error:&error]) {
                    NSLog(@"Unable to delete file:%@",[error localizedDescription]);
                }
                NSLog(@"Documentsdirectory:  %@",[fileMgr contentsOfDirectoryAtPath:docsPath error:&error]);

            }
        }

    } 
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
}
@end