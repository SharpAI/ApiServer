//
//  ViewController.m
//  hotShare
//
//  Created by aei on 4/5/16.
//
//

#import "ViewController.h"
#import "ShareViewController.h"

@interface ViewController ()
{
    ShareViewController *progressView;
    
    NSString *entensionURL;
    
    NSUserDefaults *mySharedDefults;
    
    NSString  *userId;
    
    NSString  *imagePath;
}

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    //数据共享
    if (!mySharedDefults) {
        
        mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
    }
    
    userId = [mySharedDefults objectForKey:@"userId"];
    
    if (!userId || [userId isEqualToString:@""]) {
        
        //提示框
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"故事贴" message:@"抱歉，请先打开故事贴，并登录，才可以使用分享功能。" preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
           
            
            [self.extensionContext completeRequestReturningItems:nil completionHandler:nil];
            
        }];
        
        [alertController addAction:okAction];
        
        [self presentViewController:alertController animated:YES completion:nil];
        
        return;
        
    }

    //progressView = (ShareViewController *)[[UIStoryboard storyboardWithName:@"MainInterface" bundle:nil] instantiateViewControllerWithIdentifier:@"progressView"];
    progressView = [[ShareViewController alloc] init];
    [self fetchItemDataAtBackground];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


-(void) viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    self.customNavBar = [[UINavigationBar alloc] initWithFrame:self.navigationController.navigationBar.bounds];
    self.customNavBar = [[UINavigationBar alloc] init];
    //使用代码布局 需要将这个属性设置为NO
    self.customNavBar.translatesAutoresizingMaskIntoConstraints = NO;
    NSLayoutConstraint * constraintl = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.navigationController.view attribute:NSLayoutAttributeLeft multiplier:1 constant:0];
    NSLayoutConstraint * constraintr = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.navigationController.view attribute:NSLayoutAttributeRight multiplier:1 constant:0];
    NSLayoutConstraint * constraintt = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:self.navigationController.view attribute:NSLayoutAttributeTop multiplier:1 constant:0];
    //创建高度约束
    NSLayoutConstraint * constraintb = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.textView attribute:NSLayoutAttributeTop multiplier:1 constant:0];
     //添加约束之前，必须将视图加在父视图上
    [self.navigationController.navigationBar removeFromSuperview];
    [self.navigationController.view addSubview:self.customNavBar];
    [self.view addConstraints:@[constraintl,constraintr,constraintt,constraintb]];
    
    [self setCancelSaveNavigationItem];
}

-(void)setCancelSaveNavigationItem
{
    UINavigationItem *newItem = [[UINavigationItem alloc] init];
    UIBarButtonItem *cancelBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"取消",nil)  style:UIBarButtonItemStylePlain target:self action:@selector(cancelButtonTapped:)];
    UIBarButtonItem *postBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"发送",nil)  style:UIBarButtonItemStyleDone target:self action:@selector(postButtonTapped:)];
    newItem.title = @"故事贴";
    newItem.leftBarButtonItem = cancelBarButtonItem;
    newItem.rightBarButtonItem = postBarButtonItem;
    [self.customNavBar setItems:@[newItem]];
    [self.navigationItem setBackBarButtonItem:cancelBarButtonItem];
    [self.navigationItem setRightBarButtonItem:postBarButtonItem];
    //    if(self.item.value == nil){
    //        saveBarButtonItem.enabled = NO;
    //    }
}

-(void)postButtonTapped:(id)sender{
    
    if (entensionURL) {
         
        progressView.entensionUrl = entensionURL;
        progressView.contentText = self.contentText;
        progressView.imagePath = imagePath;
        progressView.returnPostBlock = ^(NSString *res){
            
            [self cancel];
        };
        
        [self presentViewController:progressView animated:NO completion:nil];
    }
    
}

- (void)cancelButtonTapped:(id)sender {
    [self cancel];
}

-(void)fetchItemDataAtBackground{
    
    //后台获取
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSArray *inputItems = self.extensionContext.inputItems;
        NSExtensionItem *item = inputItems.firstObject;//无论多少数据，实际上只有一个 NSExtensionItem 对象
        for (NSItemProvider *provider in item.attachments) {
            //completionHandler 是异步运行的
            NSString *dataType = provider.registeredTypeIdentifiers.firstObject;//实际上一个NSItemProvider里也只有一种数据类型
            if ([dataType isEqualToString:@"public.image"]) {
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(UIImage *image, NSError *error){
                    //collect image...
                
                }];
            }else if ([dataType isEqualToString:@"public.plain-text"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSString *contentText, NSError *error){
                    //collect image...
                    
                }];
            }else if ([dataType isEqualToString:@"public.url"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(NSURL *url, NSError *error){
                    //collect url...
                    if (error) {
                        NSLog(@"ERROR: %@", error);
                    }
                    entensionURL = [url absoluteString];
                    
                }];
            }else if ([dataType isEqualToString:@"com.apple.property-list"]){
                [provider loadItemForTypeIdentifier:dataType options:nil completionHandler:^(id<NSSecureCoding> item, NSError *error){
                    //collect url...
                    if (error) {
                        NSLog(@"ERROR: %@", error);
                    }
                    NSDictionary *results = (NSDictionary *)item;
                                  
                    NSString *imgPath = [[results objectForKey: NSExtensionJavaScriptPreprocessingResultsKey ] objectForKey:@"imagePath"];
                                  
                    NSLog(@"%@", imgPath);
                    
                    imagePath = imgPath;
                    
                }];
            }else 
                NSLog(@"don't support data type: %@", dataType);
        }
    });
    
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/
- (BOOL)isContentValid {
    // Do validation of contentText and/or NSExtensionContext attachments here
    //[self fetchItemDataAtBackground];
    return YES;
}




- (void)didSelectPost {
    // This is called after the user selects Post. Do the upload of contentText and/or NSExtensionContext attachments.
    
    // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
    [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
}

- (NSArray *)configurationItems {
    // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
    return @[];
}

@end
