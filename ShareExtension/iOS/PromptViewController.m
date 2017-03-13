//
//  PromptViewController.m
//  hotShare
//
//  Created by aei on 5/19/16.
//
//

#import "PromptViewController.h"
#import "MBProgressHUD.h"


#define  STATUS_FAILED @"failed"
#define STATUS_SUCCESS @"succ"
#define STATUS_IMPORTING @"importing"
@interface PromptViewController ()<MBProgressHUDDelegate>

@end

@implementation PromptViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    self.view.backgroundColor = [UIColor colorWithWhite:0.0 alpha:0.3];
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    
    hud.bezelView.backgroundColor = [UIColor whiteColor];
    
    hud.contentColor = [UIColor colorWithRed:37/255.0 green:171/255.0 blue:236/255.0 alpha:1];
    
    // Set the annular determinate mode to show task progress.
    hud.label.adjustsFontSizeToFitWidth = YES;
    //hud.label.font = [UIFont systemFontOfSize:11];
    
    hud.delegate = self;
    
    hud.mode = MBProgressHUDModeText;
    
    hud.offset = CGPointMake(0.f, MBProgressMaxOffset/4.f);
    
    [hud hideAnimated:YES afterDelay:5.f];
    
    if ([self.type isEqualToString:@"url"]) {
        
        if ([_status isEqualToString:STATUS_SUCCESS]) {
            hud.label.text = NSLocalizedString(@"发送成功，点击这里打开故事贴查看", @"HUD message title");
        }
        else if ([_status isEqualToString:STATUS_FAILED]){
            hud.label.text = NSLocalizedString(@"发送失败，你可以重新尝试分享", @"HUD message title");
        }
    }
    else{
        
        hud.label.text = NSLocalizedString(@"发送成功，点击这里打开故事贴编辑。", @"HUD message title");
        
        // Move to bottm center.
    }
    
    UITapGestureRecognizer *tapGesture=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(onClickUI:)];
    
    hud.backgroundView.userInteractionEnabled=YES;
    
    [hud.backgroundView addGestureRecognizer:tapGesture];
    
    UITapGestureRecognizer *tapLabelGesture=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(onClickUILabel:)];
    
    hud.bezelView.userInteractionEnabled=YES;
    
    [hud.bezelView addGestureRecognizer:tapLabelGesture];
}

#pragma MBProgressHUDDelegate
- (void)hudWasHidden:(MBProgressHUD *)hud{
    
    self.block();
}
-(void)onClickUI:(UITapGestureRecognizer *)sender{
    
    self.block();
    
}

-(void)onClickUILabel:(UITapGestureRecognizer *)sender{
    
    if ([_status isEqualToString:STATUS_FAILED]) {
        
        return self.block();
    }
  
    NSString *customURL = @"hotshare://";
    
    UIResponder* responder = self;
    while ((responder = [responder nextResponder]) != nil)
    {
        NSLog(@"responder = %@", responder);
        if([responder respondsToSelector:@selector(openURL:)] == YES)
        {
            [responder performSelector:@selector(openURL:) withObject:[NSURL URLWithString:customURL]];
        }
    }
    
    self.block();
    
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
