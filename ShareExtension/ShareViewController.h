//
//  ShareViewController.h
//  shareTest
//
//  Created by Lokesh Patel on 27/10/15.
//
//
//@property NSURL *imageExtensionUrl;
#import <UIKit/UIKit.h>
#import <Cordova/CDVViewController.h>
#import <Cordova/CDVCommandDelegateImpl.h>
#import <Cordova/CDVCommandQueue.h>


typedef void (^ReturnPostBlock)(NSString *result);

@interface ShareViewController : CDVViewController

@property (assign, nonatomic) NSString *entensionUrl;
@property (assign, nonatomic) NSString *contentText;
@property (nonatomic, copy) ReturnPostBlock returnPostBlock;


@property (assign, nonatomic) BOOL isFinish;


+ (void) setShareVaribleHandle:(ShareViewController *)responder;
//Getter method
+ (ShareViewController*) getShareVaribleHandle;

+ (void) shareResult:(NSString *)error Handle:(ShareViewController *)responder;


@end
@interface ShareViewCommandDelegate : CDVCommandDelegateImpl
@end

@interface ShareViewCommandQueue : CDVCommandQueue
@end