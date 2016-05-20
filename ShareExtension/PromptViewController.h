//
//  PromptViewController.h
//  hotShare
//
//  Created by aei on 5/19/16.
//
//

#import <UIKit/UIKit.h>

@interface PromptViewController : UIViewController

@property(copy,nonatomic)void (^block)(void);

@end
