//
//  ViewController.h
//  hotShare
//
//  Created by aei on 4/11/16.
//
//

#import <UIKit/UIKit.h>
#import "NetWork.h"

typedef void (^ReturnPostBlock)(NSString *result);

@interface ViewController : UIViewController

@property (assign, nonatomic) BOOL isFinish;
@property (nonatomic, copy) ReturnPostBlock returnPostBlock;


@end
