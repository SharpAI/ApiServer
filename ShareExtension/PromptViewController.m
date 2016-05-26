//
//  PromptViewController.m
//  hotShare
//
//  Created by aei on 5/19/16.
//
//

#import "PromptViewController.h"
#import "MBProgressHUD.h"

@interface PromptViewController ()<MBProgressHUDDelegate>
@end

@implementation PromptViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    self.view.backgroundColor = [UIColor colorWithWhite:0.0 alpha:0.3];
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    
    hud.bezelView.backgroundColor = [UIColor whiteColor];
    
    hud.contentColor = [UIColor colorWithRed:30/255.0 green:144/255.0  blue:255/255.0 alpha:1];
    
    // Set the annular determinate mode to show task progress.
    hud.mode = MBProgressHUDModeText;
    hud.label.text = NSLocalizedString(@"保存成功，可打开故事贴编辑。", @"HUD message title");
    // Move to bottm center.
    hud.offset = CGPointMake(0.f, MBProgressMaxOffset/4.f);
    
    hud.delegate = self;
    
    [hud hideAnimated:YES afterDelay:5.f];
    
    
    UITapGestureRecognizer *tapGesture=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(onClickUI:)];
    
    hud.userInteractionEnabled=YES;
    
    [hud addGestureRecognizer:tapGesture];
    
}

#pragma MBProgressHUDDelegate
- (void)hudWasHidden:(MBProgressHUD *)hud{
    
    self.block();
}


-(void)onClickUI:(UITapGestureRecognizer *)sender{
  
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
