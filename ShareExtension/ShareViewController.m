//
//  ShareViewController.m
//  shareEx
//
//  Created by aei on 5/19/16.
//  Copyright © 2016 actiontec. All rights reserved.
//

#import "ShareViewController.h"
#import "PromptViewController.h"

@interface ShareViewController ()

{
    NSString *userId;
    NSString *imagePath;
    NSString *entensionTitle;
    NSString *entensionURL;
    NSMutableDictionary *extensionItem;
    
    UIBarButtonItem *saveBarButtonItem;
}
@property (strong, nonatomic)NSUserDefaults *mySharedDefults;
@property (strong, nonatomic) UINavigationBar *customNavBar;
@property (strong, nonatomic)PromptViewController* promptViewController;

@end



@implementation ShareViewController

- (BOOL)isContentValid {
    // Do validation of contentText and/or NSExtensionContext attachments here
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    //数据共享
    if (!_mySharedDefults) {
        
        _mySharedDefults = [[NSUserDefaults alloc] initWithSuiteName:@"group.org.hotsharetest"];
        
    }
    
    userId = [_mySharedDefults objectForKey:@"userId"];
    
    if (!userId || [userId isEqualToString:@""]) {
        
        //提示框
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"故事贴" message:@"抱歉，请先打开故事贴，并登录，才可以使用分享功能。" preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"我知道了" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            [self.extensionContext completeRequestReturningItems:nil completionHandler:nil];
            
        }];
        
        [alertController addAction:okAction];
        
        [self presentViewController:alertController animated:YES completion:nil];
        
    }
    else{
        
        extensionItem = [[NSMutableDictionary alloc] init];
        
    }
    
}


-(void) viewWillAppear:(BOOL)animated
{
    
    [super viewWillAppear:animated];
    
    if (!self.customNavBar) {
        
       self.customNavBar = [[UINavigationBar alloc] init];
        
       [self setCancelSaveNavigationItem];
        
       [self.navigationController.navigationBar removeFromSuperview];
        
       [self.navigationController.view addSubview:self.customNavBar];
        //使用Auto Layout约束，禁止将Autoresizing Mask转换为约束
        [self.customNavBar setTranslatesAutoresizingMaskIntoConstraints:NO];
        
        NSLayoutConstraint *contraint1 = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeTop relatedBy:NSLayoutRelationEqual toItem:self.navigationController.view attribute:NSLayoutAttributeTop multiplier:1.0 constant:0.0];
        
        NSLayoutConstraint *contraint2 = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeLeft relatedBy:NSLayoutRelationEqual toItem:self.navigationController.view attribute:NSLayoutAttributeLeft multiplier:1.0 constant:0.0];
        
        NSLayoutConstraint *contraint3 = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeBottom relatedBy:NSLayoutRelationEqual toItem:self.textView attribute:NSLayoutAttributeTop multiplier:1.0 constant:0.0];
        
        NSLayoutConstraint *contraint4 = [NSLayoutConstraint constraintWithItem:self.customNavBar attribute:NSLayoutAttributeRight relatedBy:NSLayoutRelationEqual toItem:self.navigationController.view attribute:NSLayoutAttributeRight multiplier:1.0 constant:0.0];
        //把约束添加到父视图上
        NSArray *array = @[contraint1, contraint2, contraint3, contraint4];
        [self.navigationController.view addConstraints:array];
        
    }
    
    //self.textView.editable = NO;
    
    [self fetchItemDataAtBackground];

}

-(void)setCancelSaveNavigationItem
{
    UINavigationItem *newItem = [[UINavigationItem alloc] init];
    UIBarButtonItem *cancelBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"取消",nil)  style:UIBarButtonItemStylePlain target:self action:@selector(cancelButtonTapped:)];
    saveBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:NSLocalizedString(@"保存",nil)  style:UIBarButtonItemStyleDone target:self action:@selector(saveButtonTapped:)];
    newItem.leftBarButtonItem = cancelBarButtonItem;
    newItem.rightBarButtonItem = saveBarButtonItem;
    newItem.title = @"故事贴";
    [self.customNavBar setItems:@[newItem]];
    [self.navigationItem setBackBarButtonItem:cancelBarButtonItem];
    [self.navigationItem setRightBarButtonItem:saveBarButtonItem];
    saveBarButtonItem.enabled = false;
    
}
- (void)cancelButtonTapped:(id)sender {
    [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
}

- (void)saveButtonTapped:(id)sender {
    
    NSMutableArray  *ary =[NSMutableArray arrayWithArray:[self.mySharedDefults objectForKey:@"shareExtensionItems"]];
    
    if (!ary) {
        
        ary  = [[NSMutableArray alloc] init];
    }
    [extensionItem setObject:self.textView.text forKey:@"text"];
    
    [ary addObject:extensionItem];
    
    [self.mySharedDefults setObject:ary forKey:@"shareExtensionItems"];
    
    [self.mySharedDefults synchronize];
    
    [self showDialog];
    
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
                    
                    NSLog(@"entensionURL:%@", entensionURL);
                    
                    [extensionItem setObject:@"url" forKey:@"type"];
                    
                    NSArray *ary = @[entensionURL];
                    
                    [extensionItem setObject:ary forKey:@"content"];
                    
                    dispatch_async(dispatch_get_main_queue(), ^{
                        
                        saveBarButtonItem.enabled = true;
                        
                    });
                    
                    
                }];
            }else
                NSLog(@"don't support data type: %@", dataType);
        }
    });
    
}


-(void)showDialog{
    
    if(!self.promptViewController){
        
        self.promptViewController = [[PromptViewController alloc] init];
        
        __block ShareViewController *responder = self;
        
        self.promptViewController.block=^(){
            
            [responder.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
        };
    }
    
    [self presentViewController:self.promptViewController animated:NO completion:nil];
    
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

