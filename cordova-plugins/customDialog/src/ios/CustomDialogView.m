//
//  CustomDialogView.m
//  test
//
//  Created by aei on 4/8/16.
//  Copyright © 2016 actiontec. All rights reserved.
//

#import "CustomDialogView.h"

static CustomDialogView* _instance = nil;

@implementation CustomDialogView

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

+(instancetype) shareInstance
{
    static dispatch_once_t onceToken ;
    dispatch_once(&onceToken, ^{
        _instance = [[self alloc] initWithFrame:[[UIScreen mainScreen] bounds]] ;
    }) ;
    
    return _instance ;
}

-(instancetype)initWithFrame:(CGRect)frame{
    
    if (self = [super initWithFrame:frame]) {
        
        self.backgroundColor = [UIColor colorWithWhite:0.0 alpha:0.3];
        
        [self createSubView];
    }
    return self;
}

-(void)createSubView{
    
    UIView *backGround = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 250, 150)];
    
    backGround.backgroundColor = [UIColor whiteColor];
    
    backGround.layer.cornerRadius = 10;
    
    backGround.layer.masksToBounds = YES;
    
    backGround.center = self.center;
    
    [self addSubview:backGround];
    
    UINavigationBar *customNavBar = [[UINavigationBar alloc] initWithFrame:CGRectMake(0, 0, backGround.frame.size.width, 40)];
    
    [customNavBar setTitleTextAttributes:[NSDictionary dictionaryWithObjectsAndKeys:
                                         
                                         [UIFont fontWithName:@"Helvetica" size:15.0], NSFontAttributeName,
                                         
                                          nil]];
    
    UINavigationItem *newItem = [[UINavigationItem alloc] init];
    UIBarButtonItem *waitBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"删除",nil)  style:UIBarButtonItemStylePlain target:self action:@selector(waitButtonTapped:)];
    [waitBarButtonItem setTitleTextAttributes:[NSDictionary dictionaryWithObjectsAndKeys:
                                        
                                        [UIFont fontWithName:@"Helvetica" size:15.0], NSFontAttributeName,
                                        
                                        nil] 
     
                              forState:UIControlStateNormal];
    UIBarButtonItem *startBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"导入",nil)  style:UIBarButtonItemStyleDone target:self action:@selector(startButtonTapped:)];
    [startBarButtonItem setTitleTextAttributes:[NSDictionary dictionaryWithObjectsAndKeys:
                                        
                                        [UIFont fontWithName:@"Helvetica" size:15.0], NSFontAttributeName,
                                        
                                        nil] 
     
                              forState:UIControlStateNormal];
    newItem.title = @"现在开始导入吗";
    
    newItem.leftBarButtonItem = waitBarButtonItem;
    newItem.rightBarButtonItem = startBarButtonItem;
    [customNavBar setItems:@[newItem]];
    
    [backGround addSubview:customNavBar];
    
    self.contentText = [[UITextView alloc] initWithFrame:CGRectMake(0, 45, 165, 100)];
    self.contentText.font = [UIFont systemFontOfSize:15.0];
    //是否支持滚动
    self.contentText.scrollEnabled = YES;
    //确保静态文本不可编辑
    self.contentText.editable = NO;
    //self.contentText.backgroundColor = [UIColor yellowColor];
    [backGround addSubview:self.contentText];
    
    self.imageView = [[UIImageView alloc] initWithFrame:CGRectMake(170, 58, 70, 70)];
    self.imageView.backgroundColor = [UIColor colorWithWhite:0.0f alpha:0.1];
    [backGround addSubview:self.imageView];
}

-(void)waitButtonTapped:(UIBarButtonItem *)sender{
    
    self.block(NO);
    
    [self removeFromSuperview];
}


-(void)startButtonTapped:(UIBarButtonItem *)sender{
    self.block(YES);
    
    [self removeFromSuperview];
}

@end
