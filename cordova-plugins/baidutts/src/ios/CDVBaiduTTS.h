#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVPluginResult.h>

#import "BDTTSSynthesizerDelegate.h"
#import "BDTTSSynthesizer.h"
#ifdef NDEBUG
// do nothing
#define MyLog(...)
#else
#define MyLog NSLog
#endif
@interface CDVBaiduTTS : CDVPlugin <BDTTSSynthesizerDelegate> {
    NSString* lastCallbackId;
    NSString* callbackId;
}

- (void)speak:(CDVInvokedUrlCommand*)command;
- (void)stop:(CDVInvokedUrlCommand*)command;
@end
