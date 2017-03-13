//
//  PromptViewController.h
//  hotShare
//
//  Created by aei on 5/19/16.
//
//

#import <UIKit/UIKit.h>

@interface PromptViewController : UIViewController

//用以标识分享的类型是图片还是链接
@property(nonatomic,strong) NSString *type;

//导入的状态
@property(nonatomic,strong) NSString *status;

@property(copy,nonatomic)void (^block)();

@end
