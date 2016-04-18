//
//  ViewController.m
//  hotShare
//
//  Created by aei on 4/11/16.
//
//

#import "ViewController.h"

#import "MBProgressHUD.h"
@interface ViewController ()

@end

@implementation ViewController


- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    self.view.backgroundColor = [UIColor colorWithWhite:0.0 alpha:0.3];
    
    MBProgressHUD *hud = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    
    //hud.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    
    hud.bezelView.backgroundColor = [UIColor whiteColor];
    
    hud.contentColor = [UIColor colorWithRed:30/255.0 green:144/255.0  blue:255/255.0 alpha:1];
    
    // Set the bar determinate mode to show task progress.
    hud.mode = MBProgressHUDModeDeterminateHorizontalBar;
    hud.label.text = NSLocalizedString(@" 发送中...", @"HUD loading title");
    
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        // Do something useful in the background and update the HUD periodically.
        [self doSomeWorkWithProgress];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            
            [self sendFinish];
            
        });
    });
}
-(void)doSomeWorkWithProgress{
    self.isFinish = NO;
    // This just increases the progress indicator in a loop.
    float progress = 0.0f;
    while (progress < 0.8f) {
        if (self.isFinish) break;
        if (![NetWork isEnable]) {
            
            break;
        }
        progress += 0.01f;
        dispatch_async(dispatch_get_main_queue(), ^{
            // Instead we could have also passed a reference to the HUD
            // to the HUD to myProgressTask as a method parameter.
            [MBProgressHUD HUDForView:self.view].progress = progress;
        });
        usleep(500000);
    }
    
    while (progress < 1.0f) {
        if (![NetWork isEnable]) {
            
            break;
        }
        progress += 0.01f;
        dispatch_async(dispatch_get_main_queue(), ^{
            // Instead we could have also passed a reference to the HUD
            // to the HUD to myProgressTask as a method parameter.
            [MBProgressHUD HUDForView:self.view].progress = progress;
        });
        usleep(5000);
    }
    
}

-(void)sendFinish{
    
    NSString *title;
    
    NSString *message;
    
    if (self.isFinish) {
        
        title = @"分享成功";
        message= @"可打开故事贴查看";
    }
    else{
        
        title = @"分享失败";
        message= @"请检查网络连接是否可用";
    }
    //提示框
    UIAlertController *alertController = [UIAlertController alertControllerWithTitle:title message:message preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        
        
        self.returnPostBlock(nil);
        
        //[self dismissViewControllerAnimated:YES completion:nil];
        
        
    }];
    
    [alertController addAction:okAction];
    
    [self presentViewController:alertController animated:YES completion:nil];
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
