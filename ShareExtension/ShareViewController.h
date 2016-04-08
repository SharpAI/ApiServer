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

@property (copy, nonatomic) NSString *entensionUrl;
@property (copy, nonatomic) NSString *contentText;
@property (copy, nonatomic) NSString *imagePath;
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