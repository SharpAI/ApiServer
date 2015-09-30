/********* com.meteor.cordova-update Cordova Plugin Implementation *******/

#import <Cordova/CDV.h>

#import "METEORCordovaURLProtocol.h"

@interface CordovaUpdate : CDVPlugin {
}

- (void)startServer:(CDVInvokedUrlCommand*)command;
- (void)setLocalPath:(CDVInvokedUrlCommand*)command;


@end
